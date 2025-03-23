import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { apiRoutes } from "./apiRoutes";
import { testRoutes } from "./testRoutes";
import { getRoot } from "../controllers/root.controller";
import { setFastifyInstance, callback } from "../controllers/login.controller";

export default async function routes(fastify: FastifyInstance) {
	setFastifyInstance(fastify);

	fastify.get("/", getRoot);
	fastify.get("/google-login/callback", callback);
	fastify.register(apiRoutes, { prefix: "/api" });
	fastify.register(testRoutes, { prefix: "/test" });

	fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
		reply.redirect("/");
	});
}
