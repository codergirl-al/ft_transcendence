import { FastifyReply, FastifyRequest } from "fastify";
import { ApiReply } from "../types/types";

export async function getRoot(request: FastifyRequest, reply: FastifyReply) {
	return reply.view("index.ejs", { title: "ft_trans" });
}

// export async function spa(request: FastifyRequest, reply: FastifyReply) {
// 	return reply.sendFile("../public/index.html"); // SPA entry point
// }

export function sendResponse<T>(reply: FastifyReply, statuscode: number, data?: T, error?: string) {
	const response: ApiReply<T> = {
		success: error ? false : true,
		error,
		data
	};
	return reply.code(statuscode).send(response);
}