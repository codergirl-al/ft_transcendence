import Fastify from "fastify";
import env from "./conf/env.js";
// import logger from "./conf/logger.js";
import routes from "./routes/routes.js";
import path from "node:path";
import fastifyView from "@fastify/view";
import ejs from "ejs";
import fastifyStatic from "@fastify/static";
import dbConnector from "./conf/db.js";
import fastifyFormbody from "@fastify/formbody";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";

const __dirname = import.meta.dirname;

const fastify = Fastify({
	//   logger: logger,
});

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
await fastify.register(fastifySession, {
	secret: 'a very secret key that is long enough', // Change this to a secure key
	cookie: { secure: false }, // Set to true if using HTTPS
	saveUninitialized: false
});
await fastify.register(fastifyFormbody);
await fastify.register(dbConnector);
await fastify.register(routes);

fastify.listen({ port: env.port, host: "0.0.0.0" }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	fastify.log.info(`transcendence is running in ${env.nodeEnv} mode at ${address}`);
});
