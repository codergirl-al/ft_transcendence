import { FastifyReply, FastifyRequest } from "fastify";
import path from "node:path";

export async function spa(request: FastifyRequest, reply: FastifyReply) {
	return reply.sendFile('index.html', path.join(__dirname, "../public"));
}
