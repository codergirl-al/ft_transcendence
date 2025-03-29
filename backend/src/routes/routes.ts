import { FastifyInstance, FastifyRequest, FastifyReply,  } from "fastify";
import { apiRoutes } from "./apiRoutes";
import { spa } from "../controllers/root.controller";
import { setFastifyInstance, callback } from "../controllers/login.controller";
// import { newGameForm } from "../controllers/game.controller";
import path from "path";
import { testRoutes } from "./testRoutes";
// import path from "node:path";
// import fastifyStatic from "@fastify/static";
// import { createProfile, addNewProfile, showProfile, setFastifyInstance, userLogin, loginPage, callback } from "../controllers/login.controller.js";
// import { newGameForm, newSingleGameForm } from "../controllers/game.controller";


export default async function routes(fastify: FastifyInstance) {
	setFastifyInstance(fastify);

	fastify.get("/", spa);
	fastify.get("/google-login/callback", callback);
	fastify.register(apiRoutes, { prefix: "/api" });
	fastify.register(testRoutes, { prefix: "/test" });
	  
	  
	// This means that every request (except for API endpoints) returns your index.ejs wrapped in your layout, and then your client‑side code handles the navigation.
}
