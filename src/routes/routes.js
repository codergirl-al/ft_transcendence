import { getRoot } from "../controllers/root.controller.js";
import { createProfile, addNewProfile, showProfile, loginPage, userLogin } from "../controllers/login.controller.js";

export default async function routes(fastify, options) {
	fastify.get("/", getRoot);//home
	fastify.get("/login", loginPage);//login page
	fastify.register(
		async function (loginRoutes) {
			loginRoutes.get("/", showProfile);//show data of user
			loginRoutes.post("/", userLogin);//query db for user
			loginRoutes.get("/create", createProfile);//page for profile creation
			loginRoutes.post("/create", addNewProfile);//create db entry for new user
		},
		{
			prefix: "/profile",
		}
	);
}
