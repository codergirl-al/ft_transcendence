
export async function getRoot(request, reply) {
	return reply.view("root.ejs", { title: "example" });
}

