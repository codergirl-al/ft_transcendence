import { FastifyReply, FastifyRequest } from "fastify";
import { TournamentData, RequestParams, UserData } from "../types/types";
import { dbLogger } from "../conf/logger";//NO LOGS YET
import { sendResponse } from "./root.controller";

// ----------------------------------------------------------------------------------------

// GET /api/tournament - show all tournaments
export async function showAllT(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const tourn = db.prepare("SELECT * FROM tournaments").all() as TournamentData[];
	return sendResponse(reply, 200, tourn);
}

// POST /api/tournament - start a new tournament
export async function newT(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const { players } = request.body as TournamentData;
	const statement = db.prepare("INSERT INTO tournaments (participants) VALUES (?)");
	const info = statement.run(players);
	if (info.changes <= 0)
		return sendResponse(reply, 500, undefined, "Failed to create tournament");
	return sendResponse(reply, 200, { id: info.lastInsertRowid });
}

// GET /api/tournament/:id - show tournament data
export async function showT(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const { id } = request.params as RequestParams;

	const tourn = db.prepare("SELECT * FROM tournaments WHERE id = ?").get(id) as TournamentData | undefined;
	if (!tourn)
		return sendResponse(reply, 404, undefined, "Tournament not found");
	return sendResponse(reply, 200, tourn);
}

// POST /api/tournament/:id - end a tournament
export async function winT(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const { id } = request.params as RequestParams;
	const { winner_name } = request.body as TournamentData;

	const tourn = db.prepare("SELECT id FROM tournaments WHERE id = ?").get(id) as TournamentData | undefined;
	if (!tourn)
		return sendResponse(reply, 404, undefined, "Tournament not found");
	const user = db.prepare("SELECT id FROM users WHERE username = ?").get(winner_name) as UserData | undefined;
	if (!user)
		return sendResponse(reply, 404, undefined, "Username not found");

	const update = db.prepare("UPDATE tournaments SET winner_id = ? WHERE id = ?");
	const info = update.run(user.id, tourn.id);
	if (info.changes <= 0)
		return sendResponse(reply, 500, undefined, "Failed to add winner to tournament");

	const win = db.prepare("UPDATE user_stats SET tour_wins = tour_wins + 1 WHERE user_id = ?");
	const win_info = win.run(user.id);
	if (win_info.changes <= 0)
		return sendResponse(reply, 500, undefined, "Winner added, failed to increment wins");
	return sendResponse(reply, 200);
}
