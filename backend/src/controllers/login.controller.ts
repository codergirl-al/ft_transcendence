import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { dbLogger, authLogger } from "../conf/logger";
import { sendResponse } from "./root.controller";
import { RequestParams, TokenData, UserData, UserRequestBody } from "../types/types";
import fs from 'fs';
import util from 'util';
import { pipeline, PassThrough } from 'stream';

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

	dbLogger.info(`select users where username = ${id}`);
	return sendResponse(reply, 200, user);
}

// GET /api/user - Show data of user
export async function myUser(request: FastifyRequest, reply: FastifyReply) {
	const { email } = request.user as TokenData;
	const { db } = request.server;
	const user = db
		.prepare('SELECT * FROM users WHERE email = ?')
		.get(email) as UserData | undefined;
	dbLogger.info(`request user ${email}`);
	if (!user)
		return sendResponse(reply, 404, undefined, "User not found");

	dbLogger.info(`select users where email = ${email}`);
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
		if (u.username)
			userlist.push(u.username);
	});

	dbLogger.info("select users");
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

	const data = request.parts();
	for await (const part of data) {
		if (part.type == 'field' && part.fieldname == 'username') {
			username = part.value as string;
		} else if (part.type == 'file') {
			const filename = '/app/dist/public/uploads/' + user.id + '.png';

			const passThrough = new PassThrough();
			let fileSize = 0;
			part.file.on('data', chunk => {
				fileSize += chunk.length;
			});
			part.file.pipe(passThrough);

			await new Promise<void>((resolve, reject) => {
				part.file.on('end', () => {
					if (fileSize > 0) {
						pump(passThrough, fs.createWriteStream(filename, { flags: 'w' }))
							.then(resolve)
							.catch(reject);
					} else {
						resolve();
					}
				});
				part.file.on('error', reject);
			});
		}
	}
	
	const taken = db
		.prepare('SELECT username FROM users WHERE username = ?')
		.get(username) as UserData | undefined;
	if (taken) return reply.redirect(`/api/user/${id}/edit`);

	if (username) {
		const updateStatement = db.prepare('UPDATE users SET username = ? WHERE username = ?');
		updateStatement.run(username, id);
	}
	authLogger.info(`Updated user data of ${email}`);
	dbLogger.info(`update users where email = ${email}`);
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
	dbLogger.info(`delete users where username = ${user.username}`);

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
		const online = db.prepare("UPDATE users SET status = 'online' WHERE email = ?");
		online.run(userInfo.email);
	}

	const jwtPayload = { email: userInfo.email, role: "user" };
	const jwtToken = fastify.jwt.sign(jwtPayload);

	reply.setCookie("auth_token", jwtToken, {
		httpOnly: true,
		secure: process.env.FASTIFY_NODE_ENV === 'production',
		path: '/',
		sameSite: 'lax' });
	return reply.redirect("/#account");
}

// GET /api/user/logout - Logout and clear cookie
export async function logout(request: FastifyRequest, reply: FastifyReply) {
	const user = request.user as TokenData;
	if (!offline(request, user))
		authLogger.error(`logged out user ${user.email} still set to online`);
	reply.clearCookie('auth_token');
	// reply.clearCookie('oauth2-redirect-state');
	authLogger.info(`User ${user.email} logged out`);
	return sendResponse(reply, 200);
}

function offline(request: FastifyRequest, user: TokenData) {
	const { db } = request.server;
	const logout = db.prepare("UPDATE users SET status = 'offline' WHERE email = ?");
	const info = logout.run(user.email);
	return (info.changes > 0);
}
