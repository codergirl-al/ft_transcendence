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

const fastify: FastifyInstance = Fastify({ logger: true });

fastify.register(fastifyView, {
	engine: {
		ejs,
	},
	root: path.join(__dirname, "views"),
	viewExt: "ejs",
	layout: "layout.ejs",
});

fastify.register(fastifyStatic, {
	root: path.join(__dirname, "public"),
	prefix: "/public/",
});

fastify.register(fastifyCookie);
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

fastify.register(routes);
fastify.register(fastifyFormbody);
fastify.register(dbConnector);

const port = Number(process.env.PORT) || 3000;
fastify.listen({ port: port, host: "0.0.0.0" }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	serverLogger.info(`transcendence is running in ${process.env.NODE_ENV} mode at ${address}`);
});
