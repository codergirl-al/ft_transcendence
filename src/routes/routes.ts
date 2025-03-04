import { FastifyInstance } from "fastify";
import { getRoot } from "../controllers/root.controller.js";
import { createProfile, addNewProfile, showProfile, setFastifyInstance, loginPage, callback, logout } from "../controllers/login.controller.js";
// import { createProfile, addNewProfile, showProfile, setFastifyInstance, userLogin, loginPage, callback } from "../controllers/login.controller.js";

export default async function routes(fastify: FastifyInstance) {
	setFastifyInstance(fastify);

	fastify.get("/", getRoot);//home
	fastify.get("/google-login/callback", callback);
	fastify.get("/login", loginPage);
	fastify.register(
		async function (loginRoutes) {
			loginRoutes.get("/", showProfile);//show data of user
			loginRoutes.get("/logout", logout);//show data of user
			// loginRoutes.post("/", userLogin);//query db for user
			loginRoutes.get("/create", createProfile);//page for profile creation
			loginRoutes.post("/create", addNewProfile);//create db entry for new user
		},
		{
			prefix: "/profile",
		}
	);
}
