import { FastifyReply, FastifyRequest } from "fastify";

export async function getRoot(request: FastifyRequest, reply: FastifyReply) {
	return reply.view("index.ejs", { title: "ft_trans" });
}

export async function spa(request: FastifyRequest, reply: FastifyReply) {
	return reply.sendFile("../public/index.html"); // SPA entry point
}
