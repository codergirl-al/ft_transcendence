import { FastifyInstance } from "fastify";
import { createProfile, addNewProfile, showProfile, logout } from "../controllers/login.controller.js";

async function userRoutes(userRoutes: FastifyInstance) {
	userRoutes.get("/", showProfile);//show data of user
	userRoutes.get("/logout", logout);//log user out
	userRoutes.get("/create", createProfile);//page for profile creation
	userRoutes.post("/create", addNewProfile);//create db entry for new user
}

export async function apiRoutes(routes: FastifyInstance) {
	routes.register(userRoutes, { prefix: "/user" });
}