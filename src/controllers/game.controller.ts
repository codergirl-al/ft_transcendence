import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { UserData, RequestParams } from "./login.controller";
// import Ajv from "ajv";
import { dbLogger } from "../conf/logger";
// import { dbLogger } from "../conf/logger";

let fastify: FastifyInstance;
interface GameRequestBody {
	user1: string;
	user2: string;
}

// POST /api/game
export async function newGame(request: FastifyRequest, reply: FastifyReply) {
	const { user1, user2 } = request.body as GameRequestBody;
	const { db } = request.server;

	const data = db.prepare("SELECT id, username FROM users WHERE username = ? OR username = ?").all(user1, user2) as UserData[];
	dbLogger.debug(data);
	if (data.length < 2)
		return reply.code(400).send({ message: "Invalid Username" });

	const insertStatement = db.prepare(
		"INSERT INTO games (user_id1, user_id2) VALUES (?, ?)"
	);
	const info = insertStatement.run(data.at(0)?.id, data.at(1)?.id) as { lastInsertRowid: Number };//ERROR
	return reply.redirect(`/api/game/${info.lastInsertRowid}`);
}

// GET /api/game/new
export async function newGameForm(request: FastifyRequest, reply: FastifyReply) {
	return reply.view("newGame.ejs", { title: "new Game" });
}

// GET /api/game/:id
export async function showGame(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.params as RequestParams;
	const { db } = request.server;
	// show all game stats and usernames
	const game = db.prepare(`
		SELECT games.*,
			user1.username AS user1_name,
			user2.username AS user2_name
		FROM games
		LEFT JOIN users AS user1 ON games.user_id1 = user1.id
		LEFT JOIN users AS user2 ON games.user_id2 = user2.id
		WHERE games.id = ?;`).get(id);

	dbLogger.info(`${game}`);
	return reply.code(200).send(game);
}
