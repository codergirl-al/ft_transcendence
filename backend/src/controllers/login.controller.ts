import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { dbLogger, authLogger } from "../conf/logger";
import { RequestParams, UserData, UserRequestBody } from "../types/types"
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'

const pump = util.promisify(pipeline)

let fastify: FastifyInstance;

// ---------------------------------------------------------------------------------------------------

export function setFastifyInstance(fastifyInstance: FastifyInstance) {
	fastify = fastifyInstance;
}

export async function getUserInfo(request: FastifyRequest) {
	const token = request.cookies.auth_token;
	// Check if user is logged in
	if (!token) {
		return null;
	}
	// Get user info from Google API
	const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		headers: { Authorization: `Bearer ${token}` },
	});
	const userInfo = await response.json();
	if (userInfo.error) return null;
	return userInfo;
}

// ---------------------------------------------------------------------------------------------------

// GET /api/user/:id - Show data of a user
export async function showUser(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.params as RequestParams;
	const { db } = request.server;
	const user = db
		.prepare('SELECT username, email, image_url FROM users WHERE username = ?')
		.get(id) as UserData | undefined;
	if (!user) {
		return reply.code(404).send({ message: "user not found" });
	}
	dbLogger.info(`select users where username = ${id}`);
	return reply.code(200).send(user);
}

// POST /api/user/ - Add new user to the DB
export async function newUser(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.body as UserRequestBody;
	const { db } = request.server;
	const userInfo = await getUserInfo(request);
	if (!userInfo) return reply.code(401).send({ success: false, })

	const user = db
		.prepare('SELECT username FROM users WHERE username = ?')
		.get(username) as UserData | undefined;

	if (user)
		return reply.view("createProfile.ejs", { title: "New Profile", email: userInfo.email, status: "username is taken" });
	const insertStatement = db.prepare("INSERT INTO users (username, email, image_url) VALUES (?, ?, ?)");
	insertStatement.run(username, userInfo.email, userInfo.picture);
	authLogger.info(`Created new user ${username}`);
	dbLogger.info(`insert into users username = ${username}`);
	return reply.redirect('/api/user/dashboard');
}

// POST /api/user/:name - Edit user in DB
export async function editUser(request: FastifyRequest, reply: FastifyReply) {
	// const { username, avatarFile } = request.body as LoginRequestBody;
	const { db } = request.server;
	const { id } = request.params as RequestParams;

	const user = db
		.prepare('SELECT * FROM users WHERE username = ?')
		.get(id) as UserData | undefined;
	if (!user) {
		return reply.code(404).send({ message: "User not found" });
	}

	const userInfo = await getUserInfo(request);
	if (user.email !== userInfo.email) {
		authLogger.warn(`Attempt to update user data of ${id} by ${userInfo.email}`);
		return reply.code(401).send({ message: "Unauthorized" });
	}

	const data = request.files();
	for await (const part of data) {
		if (part.fieldname == 'username') {
			console.log(part);
		} else {
			const filename = __dirname + '/../../dist/public/uploads/' + user.id + '.png';
			await pump(part.file, fs.createWriteStream(filename, { flags: 'w' }));
		}
	}

	// const taken = db
	// 	.prepare('SELECT username FROM users WHERE username = ?')
	// 	.get(username) as UserData | undefined;
	// if (taken) return reply.redirect(`/api/user/${name}/edit`);

	// if (username) {
	// 	const updateStatement = db.prepare('UPDATE users SET username = ? WHERE username = ?');
	// 	updateStatement.run(username, name);
	// }
	authLogger.info(`Updated user data of ${userInfo.email}`);
	dbLogger.info(`update users where email = ${userInfo.email}`);
	return reply.redirect(`/api/user/${id}`);
}

// GET /api/user/:name/delete - Delete user and clear cookie
export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.params as RequestParams;
	const { db } = request.server;
	const userInfo = await getUserInfo(request);
	const user = db
		.prepare("SELECT email FROM users WHERE username = ?")
		.get(id) as UserData | undefined;

	if (!user) {
		authLogger.info(`Attempt to delete nonexistent user ${id}`);
		return reply.code(400).send({ message: "user does not exist" });
	}
	if (userInfo.email !== user.email) {
		authLogger.warn(`Attempt to delete user ${id} by ${userInfo.email}`);
		return reply.code(401).send({ message: "Unauthorized" });
	}

	const deleteStatement = db.prepare("DELETE FROM users WHERE username = ?");
	deleteStatement.run(id);
	authLogger.info(`User ${id} deleted`);
	dbLogger.info(`delete users where username = ${id}`);

	reply.clearCookie('auth_token');
	return reply.redirect("/");
}

// ---------------------------------------------------------------------------------------------------
// Google auth callback
export async function callback(request: FastifyRequest, reply: FastifyReply) {
	const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
	try {
		reply.setCookie('auth_token', token.access_token, {
			path: '/',
			httpOnly: true,
			secure: process.env.FASTIFY_NODE_ENV === 'production',
		});
	} catch (err) {
		request.log.error(err);
		return reply.code(500).send({ error: 'Login failed' });
	}

	const api_call = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		headers: { Authorization: `Bearer ${token}` },
	});
	const userInfo = await api_call.json();
	if (!userInfo.error)
		authLogger.info(`User ${userInfo.email} logged in`);
	// Redirect to the dashboard route so that accountDashboard is invoked.
	return reply.redirect('/api/user/dashboard');
}

// GET /api/user/logout - Logout and clear cookie
export async function logout(request: FastifyRequest, reply: FastifyReply) {
	const user = await getUserInfo(request);
	reply.clearCookie('auth_token');
	authLogger.info(`User ${user.email} logged out`);
	return reply.redirect('/');
}

// ---------------------------------------------------------------------------------------------------

// TEST		GET /test/editUser/:name - Form to edit user
export async function editUserForm(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const { id } = request.params as RequestParams;

	const user = db
		.prepare('SELECT * FROM users WHERE username = ?')
		.get(id) as UserData | undefined;
	if (!user) {
		return reply.code(404).send({ message: "the user with this name was not found" });
	}

	const userInfo = await getUserInfo(request);
	const allowed = db
		.prepare('SELECT username FROM users WHERE email = ?')
		.get(userInfo.email) as UserData | undefined;
	if (!allowed) {
		return reply.redirect("/api/user/new");
	} else if (id !== allowed.username) {
		authLogger.warn(`Attempt to request update of user data of ${name} by ${userInfo.email}`);
		return reply.code(401).send({ message: "Unauthorized" });
	}
	return reply.view("editProfile.ejs", { title: "Edit Profile", user: user, status: "click submit to save changes" });
}

// TEST		GET /test/newUser - Form to create a new user
export async function newUserForm(request: FastifyRequest, reply: FastifyReply) {
	const userInfo = await getUserInfo(request);
	const { db } = request.server;
	const user = db
		.prepare('SELECT username FROM users WHERE email = ?')
		.get(userInfo.email) as UserData | undefined;

	if (user) {
		return reply.code(400).send({ message: "a user with this email already exists" });
	}
	return reply.view("createProfile.ejs", { title: "New Profile", email: userInfo.email, status: "enter data" });
}

// TEST		GET /test/currentuser/ - Check logged-in user and redirect accordingly
export async function loggedinUser(request: FastifyRequest, reply: FastifyReply) {
	const userInfo = await getUserInfo(request);
	const { db } = request.server;
	const user = db
		.prepare('SELECT username FROM users WHERE email = ?')
		.get(userInfo.email) as UserData | undefined;
	if (!user) {
		return reply.redirect("/test/newUser");
	}
	return reply.redirect(`/api/user/${user.username}`);
}

// TEST		GET /test/dashboard - Render the account dashboard
export async function accountDashboard(request: FastifyRequest, reply: FastifyReply) {
	const userInfo = await getUserInfo(request);
	if (!userInfo) {
		return reply.redirect('/');
	}
	const { db } = request.server;

	// Modify query to include the user id.
	const user = db
		.prepare('SELECT id, username, email, image_url FROM users WHERE email = ?')
		.get(userInfo.email) as UserData | undefined;

	if (!user) {
		// If the user isn't found, redirect to create a new profile.
		return reply.redirect('/api/user/new');
	}

	// Query user stats using the user's id.
	const stats = db
		.prepare("SELECT total_games, wins, losses FROM user_stats WHERE user_id = ?")
		.get(user.id) || { total_games: 0, wins: 0, losses: 0 };

	// Pass the user and stats data to the view.
	return reply.view("account.ejs", { title: "Account Dashboard", user, stats });
}
