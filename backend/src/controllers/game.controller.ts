import { FastifyReply, FastifyRequest } from "fastify";
import { UserData, RequestParams, GameRequestBody, GameData } from "../types/types";
import { dbLogger } from "../conf/logger";
import { sendResponse } from "./root.controller";

// ----------------------------------------------------------------------------------------

// POST /api/game - create a new game
export async function newGame(request: FastifyRequest, reply: FastifyReply) {
	const { user1, user2 } = request.body as GameRequestBody;
	const { db } = request.server;

	const data = db.prepare("SELECT id, username FROM users WHERE username = ? OR username = ?").all(user1, user2) as UserData[];
	if (data.length < 2) {
		dbLogger.info(`New Game failed: ${user1} or ${user2} not found`);
		return sendResponse(reply, 400, undefined, "User not found");
	}

	const insertStatement = db.prepare(
		"INSERT INTO games (user_id1, user_id2) VALUES (?, ?)"
	);
	const info = insertStatement.run(data[0].id, data[1].id) as { lastInsertRowid: Number };
	dbLogger.info(`insert into games id = ${info.lastInsertRowid}`);
	return sendResponse(reply, 200);
}

// POST /api/game/:id - edit game by id
export async function editGame(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.params as RequestParams;
	const { score1, score2, winner } = request.body as GameRequestBody;
	const { db } = request.server;

	const game = db.prepare("SELECT * FROM games WHERE id = ?").get(id) as GameData | undefined;
	if (!game) {
		dbLogger.info(`Game edit failed: ID ${id} not found`);
		return sendResponse(reply, 400, undefined, "Game ID not found");
	}
	if (winner == "null") {
		const update = db.prepare("UPDATE games SET score1 = ?, score2 = ? WHERE id = ?");
		update.run(score1, score2, id);
	} else {
		const update = db.prepare("UPDATE games SET score1 = ?, score2 = ?, winner_id = ? WHERE id = ?");
		update.run(score1, score2, winner, id);
	}
	dbLogger.info(`update games where id = ${id}`);
	return sendResponse(reply, 200);

}

// GET /api/game/:id/delete - delete a game by id
export async function deleteGame(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.params as RequestParams;
	const { db } = request.server;

	const statement = db.prepare("DELETE FROM games WHERE id = ?");
	statement.run(id);
	dbLogger.info(`delete games where id = ${id}`);
	return sendResponse(reply, 200);
}

// GET /api/game/:id - get data of game by id
export async function showGame(request: FastifyRequest, reply: FastifyReply) {
	const game = getGameData(request);
	if (!game)
		return sendResponse(reply, 404, undefined, "Game ID not found");
	return sendResponse(reply, 200, game);
}

// GET /api/game - get a list of all games
export async function showAllGames(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	// show all game stats and usernames
	const game = db.prepare(`
		SELECT games.*,
			user1.username AS username1,
			user2.username AS username2
		FROM games
		LEFT JOIN users AS user1 ON games.user_id1 = user1.id
		LEFT JOIN users AS user2 ON games.user_id2 = user2.id`).all() as GameData[];
	dbLogger.info(`select all games`);
	return sendResponse(reply, 200, game);
}

// ----------------------------------------------------------------------------------------
// test

// TEST		GET /test/newGame
export async function newGameForm(request: FastifyRequest, reply: FastifyReply) {
	return reply.view("newGame.ejs", { title: "new Game" });
}

// TEST		GET /test/editGame/:id
export async function editGameForm(request: FastifyRequest, reply: FastifyReply) {
	const game = getGameData(request);
	if (!game)
		return sendResponse(reply, 404, undefined, "Game ID not found");
	return reply.view("editGame.ejs", { title: "edit Game", game: game });
}

// ----------------------------------------------------------------------------------------
// utils

function getGameData(request: FastifyRequest) {
	const { id } = request.params as RequestParams;
	const { db } = request.server;
	const game = db.prepare(`
		SELECT games.*,
			user1.username AS username1,
			user2.username AS username2
		FROM games
		LEFT JOIN users AS user1 ON games.user_id1 = user1.id
		LEFT JOIN users AS user2 ON games.user_id2 = user2.id
		WHERE games.id = ?;`).get(id) as GameData | undefined;
	dbLogger.info(`Queried for Game: ID ${id}`);
	return game;
}