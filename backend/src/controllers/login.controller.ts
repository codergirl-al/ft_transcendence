import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authLogger } from "../conf/logger";
import { sendResponse } from "./root.controller";
import { RequestParams, TokenData, UserData, UserRequestBody, UserStats } from "../types/types";
import util from 'util';
import fs from 'fs';
import { pipeline } from 'stream/promises';

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
		.prepare('SELECT * FROM users WHERE username = ?')
		.get(id) as UserData | undefined;
	if (!user)
		return sendResponse(reply, 404, undefined, "User not found");

	return sendResponse(reply, 200, user);
}

// GET /api/user/:id/stats - Show data of a user
export async function userStats(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.params as RequestParams;
	const { db } = request.server;
	const user = db
		.prepare('SELECT * FROM users WHERE username = ?')
		.get(id) as UserData | undefined;
	if (!user)
		return sendResponse(reply, 404, undefined, "User not found");
	
	const stats = db.prepare("SELECT * FROM user_stats WHERE user_id = ?").get(user.id) as UserStats | undefined;
	if (!stats)
		return sendResponse(reply, 404, undefined, "User stats not found");

	return sendResponse(reply, 200, stats);
}

// GET /api/user - Show data of user
export async function myUser(request: FastifyRequest, reply: FastifyReply) {
	const { email } = request.user as TokenData;
	const { db } = request.server;
	const user = db
		.prepare('SELECT * FROM users WHERE email = ?')
		.get(email) as UserData | undefined;
	if (!user)
		return sendResponse(reply, 404, undefined, "User not found");

	return sendResponse(reply, 200, user);
}

// GET /api/user/all - Show data of all users
export async function allUsers(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const user = db
		.prepare('SELECT username FROM users')
		.all() as UserData[];
	if (!user)
		return sendResponse(reply, 404, undefined, "User not found");
	let userlist: string[] = [];
	user.forEach(u => {
		if (u.username && u.username != 'usernotfound')
			userlist.push(u.username);
	});

	return sendResponse(reply, 200, userlist);
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

	const insertStatement = db.prepare("INSERT INTO users (username, email, status) VALUES (?, ?, 'online')");
	const info = insertStatement.run(username, email);
	const insertstats = db.prepare("INSERT INTO user_stats (user_id) VALUES (?)");
	insertstats.run(info.lastInsertRowid);

	authLogger.info(`Created new user ${username}`);
	return sendResponse(reply, 200);
}

// POST /api/user/:name - Edit user in DB
export async function editUser(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const { id } = request.params as RequestParams;
	const { email } = request.user as TokenData;
	let username = '';

	const user = db
		.prepare('SELECT * FROM users WHERE username = ?')
		.get(id) as UserData | undefined;
	if (!user)
		return sendResponse(reply, 404, undefined, "User not found");
	if (user.email !== email) {
		authLogger.warn(`Attempt to update user data of ${id} by ${email}`);
		return sendResponse(reply, 401, undefined, "Unauthorized");
	}

	const filename = '/app/dist/public/uploads/' + user.id + '.png';
	const data = request.parts();
	for await (const part of data) {
		if (part.type == 'field' && part.fieldname == 'username') {
			username = part.value as string;
		} else if (part.type == 'file' && part.filename) {
			const writeStream = fs.createWriteStream(filename, { flags: 'w' });
			await pipeline(part.file, writeStream);
		}
	}

	if (username) {
		const taken = db.prepare('SELECT username FROM users WHERE username = ?')
			.get(username) as UserData | undefined;
		if (taken) return sendResponse(reply, 400, undefined, "username already taken");
		const updateStatement = db.prepare('UPDATE users SET username = ? WHERE username = ?');
		updateStatement.run(username, id);
	}
	authLogger.info(`Updated user data of ${email}`);
	return sendResponse(reply, 200);
}


// GET /api/user/delete - Delete user and clear cookie
export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
	// const { id } = request.params as RequestParams;
	const { db } = request.server;
	const userInfo = request.user as TokenData;
	const user = db
		.prepare("SELECT * FROM users WHERE email = ?")
		.get(userInfo.email) as UserData | undefined;

	if (!user) {
		authLogger.info(`Attempt to delete nonexistent user ${userInfo.email}`);
		return sendResponse(reply, 400, undefined, "User not found");
	}
	// if (userInfo.email !== user.email) {
	// 	authLogger.warn(`Attempt to delete user ${id} by ${userInfo.email}`);
	// 	return sendResponse(reply, 401, undefined, "Unauthorized");
	// }

	const deleteStatement = db.prepare("DELETE FROM users WHERE username = ?");
	deleteStatement.run(user.username);
	authLogger.info(`User ${user.username} deleted`);

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
	if (user) {
		db.prepare("UPDATE users SET status = 'online', last_online = datetime('now') WHERE email = ?").run(userInfo.email);
	}
	
	const jwtPayload = { email: userInfo.email, role: "user" };
	const jwtToken = fastify.jwt.sign(jwtPayload);
	reply.setCookie("auth_token", jwtToken, {
		httpOnly: true,
		secure: process.env.FASTIFY_NODE_ENV === 'production',
		path: '/',
		sameSite: 'lax'
	});
	return reply.redirect("/#account");
}


// GET /api/user/logout - Logout and clear cookie
export async function logout(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const user = request.user as TokenData;
	if (user)
		db.prepare("UPDATE users SET status = 'offline', last_online = datetime('now') WHERE email = ?").run(user.email);
	reply.clearCookie('auth_token');
	reply.clearCookie('oauth2-redirect-state');
	authLogger.info(`User ${user.email} logged out`);
	return sendResponse(reply, 200);
}
