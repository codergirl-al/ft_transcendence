import Fastify from "fastify";
import env from "./conf/env.js";
import routes from "./routes/routes.js";
import path from "node:path";
import fastifyView from "@fastify/view";
import ejs from "ejs";
import fastifyStatic from "@fastify/static";
import dbConnector from "./conf/db.js";
import fastifyFormbody from "@fastify/formbody";
import fastifyOauth2 from '@fastify/oauth2';
import fastifyCookie from "@fastify/cookie";

const __dirname = import.meta.dirname;

const fastify = Fastify({ logger: true });

await fastify.register(fastifyView, {
	engine: {
		ejs,
	},
	root: path.join(__dirname, "views"),
	viewExt: "ejs",
	layout: "layout.ejs",
});

await fastify.register(fastifyStatic, {
	root: path.join(__dirname, "public"),
	prefix: "/public/",
});

await fastify.register(fastifyCookie);
await fastify.register(fastifyOauth2, {
	name: 'googleOAuth2',
	scope: ['profile', 'email'],
	credentials: {
		client: {
			id: process.env.GOOGLE_CLIENT_ID,
			secret: process.env.GOOGLE_CLIENT_SECRET,
		},
		auth: fastifyOauth2.GOOGLE_CONFIGURATION,
	},
	startRedirectPath: '/google-login',
	callbackUri: `${process.env.BASE_URL}/google-login/callback`,
});

await fastify.register(routes);
await fastify.register(fastifyFormbody);
await fastify.register(dbConnector);

fastify.listen({ port: env.port, host: "0.0.0.0" }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	fastify.log.info(`transcendence is running in ${env.nodeEnv} mode at ${address}`);
});
