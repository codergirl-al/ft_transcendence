import fp from "fastify-plugin";
import Database from "better-sqlite3";
import { FastifyInstance } from "fastify";
import { dbLogger } from "./logger";

async function dbConnector(fastify: FastifyInstance) {
	const dbFile: string = process.env.DB_FILE || "../transcend.db";
	if (!dbFile)
		throw new Error("Database file path is not defined.");
	const db = new Database(dbFile);

	// user data
	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		email TEXT UNIQUE NOT NULL,
		image_url TEXT NOT NULL DEFAULT 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR81iX4Mo49Z3oCPSx-GtgiMAkdDop2uVmVvw&s'
		);
	`);

	// user stats for dashboard
	db.exec(`
		CREATE TABLE IF NOT EXISTS user_stats (
		user_id INTEGER PRIMARY KEY,
		total_games INTEGER DEFAULT 0,
		wins INTEGER DEFAULT 0,
		losses INTEGER DEFAULT 0,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);
	`);

	// game data
	db.exec(`
		CREATE TABLE IF NOT EXISTS games (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id1 INTEGER,
		user_id2 INTEGER,
		score1 INTEGER NOT NULL DEFAULT 0,
		score2 INTEGER NOT NULL DEFAULT 0,
		winner_id INTEGER,
		date DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id1) REFERENCES users(id) ON DELETE SET NULL,
		FOREIGN KEY (user_id2) REFERENCES users(id) ON DELETE SET NULL,
		FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
		);
	`);

	// tournament data
	db.exec(`
		CREATE TABLE IF NOT EXISTS tournaments (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		winner_id INTEGER,
		participants INTEGER CHECK(participants IN (4, 8, 16)),
		FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
		);
	`);

	// link games to a tournament
	db.exec(`
		CREATE TABLE IF NOT EXISTS tournaments_games(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		tournament_id INTEGER NOT NULL,
		game_id INTEGER NOT NULL,
		FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
		FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
		);
	`)

	const notfound = db.prepare("SELECT username FROM users WHERE id = ?").get(1) as { username: string };
	if (!notfound || notfound.username != "usernotfound") {
		db.exec("INSERT INTO users (username, email) VALUES ('usernotfound', 'noemail@nothing.com');");
	}

	fastify.decorate("db", db);
	fastify.addHook("onClose", (fastify: FastifyInstance, done: Function) => {
		db.close();
		done();
	});
	dbLogger.info("database and tables created.");
}

export default fp(dbConnector);