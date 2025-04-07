import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
// project files
import routes from "./routes/routes";
import dbConnector from "./conf/db";
import { serverLogger } from "./conf/logger";
import { sendResponse } from "./controllers/root.controller";
import { TokenData } from "./types/types";
// fastify plugins
import { Database } from "better-sqlite3";
import fastifyStatic from "@fastify/static";
import fastifyFormbody from "@fastify/formbody";
import { fastifyOauth2, OAuth2Namespace } from '@fastify/oauth2';
import fastifyCookie from "@fastify/cookie";
import multipart, { MultipartFile } from "@fastify/multipart";
import fastifyJWT from "@fastify/jwt";

declare module "fastify" {
	interface FastifyInstance {
		googleOAuth2: OAuth2Namespace;
		db: Database;
		file?: MultipartFile;
		user?: TokenData;
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}
}

// Validate required environment variables
function validateEnvVariables() {
	const requiredEnvVars = [
		"JWT_SECRET",
		"GOOGLE_CLIENT_ID",
		"GOOGLE_CLIENT_SECRET",
		"CALLBACK_URL",
		"FASTIFY_PORT",
		"FASTIFY_ADDRESS",
		"FASTIFY_NODE_ENV",
		"FASTIFY_DB_FILE"
	];

	const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

	if (missingEnvVars.length > 0) {
		process.exit(1);
	}
}

validateEnvVariables();

// ----------------------------------------------------------------------
// get fastify
const fastify: FastifyInstance = Fastify();

// Register the multipart plugin before defining routes that need it.
// fastify.register(multipart);

// PLUGINS---------------------------------------------------------------
// cookies for login
fastify.register(fastifyCookie);
// JWT
fastify.register(fastifyJWT, {
	secret: process.env.JWT_SECRET!,
	sign: { expiresIn: "1h" },
	cookie: {
		cookieName: 'auth_token',
		signed: false
	}
});
fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
	try {
		await request.jwtVerify();
	} catch (err) {
		return sendResponse(reply, 401, undefined, "Unauthorized");
	}
});
// uploads
fastify.register(multipart);
// request body
fastify.register(fastifyFormbody);

// ejs
// fastify.register(fastifyView, {
// 	engine: { ejs },
// 	root: path.join(__dirname, "../src/views"),
// 	viewExt: "ejs",
// 	layout: "layout.ejs",
// });
// static files
fastify.register(fastifyStatic, {
	root: "/app/dist/public",
	prefix: "/",
});

// google authentication
fastify.register(fastifyOauth2, {
	name: 'googleOAuth2',
	scope: ['profile', 'email'],
	credentials: {
		client: {
			id: process.env.GOOGLE_CLIENT_ID!,
			secret: process.env.GOOGLE_CLIENT_SECRET!,
		},
		auth: fastifyOauth2.GOOGLE_CONFIGURATION,
	},
	startRedirectPath: '/google-login',
	callbackUri: `${process.env.CALLBACK_URL}`,
});
// create database
fastify.register(dbConnector);
// only allow authenticated api access
fastify.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
	serverLogger.info(`REQ ${request.method} ${request.hostname}${request.url}   client ${request.socket.remoteAddress}:${request.socket.remotePort}`);
});

fastify.addHook("onResponse", async (request: FastifyRequest, reply: FastifyReply) => {
	serverLogger.info(`RES ${request.hostname}${request.url} ${reply.statusCode}`);
});

fastify.addHook('preHandler', async (request, reply) => {
	const user = request.user as TokenData | undefined;
	if (user) {
		const { db } = request.server;
		db.prepare("UPDATE users SET status = 'online', last_online = datetime('now') WHERE email = ?").run(user.email);
	}
});

function autoOfflineUsers() {
	const { db } = fastify;

	setInterval(() => {
		// Set users as offline if they haven't been active for 5+ minutes
		db.prepare(`
			UPDATE users 
			SET status = 'offline' 
			WHERE status = 'online' 
			AND last_online < datetime('now', '-2 minutes')
		`).run();

		serverLogger.debug("updated online status");
	}, (60 * 1000)); // Run every 60 seconds
}

// configure routes (./routes/routes.ts)
fastify.register(routes);

// SERVER----------------------------------------------------------------
const port = Number(process.env.FASTIFY_PORT) || 3000;
const address = process.env.FASTIFY_ADDRESS;

try {
	fastify.listen({ port: port, host: address }, (err, addr) => {
		if (err || !addr) {
			serverLogger.error(err);
			process.exit(1);
		}
		fastify.ready(autoOfflineUsers);
		serverLogger.info(`transcendence is running in ${process.env.FASTIFY_NODE_ENV} mode at ${addr}`);
	});
} catch (err) {
	serverLogger.error(err);
	process.exit(1);
}
