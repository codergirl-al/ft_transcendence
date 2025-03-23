// game.id or user.username inside uri
export interface RequestParams {
	id: string;
}

// standart api reply format
export interface ApiReply {
	success: boolean;
	message: string;
	content: {
		user?: UserData;
		game?: GameData;
	};
}

// layout of user table
export interface UserData {
	id: Number;
	username?: string;
	image_url?: string;
	email?: string;
}
// request body during user creation
export interface UserRequestBody {
	username: string;
}

// layout of games table
export interface GameData {
	id: Number;
	user_id1: Number;
	user_id2: Number;
	score1: Number;
	score2: Number;
	winner_id: Number;
	date: string;
	user1_name: string;
	user2_name: string;
}

// request body during game creation
export interface GameRequestBody {
	user1: string;
	user2: string;
	score1: Number;
	score2: Number;
	winner: string;
}