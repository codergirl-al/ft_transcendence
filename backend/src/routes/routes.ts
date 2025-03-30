import { FastifyInstance } from "fastify";
import { apiRoutes } from "./apiRoutes";
import { spa } from "../controllers/root.controller";
import { setFastifyInstance, callback } from "../controllers/login.controller";

export default async function routes(fastify: FastifyInstance) {
	setFastifyInstance(fastify);

	fastify.get("/", spa);
	fastify.get("/google-login/callback", callback);
	fastify.register(apiRoutes, { prefix: "/api" });
	// fastify.register(testRoutes, { prefix: "/test" });

	// fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
	// 	// reply.sendFile('index.html');
	// 	// reply.view("index.ejs", { title: "Transcendence", view: "index" });
	// 	// reply.redirect("/index.html");
	// });
}
