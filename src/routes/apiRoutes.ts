import { FastifyInstance } from "fastify";
import { createProfile, addNewProfile, showProfile, loggedinProfile, editForm, changeUser, deleteUser, logout } from "../controllers/login.controller.js";

async function userRoutes(userRoutes: FastifyInstance) {
	userRoutes.get("/", loggedinProfile);//add user to db
	userRoutes.get("/:id", showProfile);//show data of a user
	userRoutes.get("/new", createProfile);//form to create a user
	userRoutes.post("/", addNewProfile);//add user to db
	userRoutes.get("/:id/edit", editForm);//form to edit user
	userRoutes.put("/:id", changeUser);//edit user in db
	userRoutes.delete("/:id", deleteUser);//delete user and cookie
	userRoutes.get("/logout", logout);//delete user token cookie
}

// async function rest(restroutes: FastifyInstance) {
// 	restroutes.get("/", listall);
// 	restroutes.get("/new", createform);
// 	restroutes.post("/", addnew);
// 	restroutes.get("/:id", showone);
// 	restroutes.get("/:id/edit", editform);
// 	restroutes.put("/:id", change);
// 	restroutes.delete("/:id", deleteone);
// }

export async function apiRoutes(routes: FastifyInstance) {
	routes.register(userRoutes, { prefix: "/user" });
}