import { FastifyInstance } from "fastify";
import { OAuth2Namespace } from "@fastify/oauth2";
import { Database } from "better-sqlite3";
import { FastifyPluginCallback } from 'fastify';

declare module "fastify" {
	interface FastifyInstance {
		googleOAuth2: OAuth2Namespace;
		db: Database;
	}
}

// types/fastify-multipart.d.ts
declare const multipart: FastifyPluginCallback;
export default multipart;
