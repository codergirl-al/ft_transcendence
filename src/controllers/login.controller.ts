import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {dbLogger} from "../conf/logger.js";

let fastify: FastifyInstance;
interface LoginRequestBody {
	username: string;
}

export function setFastifyInstance(fastifyInstance: FastifyInstance) {
	fastify = fastifyInstance;
}

async function getUserInfo(request: FastifyRequest) {
	const token = request.cookies.token;
	// check if user logged in
	if (!token) {
		return null;
	}
	// get info
	const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		headers: { Authorization: `Bearer ${token}` },
	});
	const userInfo = await response.json();
	return userInfo;
}

export async function showProfile(request: FastifyRequest, reply: FastifyReply) {
	const userInfo = await getUserInfo(request);
	if (!userInfo) {
		return reply.redirect("/login");
	}
	// see if gmail in db
	const { db } = request.server;
	const user = db.prepare('SELECT * FROM users WHERE email = ?').get(userInfo.email);
	console.log(userInfo.picture);
	console.log(user.image_url);
	if (!user) {
		// create user
		return reply.view("createProfile.ejs", {title: "New Profile", email: userInfo.email, status: "choose a username"})
	} else {
		// show info
		return reply.view("showProfile.ejs", { title: "Profile", user: true, picture: user.image_url, username: user.username, email: user.email });
	}

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
	return reply.view("g_login.ejs", { title: "Login" });
}

// query db for username
// export async function userLogin(request: FastifyRequest, reply: FastifyReply) {
// 	const { username, password } = request.body;
// 	const { db } = request.server;
// 	const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

// 	if (!user)
// 		return reply.view("login.ejs", { title: "Login", status: "user not found" });
// 	if (user.password != password)
// 		return reply.view("login.ejs", { title: "Login", status: "wrong password" });

// 	request.session.user = { id: user.id, username: user.username };
// 	return reply.redirect("/profile/");
// }

// add new user to db
export async function addNewProfile(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.body as LoginRequestBody;
	const { db } = request.server;
	const exists = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

	if (exists)
		return reply.view("createProfile.ejs", { title: "New Profile", status: "username is taken" });

	const userInfo = await getUserInfo(request);
	const insertStatement = db.prepare(
		"INSERT INTO users (username, email, image_url, games) VALUES (?, ?, ?, ?)"
	);
	insertStatement.run(username, userInfo.email, userInfo.picture, 0);
	return reply.redirect("/profile");//success
}

export async function callback(request: FastifyRequest, reply: FastifyReply) {
	const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
	try {
		reply.setCookie('token', token.access_token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
		});
	} catch (err) {
		request.log.error(err);
		reply.code(500).send({ error: 'Login failed' });
	}
	reply.redirect('/profile');
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
	reply.clearCookie('token');
	reply.redirect('/login');
}
