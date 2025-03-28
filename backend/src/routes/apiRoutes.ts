import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { newUser, showUser, editUser, deleteUser, logout } from "../controllers/login.controller";
import { newGame, showGame, showAllGames, editGame, deleteGame } from "../controllers/game.controller";
import { sendResponse } from "../controllers/root.controller";

// ---------------------------------------------------------------------------------------------------

const usernameFormat = { type: "string", minLength: 3, maxLength: 20 }

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
	userRoutes.post("/:id", { // update profile
		preValidation: [multipartRequest, userRoutes.authenticate],
		schema: {
			params: userParamSchema,
			consumes: ['multipart/form-data'],
			body: {
				type: 'object',
				required: ['username', 'avatarFile'],
				properties: {
					avatarFile: { type: 'object' },
					username: usernameFormat
				}
			}
		}
	}, editUser);
	userRoutes.get("/logout", logout);
	userRoutes.get("/:id/delete", { preValidation: userRoutes.authenticate, schema: { params: userParamSchema } }, deleteUser);
}

async function gameRoutes(gameRoutes: FastifyInstance) {
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