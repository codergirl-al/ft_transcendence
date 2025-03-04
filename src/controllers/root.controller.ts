import { FastifyReply, FastifyRequest } from "fastify";

export async function getRoot(request: FastifyRequest, reply: FastifyReply) {
	return reply.view("root.ejs", { title: "example" });
}

