import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

let fastify: FastifyInstance;

export function setFastifyInstance(fastifyInstance: FastifyInstance) {
	fastify = fastifyInstance;
}

export async function showProfile(request: FastifyRequest, reply: FastifyReply) {
	const token = request.cookies.token;
	if (!token) {
		return reply.redirect('/login');
	}
	const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		headers: { Authorization: `Bearer ${token}` },
	});
	const userInfo = await response.json();
	reply.send({ user: userInfo });

	// const { db } = request.server;
	// var params = { title: "Profile", user: false, username: "none", email: "none" };

	// if (sesh) {
	// 	const user = db.prepare("SELECT * FROM users WHERE username = ?").get(sesh.username);
	// 	if (user)
	// 		params = { title: "Profile", user: true, username: user.username, email: user.email };
	// }
	// return reply.view("showProfile.ejs", params);
}

// page to create a new profile
export async function createProfile(request: FastifyRequest, reply: FastifyReply) {
	return reply.view("createProfile.ejs", { title: "New Profile", status: "enter data" });
}

// page to log in
export async function loginPage(request: FastifyRequest, reply: FastifyReply) {
	return reply.view("login.ejs", { title: "Login", status: "enter data" });
}

// query db for username
export async function userLogin(request: FastifyRequest, reply: FastifyReply) {
	const { username, password } = request.body;
	const { db } = request.server;
	const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

	if (!user)
		return reply.view("login.ejs", { title: "Login", status: "user not found" });
	if (user.password != password)
		return reply.view("login.ejs", { title: "Login", status: "wrong password" });

	request.session.user = { id: user.id, username: user.username };
	return reply.redirect("/profile/");
}

// add new user to db
export async function addNewProfile(request: FastifyRequest, reply: FastifyReply) {
	const { username, email, password } = request.body;
	const { db } = request.server;
	const exists = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

	if (exists)
		return reply.view("createProfile.ejs", { title: "New Profile", status: "user exists" });
	const insertStatement = db.prepare(
		"INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
	);
	insertStatement.run(username, email, password);
	return reply.redirect("/login");//success
}

export async function callback(request: FastifyRequest, reply: FastifyReply) {
	const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

	try {
		reply.setCookie('token', token.access_token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
		});
		reply.redirect('/profile');
	} catch (err) {
		request.log.error(err);
		reply.code(500).send({ error: 'Login failed' });
	}
}