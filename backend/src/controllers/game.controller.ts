import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { UserData, RequestParams } from "./login.controller";
import { dbLogger } from "../conf/logger";

let fastify: FastifyInstance;

interface GameRequestBody {
  user1: string;
  user2: string;
  score1: Number;
  score2: Number;
  winner: string;
}

export interface GameData {
  id: Number;
  user_id1: Number;
  user_id2: Number;
  score1: Number;
  score2: Number;
  winner_id: Number;
  date: string;
  user1_name: string;
  user2_name: string;
}

// POST /api/game - Create a new game using two usernames
export async function newGame(request: FastifyRequest, reply: FastifyReply) {
  const { user1, user2 } = request.body as GameRequestBody;
  const { db } = request.server;

  const data = db
	.prepare("SELECT id, username FROM users WHERE username = ? OR username = ?")
	.all(user1, user2) as UserData[];
  if (data.length < 2) {
	dbLogger.info(`New Game failed: ${user1} or ${user2} not found`);
	return reply.code(400).send({ message: "Invalid Username" });
  }

  const insertStatement = db.prepare(
	"INSERT INTO games (user_id1, user_id2) VALUES (?, ?)"
  );
  const info = insertStatement.run(data[0].id, data[1].id) as { lastInsertRowid: Number };
  dbLogger.info(`insert into games id = ${info.lastInsertRowid}`);
  return reply.redirect(`/api/game/${info.lastInsertRowid}`);
}

// POST /api/game/:id - Edit an existing game
export async function editGame(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as RequestParams;
  const { score1, score2, winner } = request.body as GameRequestBody;
  const { db } = request.server;

  const game = db.prepare("SELECT * FROM games WHERE id = ?").get(id) as GameData | undefined;
  if (!game) {
	dbLogger.info(`Game edit failed: ID ${id} not found`);
	return reply.code(400).send({ message: "game id not found" });
  }
  if (winner === "null") {
	const update = db.prepare("UPDATE games SET score1 = ?, score2 = ? WHERE id = ?");
	update.run(score1, score2, id);
	dbLogger.info(`update games where id = ${id}`);
	return reply.redirect(`/api/game/${id}`);
  }
  const update = db.prepare("UPDATE games SET score1 = ?, score2 = ?, winner_id = ? WHERE id = ?");
  update.run(score1, score2, winner, id);
  dbLogger.info(`update games where id = ${id}`);
  return reply.redirect(`/api/game/${id}`);
}

// GET /api/game/:id/delete - Delete a game by ID
export async function deleteGame(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as RequestParams;
  const { db } = request.server;

  const statement = db.prepare("DELETE FROM games WHERE id = ?");
  statement.run(id);
  dbLogger.info(`delete games where id = ${id}`);
  return reply.redirect("/api/game/");
}

// GET /api/game/:id/edit - Render the edit game form
export async function editGameForm(request: FastifyRequest, reply: FastifyReply) {
  const game = getGameData(request);
  if (!game)
	return reply.code(400).send({ message: "game not found" });
  return reply.view("editGame.ejs", { title: "edit Game", game: game });
}

// GET /api/game/:id - Show game details
export async function showGame(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as RequestParams;
  const { db } = request.server;
  const game = getGameData(request);
  if (!game)
	return reply.code(400).send({ message: "game not found" });
  return reply.code(200).send(game);
}

// GET /api/game - Show all games
export async function showAllGames(request: FastifyRequest, reply: FastifyReply) {
  const { db } = request.server;
  const game = db.prepare(`
	SELECT games.*,
	  user1.username AS username1,
	  user2.username AS username2
	FROM games
	LEFT JOIN users AS user1 ON games.user_id1 = user1.id
	LEFT JOIN users AS user2 ON games.user_id2 = user2.id
  `).all() as GameData[];
  dbLogger.info(`select all games`);
  return reply.code(200).send(game);
}

// GET /game/new - Render the game creation page based on mode and connection query parameters
export async function newGameForm(request: FastifyRequest, reply: FastifyReply) {
	const { mode, connection } = request.query as { mode?: string; connection?: string };
  
	// Default to offline single-player if no query parameters are provided
	if (!mode && !connection) {
	  return reply.view('newGame.ejs', { title: 'Offline Single-Player' });
	}
  
	if (mode === 'single' && connection === 'offline') {
	  return reply.view('newGame.ejs', { title: 'Offline Single-Player' });
	} else if (mode === 'single' && connection === 'online') {
	  return reply.view('onlineSingle.ejs', { title: 'Online Single-Player' });
	} else if (mode === 'multi' && connection === 'offline') {
	  return reply.view('newGameOfflineMulti.ejs', { title: 'Offline Multi-Player' });
	} else if (mode === 'multi' && connection === 'online') {
	  return reply.view('onlineMulti.ejs', { title: 'Online Multi-Player' });
	}
  
	// Fallback in case of invalid query parameters
	return reply.view('selectGameMode.ejs', { title: 'Select Game Mode' });
  }
  
// Helper function to get game data along with usernames
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
	WHERE games.id = ?;
  `).get(id) as GameData | undefined;
  dbLogger.info(`Queried for Game: ID ${id}`);
  return game;
}