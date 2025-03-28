import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { dbLogger, authLogger } from "../conf/logger";
import { sendResponse } from "./root.controller";
import { RequestParams, TokenData, UserData, UserRequestBody, UploadBody } from "../types/types"
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'

const pump = util.promisify(pipeline)

let fastify: FastifyInstance;

// ---------------------------------------------------------------------------------------------------

export function setFastifyInstance(fastifyInstance: FastifyInstance) {
	fastify = fastifyInstance;
}

// ---------------------------------------------------------------------------------------------------

// GET /api/user/:id - Show data of a user
export async function showUser(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.params as RequestParams;
	const { db } = request.server;
	const user = db
		.prepare('SELECT username, email FROM users WHERE username = ?')
		.get(id) as UserData | undefined;
	if (!user)
		return sendResponse(reply, 404, undefined, "User not found");

	dbLogger.info(`select users where username = ${id}`);
	return sendResponse(reply, 200, user);
}

// POST /api/user/ - Add new user to the DB
export async function newUser(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.body as UserRequestBody;
	const { db } = request.server;
	const { email } = request.user as TokenData;

	const user = db
		.prepare('SELECT username FROM users WHERE username = ?')
		.get(username) as UserData | undefined;
	if (user)
		return sendResponse(reply, 400, undefined, "Username already taken");

	const emailExists = db
		.prepare('SELECT email FROM users WHERE email = ?')
		.get(email) as UserData | undefined;
	if (emailExists)
		return sendResponse(reply, 400, undefined, "Email already registered");

	const insertStatement = db.prepare("INSERT INTO users (username, email) VALUES (?, ?)");
	insertStatement.run(username, email);
	authLogger.info(`Created new user ${username}`);
	dbLogger.info(`insert into users username = ${username}`);
	return sendResponse(reply, 200);
}

// POST /api/user/:name - Edit user in DB
export async function editUser(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const { id } = request.params as RequestParams;
	const { email } = request.user as TokenData;
	const { username, avatarFile } = request.body as UploadBody;

	const user = db
		.prepare('SELECT * FROM users WHERE username = ?')
		.get(id) as UserData | undefined;
	if (!user)
		return sendResponse(reply, 404, undefined, "User not found");
	if (user.email !== email) {
		authLogger.warn(`Attempt to update user data of ${id} by ${email}`);
		return sendResponse(reply, 401, undefined, "Unauthorized");
	}

	// const data = request.files();
	// for await (const part of data) {
	// 	if (part.fieldname == 'username') {
	// 		console.log(part);
	// 	} else {
	// 		const filename = __dirname + '/../../dist/public/uploads/' + user.id + '.png';
	// 		await pump(part.file, fs.createWriteStream(filename, { flags: 'w' }));
	// 	}
	// }
	console.log("!!! username:", username);
	console.log("!!! avatarFile:", avatarFile);

	// const taken = db
	// 	.prepare('SELECT username FROM users WHERE username = ?')
	// 	.get(username) as UserData | undefined;
	// if (taken) return reply.redirect(`/api/user/${name}/edit`);

	// if (username) {
	// 	const updateStatement = db.prepare('UPDATE users SET username = ? WHERE username = ?');
	// 	updateStatement.run(username, name);
	// }
	authLogger.info(`Updated user data of ${email}`);
	dbLogger.info(`update users where email = ${email}`);
	return sendResponse(reply, 200);
}

// GET /api/user/:name/delete - Delete user and clear cookie
export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.params as RequestParams;
	const { db } = request.server;
	const userInfo = request.user as TokenData;
	const user = db
		.prepare("SELECT email FROM users WHERE username = ?")
		.get(id) as UserData | undefined;

	if (!user) {
		authLogger.info(`Attempt to delete nonexistent user ${id}`);
		return sendResponse(reply, 400, undefined, "User not found");
	}
	if (userInfo.email !== user.email) {
		authLogger.warn(`Attempt to delete user ${id} by ${userInfo.email}`);
		return sendResponse(reply, 401, undefined, "Unauthorized");
	}

	const deleteStatement = db.prepare("DELETE FROM users WHERE username = ?");
	deleteStatement.run(id);
	authLogger.info(`User ${id} deleted`);
	dbLogger.info(`delete users where username = ${id}`);

	// logout on success
	reply.clearCookie('auth_token');
	return sendResponse(reply, 200);
}

// ---------------------------------------------------------------------------------------------------
// Google auth callback
export async function callback(request: FastifyRequest, reply: FastifyReply) {
	const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
	const { db } = request.server;

	const api_call = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		headers: { Authorization: `Bearer ${token.access_token}` },
	});
	const userInfo = await api_call.json();
	if (userInfo.error) {
		authLogger.error("Google Authentication failed");
		return sendResponse(reply, 500, undefined, "Google Authentication failed");
	}

	const user = db.prepare("SELECT * FROM users WHERE email = ?").get(userInfo.email) as UserData | undefined;
	const jwtPayload = { email: userInfo.email, role: "user" };
	const jwtToken = fastify.jwt.sign(jwtPayload);

	reply.setCookie("auth_token", jwtToken, {
		httpOnly: true,
		secure: process.env.FASTIFY_NODE_ENV === 'production',
		path: '/',
		sameSite: 'lax' });
	console.log("cookie set: " + jwtToken);
	// if (!user)
	// 	return reply.redirect("/test/newUser");//CHECK
	return sendResponse(reply, 200, jwtToken);
}

// GET /api/user/logout - Logout and clear cookie		OLD
export async function logout(request: FastifyRequest, reply: FastifyReply) {
	// const user = await getUserInfo(request);
	reply.clearCookie('auth_token');
	// reply.clearCookie('oauth2-redirect-state');
	// authLogger.info(`User ${user.email} logged out`);
	return sendResponse(reply, 200);
}

// ---------------------------------------------------------------------------------------------------

// TEST		GET /test/editUser/:name - Form to edit user
export async function editUserForm(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const { id } = request.params as RequestParams;
	const userInfo = request.user as TokenData;

	const user = db
		.prepare('SELECT * FROM users WHERE username = ?')
		.get(id) as UserData | undefined;
	if (!user)
		return sendResponse(reply, 404, undefined, "User not found");

	const allowed = db
		.prepare('SELECT username FROM users WHERE email = ?')
		.get(userInfo.email) as UserData | undefined;
	if (!allowed) {
		return reply.redirect("/test/newUser");
	} else if (id !== allowed.username) {
		authLogger.warn(`Attempt to request update of user data of ${name} by ${userInfo.email}`);
		return sendResponse(reply, 401, undefined, "Unauthorized");
	}
	return reply.view("editProfile.ejs", { title: "Edit Profile", user: user, status: "click submit to save changes" });
}

// TEST		GET /test/newUser - Form to create a new user
export async function newUserForm(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const userInfo = request.user as TokenData;
	const user = db
		.prepare('SELECT username FROM users WHERE email = ?')
		.get(userInfo.email) as UserData | undefined;

	if (user)
		return sendResponse(reply, 400, undefined, "User already registered");
	return reply.view("createProfile.ejs", { title: "New Profile", email: userInfo.email, status: "enter data" });
}

// TEST		GET /test/currentuser/ - Check logged-in user and redirect accordingly
export async function loggedinUser(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const userInfo = request.user as TokenData;
	const user = db
		.prepare('SELECT username FROM users WHERE email = ?')
		.get(userInfo.email) as UserData | undefined;
	if (!user)
		return reply.redirect("/test/newUser");
	return reply.redirect(`/api/user/${user.username}`);
}

// TEST		GET /test/dashboard - Render the account dashboard
export async function accountDashboard(request: FastifyRequest, reply: FastifyReply) {
	const userInfo = request.user as TokenData;
	const { db } = request.server;
	const user = db
		.prepare('SELECT * FROM users WHERE email = ?')
		.get(userInfo.email) as UserData | undefined;
	if (!user)
		return reply.redirect('/test/newUser');

	const stats = db
		.prepare("SELECT total_games, wins, losses FROM user_stats WHERE user_id = ?")
		.get(user.id) || { total_games: 0, wins: 0, losses: 0 };
	return reply.view("account.ejs", { title: "Account Dashboard", user, stats });
}
