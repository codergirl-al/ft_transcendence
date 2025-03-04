import fp from "fastify-plugin";
import Database from "better-sqlite3";
// import env from "./env.js";
import { FastifyInstance } from "fastify";

async function dbConnector(fastify: FastifyInstance) {
	const dbFile: string = process.env.DB_FILE || "../users.db";
	if (!dbFile)
		throw new Error("Database file path is not defined.");

	const db = new Database(dbFile);
	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL,
		email TEXT NOT NULL
		);
	`);

	fastify.decorate("db", db);
	fastify.addHook("onClose", (fastify: FastifyInstance, done: Function) => {
		db.close();
		done();
	});
	console.log("database and users table created.")
}

export default fp(dbConnector);