import { FriendData, TokenData, UserData, UserRequestBody, RequestParams } from "../types/types";
import { FastifyRequest, FastifyReply } from "fastify";
import { sendResponse } from "./root.controller";

// import { newFriend, getFriend, myFriends, deleteFriend } from "../controllers/friends.controller";

// POST /api/friend
export async function newFriend(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const body = request.body as UserRequestBody;
	const user = request.user as TokenData;

	const db_user = db.prepare("SELECT * FROM users WHERE email = ?").get(user.email) as UserData | undefined;
	const friend = db.prepare("SELECT * FROM users WHERE username = ?").get(body.username) as UserData | undefined;
	if (!db_user || !friend)
		return sendResponse(reply, 404, undefined, "User not found");
	if (db_user.id === friend.id || friend.id === 1)
		return sendResponse(reply, 400, undefined, "invalid username");

	const done = db.prepare("SELECT * FROM friends WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)")
		.get(db_user.id, friend.id, friend.id, db_user.id) as FriendData | undefined;
	if (done && done.status === 'accepted') // already done
		return sendResponse(reply, 400, undefined, "Already friends");

	if (done && done.user_id2 === db_user.id) { // accept request
		const accept = db.prepare("UPDATE friends SET status = 'accepted' WHERE user_id1 = ? AND user_id2 = ?");
		const info = accept.run(friend.id, db_user.id);
		return sendResponse(reply, 200, { id: info.lastInsertRowid });
	}
	if (done) // double request
		return sendResponse(reply, 400, undefined, "friend request already sent");

	const insert = db.prepare("INSERT INTO friends (user_id1, user_id2, status) VALUES (?, ?, 'pending')");
	const info = insert.run(db_user.id, friend.id);

	const result = db.prepare("SELECT * FROM friends WHERE id = ?").get(info.lastInsertRowid);
	return sendResponse(reply, 200, result);
}

// GET /api/friend
export async function myFriends(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const user = request.user as TokenData;
	const user_id = db.prepare("SELECT id FROM users WHERE email = ?").get(user.email) as UserData | undefined;
	if (!user_id)
		return sendResponse(reply, 404, undefined, "User not found");

	const friends = db.prepare(`
		SELECT friends.*,
			user1.username AS username1,
			user2.username AS username2,
			user1.status AS status1,
			user2.status AS status2
		FROM friends
		LEFT JOIN users AS user1 ON friends.user_id1 = user1.id
		LEFT JOIN users AS user2 ON friends.user_id2 = user2.id
		WHERE friends.user_id1 = ? OR friends.user_id2 = ?`).all(user_id.id, user_id.id) as FriendData[];
	return sendResponse(reply, 200, friends);
}

// GET /api/friend/:id
export async function getFriend(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const { email } = request.user as TokenData;
	const { id } = request.params as RequestParams;

	const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as UserData | undefined;
	const friend = db.prepare("SELECT id FROM users WHERE username = ?").get(id) as UserData | undefined;
	if (!user || !friend)
		return sendResponse(reply, 404, undefined, "User not found");

	const friendship = db.prepare("SELECT * FROM friends WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)")
		.get(user.id, friend.id, friend.id, user.id) as FriendData | undefined;
	return sendResponse(reply, 200, friendship);
}

// GET /api/friend/:id/delete
export async function deleteFriend(request: FastifyRequest, reply: FastifyReply) {
	const { db } = request.server;
	const { email } = request.user as TokenData;
	const { id } = request.params as RequestParams;

	const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as UserData | undefined;
	const friend = db.prepare("SELECT id FROM users WHERE username = ?").get(id) as UserData | undefined;
	if (!user || !friend)
		return sendResponse(reply, 404, undefined, "User not found");

	const statement = db.prepare("DELETE FROM friends WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)");
	const info = statement.run(user.id, friend.id, friend.id, user.id);
	if (info.changes <= 0)
		return sendResponse(reply, 500, undefined, "Failed to delete friend");
	return sendResponse(reply, 200);
}
