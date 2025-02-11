const users = [
	{ id: 1, username: 'user1', password: 'password1' },
	{ id: 2, username: 'user2', password: 'password2' }
];

function authenticate(username, password) {
	const user = users.find(u => u.username === username && u.password === password);
	if (user) {
		return { id: user.id, username: user.username };
	} else {
		throw new Error('Authentication failed');
	}
}

function register(username, password) {
	if (users.find(u => u.username === username)) {
		throw new Error('User already exists');
	}
	const newUser = { id: users.length + 1, username, password };
	users.push(newUser);
	return { id: newUser.id, username: newUser.username };
}

module.exports = {
	authenticate,
	register
};