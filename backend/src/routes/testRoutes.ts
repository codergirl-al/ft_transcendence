// import { FastifyInstance } from "fastify";
// // import { loggedinUser, newUserForm, editUserForm, accountDashboard } from "../controllers/login.controller";
// // import { newGameForm, editGameForm } from "../controllers/game.controller";

// export async function testRoutes(app: FastifyInstance) {
// 	app.get("/currentuser", {preValidation: app.authenticate}, loggedinUser);//show logged in user				TMP
// 	app.get("/newUser", {preValidation: app.authenticate}, newUserForm);//form to create a user				TMP
// 	app.get("/editUser/:id", {preValidation: app.authenticate}, editUserForm);//form to edit user				TMP
// 	// app.get("/newGame", newGameForm);//form to start a new game				TMP
// 	// app.get("/editGame/:id", editGameForm);//form to edit game stats		TMP
// 	app.get("/dashboard", {preValidation: app.authenticate}, accountDashboard);//form to edit game stats		TMP
// }
