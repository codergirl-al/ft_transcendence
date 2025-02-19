import fp from "fastify-plugin";
import Database from "better-sqlite3";
import env from "./env.js";

async function dbConnector(fastify, options) {
	const dbFile = env.dbFile || "./users.db";
	const db = new Database(dbFile, { verbose: console.log });

	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL,
		email TEXT NOT NULL
		);
	`);

	fastify.decorate("db", db);
	fastify.addHook("onClose", (fastify, done) => {
		db.close();
		done();
	});
	console.log("database and users table created.")
}

export default fp(dbConnector);