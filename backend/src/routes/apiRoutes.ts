import { FastifyInstance } from "fastify";
import { newUserForm, newUser, showUser, loggedinUser, editUserForm, editUser, deleteUser, logout, accountDashboard } from "../controllers/login.controller";
import { newGameForm, showGame, showAllGames, editGameForm, editGame, deleteGame } from "../controllers/game.controller";

// async function userRoutes(userRoutes: FastifyInstance) {
// 	userRoutes.get("/", loggedinUser);//show logged in user
// 	userRoutes.post("/", newUser);//add user to db
// 	userRoutes.get("/:name", showUser);//show data of a user
// 	userRoutes.post("/:name", editUser);//edit user in db
// 	userRoutes.get("/:name/delete", deleteUser);//delete user and cookie
// 	userRoutes.get("/:name/edit", editUserForm);//form to edit user			TMP
// 	userRoutes.get("/new", newUserForm);//form to create a user				TMP
// 	userRoutes.get("/logout", logout);//delete user token cookie
// }
// In your user route definitions
async function userRoutes(userRoutes: FastifyInstance) {
	userRoutes.post("/", { // process new profile creation
		preValidation: userRoutes.authenticate,
		schema: {
			body: {
				type: "object",
				required: ["username"],
				properties: { username: usernameFormat }
			}
		}
	}, newUser);
	userRoutes.get("/:id", { schema: { params: userParamSchema } }, showUser); // get data of user
	userRoutes.get("/", { preValidation: userRoutes.authenticate }, myUser); // get data of user
	userRoutes.post("/:id", { // update profile
		preValidation: [multipartRequest, userRoutes.authenticate],
		schema: { params: userParamSchema }
	}, editUser);
	userRoutes.get("/logout", logout);
	userRoutes.get("/delete", { preValidation: userRoutes.authenticate }, deleteUser);
}

async function gameRoutes(gameRoutes: FastifyInstance) {
<<<<<<< HEAD
	gameRoutes.get("/new", newGameForm);//form to start a new game			TMP
	// gameRoutes.post("/", newGame);//start a new game
	gameRoutes.get("/", showAllGames);//show game data
	gameRoutes.get("/:id", showGame);//show game data
	gameRoutes.post("/:id", editGame);//edit game data
	gameRoutes.get("/:id/delete", deleteGame);//delete game related data
	gameRoutes.get("/:id/edit", editGameForm);//form to edit game stats		TMP
=======
	gameRoutes.post("/", { // start a new game
		schema: {
			body: {
				type: "object",
				required: ["user1", "user2"],
				properties: { user1: usernameFormat, user2: usernameFormat }
			}
		}
	}, newGame);
	gameRoutes.get("/", showAllGames); // show game data
	gameRoutes.get("/:id", { schema: { params: gameParamSchema } }, showGame); // show game data
	gameRoutes.post("/:id", { // edit game data
		schema: {
			body: {
				type: "object",
				required: ["score1", "score2"],
				properties: { score1: { type: "number" }, score2: { type: "number" }, winner: usernameFormat }
			},
			params: gameParamSchema
		}
	}, editGame);
	gameRoutes.get("/:id/delete", { schema: { params: gameParamSchema } }, deleteGame); // delete game related data
>>>>>>> frontend
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