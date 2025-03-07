import { FastifyInstance, FastifyRequest } from "fastify";
import { OAuth2Namespace } from "@fastify/oauth2";

declare module "fastify" {
	interface FastifyInstance {
		googleOAuth2: OAuth2Namespace;
		db: Database;
	}
}
