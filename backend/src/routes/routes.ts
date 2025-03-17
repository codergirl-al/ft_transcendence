import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { apiRoutes } from "./apiRoutes";
import { getRoot, spa } from "../controllers/root.controller";
import { setFastifyInstance, loginPage, callback } from "../controllers/login.controller";
// import { createProfile, addNewProfile, showProfile, setFastifyInstance, userLogin, loginPage, callback } from "../controllers/login.controller.js";

export default async function routes(fastify: FastifyInstance) {
	setFastifyInstance(fastify);

	fastify.get("/login", loginPage);
	fastify.get("/", getRoot);
	fastify.get("/google-login/callback", callback);
	fastify.register(apiRoutes, { prefix: "/api" });

	fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
		reply.sendFile('index.html');
	});
}

// export default async function routes(fastify: FastifyInstance) {
// 	setFastifyInstance(fastify);

// 	fastify.get("/", getRoot);//home
// 	fastify.get("/google-login/callback", callback);
// 	fastify.get("/login", loginPage);
// 	fastify.register(
// 		async function (loginRoutes) {
// 			loginRoutes.get("/", showProfile);//show data of user
// 			loginRoutes.get("/logout", logout);//show data of user
// 			// loginRoutes.post("/", userLogin);//query db for user
// 			loginRoutes.get("/create", createProfile);//page for profile creation
// 			loginRoutes.post("/create", addNewProfile);//create db entry for new user
// 		},
// 		{
// 			prefix: "/profile",
// 		}
// 	);
// }
