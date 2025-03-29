import fp from "fastify-plugin";
import Database from "better-sqlite3";
import { FastifyInstance } from "fastify";
import { dbLogger } from "./logger";
import { UserData } from "../types/types";

async function dbConnector(fastify: FastifyInstance) {
	const dbFile: string = process.env.FASTIFY_DB_FILE || "../transcend.db";
	if (!dbFile)
		throw new Error("Database file path is not defined.");
	const db = new Database(dbFile);

	// user data
	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY,
		username TEXT UNIQUE NOT NULL,
		email TEXT UNIQUE NOT NULL
		);
	`);

	// user stats for dashboard
	db.exec(`
		CREATE TABLE IF NOT EXISTS user_stats (
		user_id INTEGER PRIMARY KEY,
		total_games INTEGER DEFAULT 0,
		tour_wins INTEGER DEFAULT 0,
		game_wins INTEGER DEFAULT 0,
		losses INTEGER DEFAULT 0,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);
	`);

	// game data
	db.exec(`
		CREATE TABLE IF NOT EXISTS games (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		multi BOOLEAN,
		user_id1 INTEGER DEFAULT 1,
		user_id2 INTEGER DEFAULT 1,
		winner_id INTEGER DEFAULT 1,
		date DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id1) REFERENCES users(id) ON DELETE SET DEFAULT,
		FOREIGN KEY (user_id2) REFERENCES users(id) ON DELETE SET DEFAULT,
		FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET DEFAULT
		);
	`);

	// tournament data
	db.exec(`
		CREATE TABLE IF NOT EXISTS tournaments (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		winner_id INTEGER DEFAULT 1,
		participants INTEGER CHECK(participants IN (4, 6, 8)),
		FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET DEFAULT
		);
	`);

	// // link games to a tournament
	// db.exec(`
	// 	CREATE TABLE IF NOT EXISTS tournaments_games(
	// 	id INTEGER PRIMARY KEY AUTOINCREMENT,
	// 	tournament_id INTEGER NOT NULL,
	// 	game_id INTEGER NOT NULL,
	// 	FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
	// 	FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
	// 	);
	// `)

	const notfound = db.prepare("SELECT * FROM users WHERE id = ?").get(1) as UserData | undefined;
	if (!notfound) {
		db.exec("INSERT INTO users (id, username, email) VALUES (1, 'usernotfound', 'noemail@nothing.com');");
		dbLogger.info(`Created blank user 'usernotfound' ID 1`);
	} else if (notfound.username != "usernotfound") {
		db.exec(`DELETE FROM users WHERE username = ${notfound.username}`);
		db.exec("INSERT INTO users (id, username, email) VALUES (1, 'usernotfound', 'noemail@nothing.com');");
		db.exec(`INSERT INTO users (username, email) VALUES (${notfound.username}, ${notfound.email});`);
		dbLogger.info(`Created blank user 'usernotfound' ID 1, moved user ${notfound.username}`);
	}

	fastify.decorate("db", db);
	fastify.addHook("onClose", (fastify: FastifyInstance, done: Function) => {
		db.close();
		done();
	});
	dbLogger.info("Database and tables created.");
}

export default fp(dbConnector);