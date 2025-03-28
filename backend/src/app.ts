// import "./types/fastify.d";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
// project files
import routes from "./routes/routes";
import dbConnector from "./conf/db";
import { serverLogger } from "./conf/logger";
import { getUserInfo } from "./controllers/login.controller";
// fastify plugins
import fastifyView from "@fastify/view";
import { Database } from "better-sqlite3";
import fastifyStatic from "@fastify/static";
import fastifyFormbody from "@fastify/formbody";
import { fastifyOauth2, OAuth2Namespace } from '@fastify/oauth2';
import fastifyCookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
// utils
import path from "node:path";
import ejs from "ejs";

declare module "fastify" {
	interface FastifyInstance {
		googleOAuth2: OAuth2Namespace;
		db: Database;
	}
}

// ----------------------------------------------------------------------
// get fastify
const fastify: FastifyInstance = Fastify({logger: true});

// Register the multipart plugin before defining routes that need it.
// fastify.register(multipart);

// PLUGINS---------------------------------------------------------------
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
// cookies for login
fastify.register(fastifyCookie);
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
	if (request.url.startsWith("/api")) {
		const userInfo = await getUserInfo(request);
		// const token = request.cookies.auth_token;
		if (!userInfo) {
			reply.code(401).send({ error: "Unauthorized" });
		}
	}
});

fastify.addHook("onResponse", async (request: FastifyRequest, reply: FastifyReply) => {
	serverLogger.info(`RES ${reply.statusCode}`);
});

// "res":{"statusCode":304}
// "req":{"method":"GET","url":"/index.css","hostname":"localhost:3000","remoteAddress":"172.18.0.1","remotePort":62214}

// configure routes (./routes/routes.ts)
fastify.register(routes);

// SERVER----------------------------------------------------------------
const port = Number(process.env.FASTIFY_PORT) || 3000;
const address = process.env.FASTIFY_ADDRESS;
fastify.listen({ port: port, host: address }, (err, addr) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	serverLogger.info(`transcendence is running in ${process.env.FASTIFY_NODE_ENV} mode at ${addr}`);
});

console.log("Views path: /app/src/views");
console.log("Static files path: /app/dist/public");