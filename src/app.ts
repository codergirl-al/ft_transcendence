import Fastify, { FastifyInstance } from "fastify";
// project files
import routes from "./routes/routes.js";
import dbConnector from "./conf/db.js";
import { serverLogger } from "./conf/logger.js";
// fastify plugins
import fastifyView from "@fastify/view";
import fastifyStatic from "@fastify/static";
import fastifyFormbody from "@fastify/formbody";
import fastifyOauth2 from '@fastify/oauth2';
import fastifyCookie from "@fastify/cookie";
// utils
import path from "node:path";
import ejs from "ejs";

// ----------------------------------------------------------------------
// get fastify
const fastify: FastifyInstance = Fastify({ logger: true });

// PLUGINS---------------------------------------------------------------
// request body
fastify.register(fastifyFormbody);
// ejs
fastify.register(fastifyView, {
	engine: { ejs },
	root: path.join(__dirname, "../src/views"),
	viewExt: "ejs",
	layout: "layout.ejs",
});
// static files
fastify.register(fastifyStatic, {
	root: path.join(__dirname, "../src/public"),
	prefix: "/public/",
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
	callbackUri: `${process.env.BASE_URL}/google-login/callback`,
});
// create database
fastify.register(dbConnector);
// configure routes (./routes/routes.ts)
fastify.register(routes);

// SERVER----------------------------------------------------------------
const port = Number(process.env.PORT) || 3000;
const address = process.env.ADDRESS;
fastify.listen({ port: port, host: address }, (err, addr) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	serverLogger.info(`transcendence is running in ${process.env.NODE_ENV} mode at ${addr}`);
});
