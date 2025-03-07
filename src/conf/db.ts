import fp from "fastify-plugin";
import Database from "better-sqlite3";
// import env from "./env.js";
import { FastifyInstance } from "fastify";

async function dbConnector(fastify: FastifyInstance) {
	const dbFile: string = process.env.DB_FILE || "../transcend.db";
	if (!dbFile)
		throw new Error("Database file path is not defined.");

	const db = new Database(dbFile);
	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		email TEXT UNIQUE NOT NULL,
		image_url TEXT NOT NULL DEFAULT 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR81iX4Mo49Z3oCPSx-GtgiMAkdDop2uVmVvw&s',
		games INTEGER DEFAULT 0
		);
	`);

	// db.exec(`
	// 	CREATE TABLE IF NOT EXISTS games (
	// 	id INTEGER PRIMARY KEY AUTOINCREMENT,
	// 	user1 INTEGER,
	// 	user2 INTEGER,
	// 	score1 INTEGER,
	// 	score2 INTEGER
	// 	);
	// `);

	fastify.decorate("db", db);
	fastify.addHook("onClose", (fastify: FastifyInstance, done: Function) => {
		db.close();
		done();
	});
	console.log("database and tables created.")
}

export default fp(dbConnector);