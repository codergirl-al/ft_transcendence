import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { newUser, showUser, editUser, deleteUser, logout, allUsers } from "../controllers/login.controller";
import { newGame, showGame, showAllGames } from "../controllers/game.controller";
import { showAllT, newT, showT, winT } from "../controllers/tournament.controller";
import { sendResponse } from "../controllers/root.controller";
// ---------------------------------------------------------------------------------------------------
const usernameFormat = { type: "string", minLength: 3, maxLength: 20 }
const winnerFormat = { type: "number", enum: [1, 2] }
const playersFormat = { type: "number", enum: [4, 6, 8] }

const userParamSchema = {
    type: "object",
    properties: { id: usernameFormat }
}
const gameParamSchema = {
    type: "object",
    properties: { id: { type: "number" } }
}
async function multipartRequest(request: FastifyRequest, reply: FastifyReply) {
    if (!request.isMultipart())
        return sendResponse(reply, 400, undefined, "Invalid request type. expected multipart/form-data");
}
// ---------------------------------------------------------------------------------------------------

async function userRoutes(userRoutes: FastifyInstance) {//--------------------------------------------
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
	userRoutes.get("/all", allUsers); // get data of user
	userRoutes.post("/:id", { // update profile
		preValidation: [multipartRequest, userRoutes.authenticate],
		schema: { params: userParamSchema }
	}, editUser);
	userRoutes.get("/logout", { preValidation: userRoutes.authenticate}, logout);
	userRoutes.get("/:id/delete", { preValidation: userRoutes.authenticate, schema: { params: userParamSchema } }, deleteUser);
}

async function gameRoutes(gameRoutes: FastifyInstance) {//--------------------------------------------
	gameRoutes.get("/", showAllGames); // show game data
	gameRoutes.post("/", { // start a new game
		schema: {
			body: {
				type: "object",
				required: ["multi", "user1", "winner"],
				properties: { multi: { type: "boolean" }, user1: usernameFormat, user2: usernameFormat, winner: winnerFormat }
			}
		}
	}, newGame);
	gameRoutes.get("/:id", { schema: { params: gameParamSchema } }, showGame); // show game data
	// gameRoutes.post("/:id", { // edit game data
	// 	schema: {
	// 		body: {
	// 			type: "object",
	// 			required: ["score1", "score2"],
	// 			properties: { winner: usernameFormat }
	// 		},
	// 		params: gameParamSchema
	// 	}
	// }, editGame);
	// gameRoutes.get("/:id/delete", { schema: { params: gameParamSchema } }, deleteGame); // delete game related data
}

async function tournamentRoutes(tournamentRoutes: FastifyInstance) {//--------------------------------------------
	tournamentRoutes.get("/", showAllT); // show all tournaments
	tournamentRoutes.post("/", { // start a new tournament
		schema: {
			body: {
				type: "object",
				required: ["players"],
				properties: { players: playersFormat }
			}
		}
	}, newT);
	tournamentRoutes.get("/:id", { schema: { params: gameParamSchema } }, showT); // show tournament data
	tournamentRoutes.post("/:id", { // end a tournament
		schema: {
			body: {
				type: "object",
				required: ["winner_name"],
				properties: { winner_name: usernameFormat }
			},
			params: gameParamSchema
		}
	}, winT);
	// tournamentRoutes.get("/:id/delete", { schema: { params: gameParamSchema } }, deleteT); // delete tournament related data
}

export async function apiRoutes(routes: FastifyInstance) {//--------------------------------------------
	routes.register(userRoutes, { prefix: "/user" });
	routes.register(gameRoutes, { prefix: "/game" });
	routes.register(tournamentRoutes, { prefix: "/tournament" });
}
// -----------------------------------REST example-------
// async function rest(restroutes: FastifyInstance) {
//  restroutes.get("/", listall);
//  restroutes.get("/new", createform);
//  restroutes.post("/", addnew);
//  restroutes.get("/:id", showone);
//  restroutes.get("/:id/edit", editform);
//  restroutes.put("/:id", change);
//  restroutes.delete("/:id", deleteone);
// }