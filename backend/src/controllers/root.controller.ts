import { FastifyReply, FastifyRequest } from "fastify";

export async function getRoot(request: FastifyRequest, reply: FastifyReply) {
	return reply.view("index.ejs", { title: "ft_transcendence" });
}

export async function spa(request: FastifyRequest, reply: FastifyReply) {
	return reply.sendFile("../public/index.html"); // SPA entry point
}
