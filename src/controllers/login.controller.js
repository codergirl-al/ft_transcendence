// show the current users profile
export async function showProfile(request, reply) {
	return reply.view("showProfile.ejs", { title: "Profile", username: "none123", email: "none@asdf.com" });
}

// page to create a new profile
export async function createProfile(request, reply) {
	return reply.view("createProfile.ejs", { title: "New Profile", status: "enter data" });
}

// page to log in
export async function loginPage(request, reply) {
	return reply.view("login.ejs", { title: "Login", status: "enter data" });
}

// query db for username
export async function userLogin(request, reply) {
	const { username, password } = request.body;
	const { db } = request.server;
	const exists = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

	if (!exists)
		return reply.view("login.ejs", { title: "Login", status: "user not found" });
	if (exists.password != password)
		return reply.view("login.ejs", { title: "Login", status: "wrong password" });

	return reply.redirect("/profile/");
}

// add new user to db
export async function addNewProfile(request, reply) {
	const { username, email, password } = request.body;
	const { db } = request.server;
	const exists = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

	if (exists)
		return reply.view("createProfile.ejs", { title: "New Profile", status: "user exists" });
	const insertStatement = db.prepare(
		"INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
	);
	insertStatement.run(username, email, password);
	return reply.redirect("/login");//success
}

