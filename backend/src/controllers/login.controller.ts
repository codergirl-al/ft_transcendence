import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { dbLogger, authLogger } from "../conf/logger";
import { UserInfo } from "os";

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

// GET /api/user/ - Check logged-in user and redirect accordingly
export async function loggedinUser(request: FastifyRequest, reply: FastifyReply) {
  const userInfo = await getUserInfo(request);
  const { db } = request.server;
  const user = db
    .prepare('SELECT username FROM users WHERE email = ?')
    .get(userInfo.email) as UserData | undefined;
  if (!user) {
    return reply.redirect("/api/user/new");
  }
  return reply.redirect(`/api/user/${user.username}`);
}

// GET /api/user/:name - Show data of a user
export async function showUser(request: FastifyRequest, reply: FastifyReply) {
  const { name } = request.params as RequestParams;
  const { db } = request.server;
  const user = db
    .prepare('SELECT username, email, image_url FROM users WHERE username = ?')
    .get(name) as UserData | undefined;
  if (!user) {
    return reply.code(404).send({ message: "user not found" });
  }
  dbLogger.info(`select users where username = ${name}`);
  return reply.code(200).send(user);
}

// GET /api/user/new - Form to create a new user
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

// POST /api/user/ - Add new user to the DB
export async function newUser(request: FastifyRequest, reply: FastifyReply) {
  const { username } = request.body as LoginRequestBody;
  const { db } = request.server;
  const userInfo = await getUserInfo(request);
  if (!userInfo) return reply.redirect("/login");

  const user = db
    .prepare('SELECT username FROM users WHERE username = ?')
    .get(username) as UserData | undefined;

  if (user)
    return reply.view("createProfile.ejs", { title: "New Profile", email: userInfo.email, status: "username is taken" });
  const insertStatement = db.prepare("INSERT INTO users (username, email, image_url) VALUES (?, ?, ?)");
  insertStatement.run(username, userInfo.email, userInfo.picture);
  authLogger.info(`Created new user ${username}`);
  dbLogger.info(`insert into users username = ${username}`);
  return reply.redirect(`/api/user/${username}`);
}

// GET /api/user/:name/edit - Form to edit user
export async function editUserForm(request: FastifyRequest, reply: FastifyReply) {
  const { db } = request.server;
  const { name } = request.params as RequestParams;

  const user = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(name) as UserData | undefined;
  if (!user) {
    return reply.code(404).send({ message: "the user with this name was not found" });
  }

  const userInfo = await getUserInfo(request);
  const allowed = db
    .prepare('SELECT username FROM users WHERE email = ?')
    .get(userInfo.email) as UserData | undefined;
  if (!allowed) {
    return reply.redirect("/api/user/new");
  } else if (name !== allowed.username) {
    authLogger.warn(`Attempt to request update of user data of ${name} by ${userInfo.email}`);
    return reply.code(401).send({ message: "Unauthorized" });
  }
  return reply.view("editProfile.ejs", { title: "Edit Profile", user: user, status: "click submit to save changes" });
}

// POST /api/user/:name - Edit user in DB
export async function editUser(request: FastifyRequest, reply: FastifyReply) {
  const { username, avatar } = request.body as LoginRequestBody;
  const { db } = request.server;
  const { name } = request.params as RequestParams;

  const user = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(name) as UserData | undefined;
  if (!user) {
    return reply.code(404).send({ message: "User not found" });
  }

  const userInfo = await getUserInfo(request);
  if (user.email !== userInfo.email) {
    authLogger.warn(`Attempt to update user data of ${name} by ${userInfo.email}`);
    return reply.code(401).send({ message: "Unauthorized" });
  }

  const taken = db
    .prepare('SELECT username FROM users WHERE username = ?')
    .get(username) as UserData | undefined;
  if (taken) return reply.redirect(`/api/user/${name}/edit`);

  if (avatar) {
    const updateStatement = db.prepare('UPDATE users SET username = ?, image_url = ? WHERE username = ?');
    updateStatement.run(username, avatar, name);
  } else {
    const updateStatement = db.prepare('UPDATE users SET username = ? WHERE username = ?');
    updateStatement.run(username, name);
  }
  authLogger.info(`Updated user data of ${userInfo.email}`);
  dbLogger.info(`update users where email = ${userInfo.email}`);
  return reply.redirect(`/api/user/${username}`);
}

// GET /api/user/:name/delete - Delete user and clear cookie
export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
  const { name } = request.params as RequestParams;
  const { db } = request.server;
  const userInfo = await getUserInfo(request);
  const user = db
    .prepare("SELECT email FROM users WHERE username = ?")
    .get(name) as UserData | undefined;

  if (!user) {
    authLogger.info(`Attempt to delete nonexistent user ${name}`);
    return reply.code(400).send({ message: "user does not exist" });
  }
  if (userInfo.email !== user.email) {
    authLogger.warn(`Attempt to delete user ${name} by ${userInfo.email}`);
    return reply.code(401).send({ message: "Unauthorized" });
  }

  const deleteStatement = db.prepare("DELETE FROM users WHERE username = ?");
  deleteStatement.run(name);
  authLogger.info(`User ${name} deleted`);
  dbLogger.info(`delete users where username = ${name}`);

  reply.clearCookie('auth_token');
  return reply.redirect("/login");
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
  const user = await getUserInfo(request);
  authLogger.info(`User ${user.email} logged in`);
  // Redirect to the dashboard route so that accountDashboard is invoked.
  return reply.redirect('/api/user/dashboard');
}

// GET /login - Render the login page
export async function loginPage(request: FastifyRequest, reply: FastifyReply) {
  return reply.view("g_login.ejs", { title: "Login" });
}

// GET /api/user/logout - Logout and clear cookie
export async function logout(request: FastifyRequest, reply: FastifyReply) {
  const user = await getUserInfo(request);
  reply.clearCookie('auth_token');
  authLogger.info(`User ${user.email} logged out`);
  return reply.redirect('/');
}

// ---------------------------------------------------------------------------------------------------
// GET /api/user/dashboard - Render the account dashboard
export async function accountDashboard(request: FastifyRequest, reply: FastifyReply) {
  const userInfo = await getUserInfo(request);
  if (!userInfo) {
    return reply.redirect('/login');
  }
  const { db } = request.server;
  const user = db
    .prepare('SELECT username, email, image_url FROM users WHERE email = ?')
    .get(userInfo.email) as UserData | undefined;
  if (!user) {
    // If not registered, send to create profile page.
    return reply.redirect('/api/user/new');
  }
  return reply.view("account.ejs", { title: "Account Dashboard", user });
}
