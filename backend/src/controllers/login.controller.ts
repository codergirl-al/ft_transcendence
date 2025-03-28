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
	let username = '';
	// const { username, avatarFile } = request.body as UploadBody;

	const user = db
		.prepare('SELECT * FROM users WHERE username = ?')
		.get(id) as UserData | undefined;
	if (!user)
		return sendResponse(reply, 404, undefined, "User not found");
	if (user.email !== email) {
		authLogger.warn(`Attempt to update user data of ${id} by ${email}`);
		return sendResponse(reply, 401, undefined, "Unauthorized");
	}

	const data = request.parts()
	for await (const part of data) {
		if (part.type == 'field') {
			username = part.value as string;
		} else {
			const filename = '/app/dist/public/uploads/' + user.id + '.png';
			await pump(part.file, fs.createWriteStream(filename, { flags: 'w' }));
		}
	}
	// console.log("!!! username:", username);
	// console.log("!!! avatarFile:", avatarFile);

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
// export async function editUser(request: FastifyRequest, reply: FastifyReply) {
// 	const { db } = request.server;
// 	const { name } = request.params as RequestParams;
	
// 	// Retrieve the existing user record.
// 	const user = db
// 	  .prepare('SELECT * FROM users WHERE username = ?')
// 	  .get(name) as UserData | undefined;
// 	if (!user) {
// 	  return reply.code(404).send({ message: "User not found" });
// 	}
	
// 	const userInfo = await getUserInfo(request);
// 	if (user.email !== userInfo.email) {
// 	  authLogger.warn(`Attempt to update user data of ${name} by ${userInfo.email}`);
// 	  return reply.code(401).send({ message: "Unauthorized" });
// 	}
	
// 	// Initialize variables to capture new form values.
// 	let newUsername = "";
// 	let avatarLink = "";
// 	let avatarFilePath = "";
	
// 	// Ensure uploads directory exists
// 	const uploadDir = path.join(process.cwd(), "uploads");
// 	if (!fs.existsSync(uploadDir)) {
// 	  fs.mkdirSync(uploadDir, { recursive: true });
// 	}
	
// 	try {
// 	  const parts = (request as any).parts();
// 	  for await (const part of parts) {
// 		if (part.file) {
// 		  if (part.fieldname === "avatarFile") {
// 			const filePath = path.join(uploadDir, part.filename);
// 			await pump(part.file, fs.createWriteStream(filePath));
// 			avatarFilePath = filePath;
// 		  }
// 		} else {
// 		  if (part.fieldname === "username") {
// 			newUsername = part.value;
// 		  } else if (part.fieldname === "avatarLink") {
// 			avatarLink = part.value;
// 		  }
// 		}
// 	  }
// 	} catch (error) {
// 	  request.log.error("File upload error:", error);
// 	  return reply.code(500).send({ error: "File upload failed" });
// 	}
	
// 	// Check if the new username is already taken (if it was changed).
// 	const taken = db
// 	  .prepare('SELECT username FROM users WHERE username = ?')
// 	  .get(newUsername) as UserData | undefined;
// 	if (taken && newUsername !== name) {
// 	  return reply.redirect(`/api/user/${name}/edit`);
// 	}
	
// 	// Update the database:
// 	// Priority is given to a file upload. If no file was provided, check for an avatar URL.
// 	if (avatarFilePath) {
// 	  const updateStatement = db.prepare('UPDATE users SET username = ?, image_url = ? WHERE username = ?');
// 	  updateStatement.run(newUsername, avatarFilePath, name);
// 	} else if (avatarLink) {
// 	  const updateStatement = db.prepare('UPDATE users SET username = ?, image_url = ? WHERE username = ?');
// 	  updateStatement.run(newUsername, avatarLink, name);
// 	} else {
// 	  const updateStatement = db.prepare('UPDATE users SET username = ? WHERE username = ?');
// 	  updateStatement.run(newUsername, name);
// 	}
	
// 	authLogger.info(`Updated user data of ${userInfo.email}`);
// 	dbLogger.info(`update users where email = ${userInfo.email}`);
// 	return reply.redirect(`/api/user/${newUsername}`);
//   }

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

	// Pass the user and stats data to the view.
	// return reply.view("account.ejs", { title: "Account Dashboard", user, stats });
	return reply.redirect("/#account");
}
