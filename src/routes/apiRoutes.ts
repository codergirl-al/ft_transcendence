import { FastifyInstance } from "fastify";
import { newUserForm, newUser, showUser, loggedinUser, editUserForm, editUser, deleteUser, logout } from "../controllers/login.controller";
import { newGame, showGame, newGameForm } from "../controllers/game.controller";

async function userRoutes(userRoutes: FastifyInstance) {
	userRoutes.get("/", loggedinUser);//show logged in user
	userRoutes.post("/", newUser);//add user to db
	userRoutes.get("/:name", showUser);//show data of a user
	userRoutes.post("/:name", editUser);//edit user in db
	userRoutes.get("/:name/delete", deleteUser);//delete user and cookie
	userRoutes.get("/:name/edit", editUserForm);//form to edit user
	userRoutes.get("/new", newUserForm);//form to create a user
	userRoutes.get("/logout", logout);//delete user token cookie
}

async function gameRoutes(gameRoutes: FastifyInstance) {
	// userRoutes.get("/", gameRoot);// ?

	gameRoutes.post("/", newGame);//start a new game
	gameRoutes.get("/:id", showGame);//show game data
	// gameRoutes.post("/:id", editGame);//edit game data
	// gameRoutes.get("/:id/delete", deleteGame);//delete game related data
	gameRoutes.get("/new", newGameForm);// ?
	// gameRoutes.get("/:id/edit", editGameForm);// ?
}

export async function apiRoutes(routes: FastifyInstance) {
	routes.register(userRoutes, { prefix: "/user" });
	routes.register(gameRoutes, { prefix: "/game" });
}

// -----------------------------------REST example-------
// async function rest(restroutes: FastifyInstance) {
// 	restroutes.get("/", listall);
// 	restroutes.get("/new", createform);
// 	restroutes.post("/", addnew);
// 	restroutes.get("/:id", showone);
// 	restroutes.get("/:id/edit", editform);
// 	restroutes.put("/:id", change);
// 	restroutes.delete("/:id", deleteone);
// }