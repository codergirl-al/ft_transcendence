import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
// import { dbLogger } from "../conf/logger";

let fastify: FastifyInstance;
interface LoginRequestBody {
	username: string;
	avatar: string;
}
export interface RequestParams {
	name: string;
	id: string;
}
export interface UserData {
	id: Number;
	username: string;
	image_url: string;
	email: string;
}

export function setFastifyInstance(fastifyInstance: FastifyInstance) {
	fastify = fastifyInstance;
}

export async function getUserInfo(request: FastifyRequest) {
	const token = request.cookies.auth_token;
	// check if user logged in
	if (!token) {
		return null;
	}
	// get info
	const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		headers: { Authorization: `Bearer ${token}` },
	});
	const userInfo = await response.json();
	if (userInfo.error)
		return null;
	return userInfo;
}

// ---------------------------------------------------------------------------------------------------

// 	userRoutes.get("/", loggedinUser);//show data of a user
export async function loggedinUser(request: FastifyRequest, reply: FastifyReply) {
	const userInfo = await getUserInfo(request);
	const { db } = request.server;
	const user = db.prepare('SELECT username FROM users WHERE email = ?').get(userInfo.email) as UserData;
	if (!user) {
		return reply.redirect("/api/user/new");
	}
	return reply.redirect(`/api/user/${user.username}`);
}// O

// 	userRoutes.get("/:name", showUser);//show data of a user
export async function showUser(request: FastifyRequest, reply: FastifyReply) {
	const { name } = request.params as RequestParams;
	const { db } = request.server;
	const user = db.prepare('SELECT username, email, image_url FROM users WHERE username = ?').get(name) as UserData;
	if (!user) {
		return reply.code(404).send({ message: "user not found" });
	}
	return reply.code(200).send(user);
}// O

// 	userRoutes.get("/new", newUserForm);//form to create a user
export async function newUserForm(request: FastifyRequest, reply: FastifyReply) {
	const userInfo = await getUserInfo(request);
	const { db } = request.server;
	const user = db.prepare('SELECT username FROM users WHERE email = ?').get(userInfo.email) as UserData;

	if (user) {
		return reply.code(400).send({ message: "a user with this email already exists" });
	}
	return reply.view("createProfile.ejs", { title: "New Profile", email: userInfo.email, status: "enter data" });
}// O

// 	userRoutes.post("/", newUser);//add user to db
export async function newUser(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.body as LoginRequestBody;
	const { db } = request.server;
	const userInfo = await getUserInfo(request);
	if (!userInfo)
		reply.redirect("/login");

	const user = db.prepare('SELECT username FROM users WHERE username = ?').get(username) as UserData;

	if (user)
		return reply.view("createProfile.ejs", { title: "New Profile", email: userInfo.email, status: "username is taken" });
	console.log(userInfo);
	const insertStatement = db.prepare(
		"INSERT INTO users (username, email, image_url) VALUES (?, ?, ?)"
	);
	insertStatement.run(username, userInfo.email, userInfo.picture);
	return reply.redirect("/api/user/");
}// O

// 	userRoutes.get("/:name/edit", editUserForm);//form to edit user
export async function editUserForm(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const { name } = request.params as RequestParams;

	const user = db.prepare('SELECT * FROM users WHERE username = ?').get(name) as UserData;
	if (!user) {
		return reply.code(404).send({ message: "the user with this name was not found" });
	}

	const userInfo = await getUserInfo(request);
	const allowed = db.prepare('SELECT username FROM users WHERE email = ?').get(userInfo.email) as UserData;
	if (name != allowed.username) {
		return reply.code(401).send({ message: "you are not authorized to edit this user >:(" });
	}
	return reply.view("editProfile.ejs", { title: "Edit Profile", user: user, status: "click submit to save changes" });
}// O

// 	userRoutes.post("/:name", editUser);//edit user in db
export async function editUser(request: FastifyRequest, reply: FastifyReply) {
	const { username, avatar } = request.body as LoginRequestBody;
	const { db } = request.server;
	const { name } = request.params as RequestParams;

	const user = db.prepare('SELECT * FROM users WHERE username = ?').get(name) as UserData;
	if (!user) {
		return reply.code(404).send({ message: "User not found" });
	}

	const userInfo = await getUserInfo(request);
	if (user.email != userInfo.email) {
		return reply.code(401).send({ message: "Unauthorized" });
	}

	const taken = db.prepare('SELECT username FROM users WHERE username = ?').get(username) as UserData;
	if (taken)
		return reply.redirect(`/api/user/${name}/edit`);

	if (avatar) {
		const updateStatement = db.prepare('UPDATE users SET username = ?, image_url = ? WHERE username = ?');
		updateStatement.run(username, avatar, name);
	} else {
		const updateStatement = db.prepare('UPDATE users SET username = ? WHERE username = ?');
		updateStatement.run(username, name);
	}
	return reply.redirect(`/api/user/${username}`);
}// O

// 	userRoutes.delete("/:name/delete", deleteUser);//add user to db
export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
	const { name } = request.params as RequestParams;
	const { db } = request.server;
	const userInfo = await getUserInfo(request);
	const user = db.prepare("SELECT email FROM users WHERE username = ?").get(name) as UserData | undefined;

	if (!user)
		return reply.code(400).send({ message: "user does not exist" });
	if (userInfo.email != user.email)
		return reply.code(401).send({ message: "Unauthorized" });

	const deleteStatement = db.prepare("DELETE FROM users WHERE username = ?");
	deleteStatement.run(name);

	reply.clearCookie('auth_token');
	return reply.redirect("/login");
}

// ---------------------------------------------------------------------------------------------------
// google auth callback
export async function callback(request: FastifyRequest, reply: FastifyReply) {
	const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
	try {
		reply.setCookie('auth_token', token.access_token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
		});
	} catch (err) {
		request.log.error(err);
		reply.code(500).send({ error: 'Login failed' });
	}
	reply.redirect('/api/user');
}

// page to log in
export async function loginPage(request: FastifyRequest, reply: FastifyReply) {
	return reply.view("g_login.ejs", { title: "Login" });
}

// 	userRoutes.get("/logout", logout);//delete user token cookie
export async function logout(request: FastifyRequest, reply: FastifyReply) {
	reply.clearCookie('auth_token');
	reply.redirect('/login');
}
