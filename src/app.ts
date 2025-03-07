// import Fastify, { FastifyInstance } from "fastify";
// import fs from "fs";
// import { indexPage } from "./public/index";
// // project files
// import routes from "./routes/routes.js";
// import dbConnector from "./conf/db.js";
// import { serverLogger } from "./conf/logger.js";
// // fastify plugins
// import fastifyView from "@fastify/view";
// import fastifyStatic from "@fastify/static";
// import fastifyFormbody from "@fastify/formbody";
// import fastifyOauth2 from '@fastify/oauth2';
// import fastifyCookie from "@fastify/cookie";
// // utils
// import path from "node:path";
// import ejs from "ejs";
// import { IndentStyle } from "typescript";

// // ----------------------------------------------------------------------
// // get fastify
// const fastify: FastifyInstance = Fastify({ logger: true });

// // PLUGINS---------------------------------------------------------------
// // request body
// fastify.register(fastifyFormbody);
// // ejs
// fastify.register(fastifyView, {
// 	engine: { ejs },
// 	root: path.join(__dirname, "../src/views"),
// 	viewExt: "ejs",
// 	layout: "layout.ejs",
// });
// // static files
// fastify.register(fastifyStatic, {
// 	root: path.join(__dirname, "../src/public"),
// 	prefix: "/public/",
// });
// // cookies for login
// fastify.register(fastifyCookie);
// // google authentication
// fastify.register(fastifyOauth2, {
// 	name: 'googleOAuth2',
// 	scope: ['profile', 'email'],
// 	credentials: {
// 		client: {
// 			id: process.env.GOOGLE_CLIENT_ID!,
// 			secret: process.env.GOOGLE_CLIENT_SECRET!,
// 		},
// 		auth: fastifyOauth2.GOOGLE_CONFIGURATION,
// 	},
// 	startRedirectPath: '/google-login',
// 	callbackUri: `${process.env.BASE_URL}/google-login/callback`,
// });
// // create database
// fastify.register(dbConnector);
// // configure routes (./routes/routes.ts)
// fastify.register(routes);

// // SERVER----------------------------------------------------------------
// const port = Number(process.env.PORT) || 3000;
// const address = process.env.ADDRESS;
// fastify.listen({ port: port, host: address }, (err, addr) => {
// 	if (err) {
// 		fastify.log.error(err);
// 		process.exit(1);
// 	}
// 	serverLogger.info(`transcendence is running in ${process.env.NODE_ENV} mode at ${addr}`);
// });



// // Serve static files
// fastify.register(fastifyStatic, {
//     root: path.join(__dirname, "../src/public"),
//     prefix: "/public/",
// });

// // Serve index.ts as the main page
// fastify.get("/", async (req, reply) => {
// 	reply.type("text/html").send(indexPage());
// });

// // Serve SPA routes dynamically
// fastify.get("/*", async (req, reply) => {
// 	reply.type("text/html").send(indexPage());
// });

import Fastify, { FastifyInstance } from "fastify";
import path from "node:path";
import { indexPage } from "./public/index";
import routes from "./routes/routes.js";
import dbConnector from "./conf/db.js";
import { serverLogger } from "./conf/logger.js";
import fastifyView from "@fastify/view";
import fastifyStatic from "@fastify/static";
import fastifyFormbody from "@fastify/formbody";
import fastifyOauth2 from "@fastify/oauth2";
import fastifyCookie from "@fastify/cookie";
import ejs from "ejs";

const fastify: FastifyInstance = Fastify({ logger: true });

// ✅ Register `fastifyStatic` only ONCE
fastify.register(fastifyStatic, {
    root: path.join(__dirname, "../src/public"),
    prefix: "/public/",
});

// ✅ Register necessary plugins
fastify.register(fastifyFormbody);
fastify.register(fastifyView, {
    engine: { ejs },
    root: path.join(__dirname, "../src/views"),
    viewExt: "ejs",
    layout: "layout.ejs",
});
fastify.register(fastifyCookie);
fastify.register(fastifyOauth2, {
    name: "googleOAuth2",
    scope: ["profile", "email"],
    credentials: {
        client: {
            id: process.env.GOOGLE_CLIENT_ID!,
            secret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/google-login",
    callbackUri: `${process.env.BASE_URL}/google-login/callback`,
});
fastify.register(dbConnector);
fastify.register(routes);

// ✅ Serve `index.ts` as the main page
fastify.get("/main.ts", async (req, reply) => {
    reply.type("text/html").send(indexPage());
});

// ✅ Serve SPA routes dynamically
fastify.get("/*", async (req, reply) => {
    reply.type("text/html").send(indexPage());
});

// ✅ Start server
const port = Number(process.env.PORT) || 3000;
const address = process.env.ADDRESS;
fastify.listen({ port: port, host: address }, (err, addr) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    serverLogger.info(`Transcendence is running in ${process.env.NODE_ENV} mode at ${addr}`);
});
