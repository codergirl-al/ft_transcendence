import { FastifyReply, FastifyRequest } from "fastify";
import { UserData, RequestParams, GameRequestBody, GameData, TokenData } from "../types/types";
import { sendResponse } from "./root.controller";

// ----------------------------------------------------------------------------------------

// POST /api/game - create a new game
export async function newGame(request: FastifyRequest, reply: FastifyReply) {
	const { multi, user1, user2, winner } = request.body as GameRequestBody;
	const { db } = request.server;
	const gameStatement = db.prepare("INSERT INTO games (multi, user_id1, user_id2, winner_id) VALUES (?, ?, ?, ?)");
	const winStatement = db.prepare("UPDATE user_stats SET game_wins = game_wins + 1, total_games = total_games + 1 WHERE user_id = ?");
	const lossStatement = db.prepare("UPDATE user_stats SET losses = losses + 1, total_games = total_games + 1 WHERE user_id = ?");

	const id1 = db.prepare("SELECT id FROM users WHERE username = ?").get(user1) as UserData | undefined;
	if (!id1)
		return sendResponse(reply, 404, undefined, "User not found");
	if (multi) {
		const id2 = db.prepare("SELECT id FROM users WHERE username = ?").get(user2) as UserData | undefined;
		if (!id2)
			return sendResponse(reply, 404, undefined, "User not found");
		winStatement.run(( winner==1 ? id1.id : id2.id ));
		lossStatement.run(( winner==1 ? id2.id : id1.id ));
		gameStatement.run(1, id1.id, id2.id, ( winner==1 ? id1.id : id2.id ));
	} else {
		if (winner == 1) {
			winStatement.run(id1.id);
		} else {
			lossStatement.run(id1.id);
		}
		gameStatement.run(0, id1.id, 1, ( winner==1 ? id1.id : 1 ));
	}
	return sendResponse(reply, 200);
}

// GET /api/game/:id/delete - delete a game by id
export async function deleteGame(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.params as RequestParams;
	const { db } = request.server;

	const statement = db.prepare("DELETE FROM games WHERE id = ?");
	statement.run(id);
	return sendResponse(reply, 200);
}

// GET /api/game/:id - get data of game by id
export async function showGame(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.params as RequestParams;
	const { db } = request.server;
	const game = db.prepare(`
		SELECT games.*,
			user1.username AS username1,
			user2.username AS username2
		FROM games
		LEFT JOIN users AS user1 ON games.user_id1 = user1.id
		LEFT JOIN users AS user2 ON games.user_id2 = user2.id
		WHERE games.id = ?;
	`).get(id) as GameData | undefined;
	if (!game)
		return sendResponse(reply, 404, undefined, "Game ID not found");
	return sendResponse(reply, 200, game);
}

// GET /api/game/all - get a list of all games
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
	return sendResponse(reply, 200, game);
}

// GET /api/game - get a list of all games
export async function showMyGames(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const userInfo = request.user as TokenData;

	const user = db.prepare("SELECT id FROM users WHERE email = ?").get(userInfo.email) as UserData | undefined;
	if (!user)
		return sendResponse(reply, 401, undefined, "Unauthorized");
	// show all game stats and usernames
	const game = db.prepare(`
		SELECT games.*,
			user1.username AS username1,
			user2.username AS username2
		FROM games
		LEFT JOIN users AS user1 ON games.user_id1 = user1.id
		LEFT JOIN users AS user2 ON games.user_id2 = user2.id
		WHERE games.user_id1 = ? OR games.user_id2 = ?`).all(user.id, user.id) as GameData[];
	return sendResponse(reply, 200, game);
}

// GET /api/game/user/:id - get a list of users games
export async function showUserGames(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const { id } = request.params as RequestParams;

	const user = db.prepare("SELECT id FROM users WHERE username = ?").get(id) as UserData | undefined;
	if (!user)
		return sendResponse(reply, 404, undefined, "User not found");
	// show all game stats and usernames
	const game = db.prepare(`
		SELECT games.*,
			user1.username AS username1,
			user2.username AS username2
		FROM games
		LEFT JOIN users AS user1 ON games.user_id1 = user1.id
		LEFT JOIN users AS user2 ON games.user_id2 = user2.id
		WHERE games.user_id1 = ? OR games.user_id2 = ?`).all(user.id, user.id) as GameData[];
	return sendResponse(reply, 200, game);
}
