
// standart api reply format
export interface ApiReply<T> {
	success: boolean;
	error?: string;
	data?: T;
}

// game.id or user.username inside uri
export interface RequestParams {
	id: string;
}

// layout of user table
export interface TokenData {
	email: string;
	token: string;
}

// layout of user table
export interface UserData {
	id: Number;
	username?: string;
	email?: string;
}

// request body during user creation
export interface UserRequestBody {
	username: string;
	email: string;
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

// request body during profile edit (multipart)
export interface UploadBody {
	username: string;
	avatarFile: string;
}
