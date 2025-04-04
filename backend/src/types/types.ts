
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
	id?: Number;
	username?: string;
	email?: string;
}

// layout of user_stats table
export interface UserStats {
	user_id: Number;
	total_games: Number;
	tour_wins: Number;
	game_wins: Number;
	losses: Number;
}

// layout of friends table
export interface FriendData {
	id: Number;
	user_id1: Number;
	user_id2: Number;
	status?: string;
	username1?: string;
	username2?: string;
}

// layout of tournament table
export interface TournamentData {
	id?: Number;
	winner?: Number;
	winner_name?: string;
	players?: Number;
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
	user2?: string;
	multi: boolean;
	winner: Number;
}

// request body during profile edit (multipart)
export interface UploadBody {
	username: string;
	avatarFile: string;
}
