import { FastifyInstance } from "fastify";
import { createProfile, addNewProfile, showProfile, loggedinProfile, editForm, changeUser, deleteUser, logout } from "../controllers/login.controller";

async function userRoutes(userRoutes: FastifyInstance) {
	userRoutes.get("/", loggedinProfile);//show logged in user
	userRoutes.post("/", addNewProfile);//add user to db
	userRoutes.get("/:id", showProfile);//show data of a user
	userRoutes.post("/:id", changeUser);//edit user in db
	userRoutes.get("/:id/delete", deleteUser);//delete user and cookie
	userRoutes.get("/:id/edit", editForm);//form to edit user
	userRoutes.get("/new", createProfile);//form to create a user
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