import Fastify from "fastify";
import env from "./conf/env.js";
// import logger from "./config/logger.js";
import routes from "./routes/routes.js";
import path from "node:path";
// import fastifyView from "@fastify/view";
import fastifyStatic from "@fastify/static";
// import dbConnector from "./config/db.js";
// import fastifyFormbody from "@fastify/formbody";

const __dirname = import.meta.dirname;

const fastify = Fastify({
//   logger: logger,
});

await fastify.register(fastifyStatic, {
	root: path.join(__dirname, "public"),
	prefix: "/public/",
});

await fastify.register(routes);

fastify.listen({ port: env.port, host:"0.0.0.0" }, (err, address) => {
	if (err) {
	  fastify.log.error(err);
	  process.exit(1);
	}
	fastify.log.info(`Blog App is running in ${env.nodeEnv} mode at ${address}`);
  });
  