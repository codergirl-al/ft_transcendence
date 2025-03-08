import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
// import { dbLogger } from "../conf/logger";

let fastify: FastifyInstance;
interface LoginRequestBody {
	username: string;
	avatar: string;
}
interface RequestParams {
	id: string;
}

export function setFastifyInstance(fastifyInstance: FastifyInstance) {
	fastify = fastifyInstance;
}

async function getUserInfo(request: FastifyRequest) {
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

// 	userRoutes.get("/", loggedinProfile);//show data of a user
export async function loggedinProfile(request: FastifyRequest, reply: FastifyReply) {
	const userInfo = await getUserInfo(request);
	const { db } = request.server;
	const user = db.prepare('SELECT username, email, games FROM users WHERE email = ?').get(userInfo.email);
	if (!user) {
		return reply.redirect("/api/user/new");
	}
	return reply.code(200).send(user);
}// O

// 	userRoutes.get("/:id", showProfile);//show data of a user
export async function showProfile(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.params as RequestParams;
	const { db } = request.server;
	const user = db.prepare('SELECT username, email, games FROM users WHERE id = ?').get(id);
	if (!user) {
		return reply.code(404).send({ message: "user not found" });
	}
	return reply.code(200).send(user);
}// O

// 	userRoutes.get("/new", createProfile);//form to create a user
export async function createProfile(request: FastifyRequest, reply: FastifyReply) {
	const userInfo = await getUserInfo(request);
	const { db } = request.server;
	const user = db.prepare('SELECT username FROM users WHERE email = ?').get(userInfo.email);

	if (user) {
		return reply.code(400).send({ message: "a user with this email already exists" });
	}
	return reply.view("createProfile.ejs", { title: "New Profile", email: userInfo.email, status: "enter data" });
}// O

// 	userRoutes.post("/", addNewProfile);//add user to db
export async function addNewProfile(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.body as LoginRequestBody;
	const { db } = request.server;
	const userInfo = await getUserInfo(request);
	if (!userInfo)
		reply.redirect("/login");

	const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username);

	if (user)
		return reply.view("createProfile.ejs", { title: "New Profile", email: userInfo.email, status: "username is taken" });
	console.log(userInfo);
	const insertStatement = db.prepare(
		"INSERT INTO users (username, email, image_url, games) VALUES (?, ?, ?, ?)"
	);
	insertStatement.run(username, userInfo.email, userInfo.picture, 0);
	return reply.redirect("/api/user/");
}// O

// 	userRoutes.get("/:id/edit", editForm);//form to edit user
export async function editForm(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const { id } = request.params as RequestParams;

	const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
	if (!user) {
		return reply.code(404).send({ message: "the user with this id was not found" });
	}

	const userInfo = await getUserInfo(request);
	const allowed = db.prepare('SELECT id FROM users WHERE email = ?').get(userInfo.email) as { id: string };
	if (id != allowed.id) {
		return reply.code(401).send({ message: "you are not authorized to edit this user >:(" });
	}
	return reply.view("editProfile.ejs", { title: "Edit Profile", user: user, status: "click submit to save changes" });
}// O

// 	userRoutes.put("/:id", changeUser);//edit user in db
export async function changeUser(request: FastifyRequest, reply: FastifyReply) {
	const { username, avatar } = request.body as LoginRequestBody;
	const { db } = request.server;
	const { id } = request.params as RequestParams;

	const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as { email: string };
	if (!user) {
		return reply.code(404).send({ message: "User not found" });
	}

	const userInfo = await getUserInfo(request);
	if (user.email != userInfo.email) {
		return reply.code(401).send({ message: "Unauthorized" });
	}

	const taken = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
	if (taken)
		return reply.redirect(`/api/user/${id}/edit`);

	const updateStatement = db.prepare('UPDATE users SET username = ?, image_url = ? WHERE id = ?');
	updateStatement.run(username, avatar, id);
	return reply.redirect(`/api/user/${id}`);
}// O

// 	userRoutes.delete("/:id/delete", deleteUser);//add user to db
export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.params as RequestParams;
	const { db } = request.server;
	const userInfo = await getUserInfo(request);
	const user = db.prepare("SELECT email FROM users WHERE id = ?").get(id) as { email: string };

	if (userInfo.email != user.email)
		return reply.code(401).send({ message: "Unauthorized" });

	const deleteStatement = db.prepare("DELETE FROM users WHERE id = ?");
	deleteStatement.run(id);

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
