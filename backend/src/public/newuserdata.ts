document.addEventListener("DOMContentLoaded", async () => {
	newFriend();
	const login = await getmyUser();
	if (!login || login.length < 1)
		return;
	gamestats(login);
	getFriendlist(login);
	requestList(login);
});

function newFriend() {
	const newFriendBtn = document.getElementById('newFriendBtn');
	const statustext = document.getElementById('statustext');
	const newFriendBar = document.getElementById('newFriendBar') as HTMLInputElement | null;
	if (!newFriendBtn || !newFriendBar || !statustext)
		return;
	newFriendBtn.addEventListener('click', async () => {
		const username = newFriendBar.value.trim();
		if (!username) {
			statustext.innerHTML = "No username entered";
			return;
		}
		try {
			const response = await fetch('/api/friend', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username })
			});
			if (!response.ok) {
				console.error("Error in route - POST /api/friend");
			}
			const data = await response.json();
			if (data.success) {
				statustext.innerHTML = 'friend request sent';
				window.location.reload();
			} else if (data.status === 401) {
				statustext.innerHTML = 'log in to make friends :)';
			} else if (data.status === 404) {
				statustext.innerHTML = 'user not found';
			} else {
				statustext.innerHTML = `couldn't send request`;
			}
		} catch (error) {
			console.error(error);
		}
	});
}

async function getmyUser() {
	let login = "";
	const username = document.getElementById('myUsername');
	const avatar = document.getElementById('myAvatar') as HTMLImageElement;
	const status = document.getElementById('myOnlinestatus');

	if (!username || !avatar || !status)
		return null;
	try {
		const response = await fetch(`/api/user`, { method: 'GET' });
		if (!response.ok) {
			username.innerHTML = 'You are not logged in -> go to /google-login';
			return;
		}
		const data = await response.json();
		if (data.success) {
			login = data.data.username;
			username.innerHTML = data.data.username;
			status.innerHTML = "online";
			avatar.src = `/uploads/${data.data.id}.png`;
		} else {
			username.innerHTML = 'You are not logged in -> go to /google-login';
		}
	} catch (error) {
		console.error("Error myUser:", error);
	}
	return login;
}

async function getFriendlist(login: string) {
	const friendlist = document.getElementById('friendlist');
	if (!friendlist)
		return;
	try {
		const response = await fetch(`/api/friend`, { method: 'GET' });
		if (response.status == 401) {
			friendlist.innerHTML = 'You are not logged in -> go to /google-login';
			return;
		} else if (!response.ok) {
			console.error("Error in route - GET /api/friend");
			return;
		}
		const data = await response.json();
		if (data.success) {
			let accepted = "";
			for (const friend of data.data) {
				let friendindex = (friend.username1 === login) ? 2 : 1;
				if (friend.status === 'accepted') {
					accepted = accepted + `<li class="flex justify-between items-center p-2 bg-purple-600 rounded-md">
								<span><img src='/uploads/${(friendindex === 1) ? friend.user_id1 : friend.user_id2}.png' class="w-10 h-10 rounded-full border-2 border-gray-300" onerror="this.onerror=null; this.src='/uploads/default.png';"></span>
								<span class="text-white p-2">${(friendindex === 1) ? friend.username1 : friend.username2}</span>
								<span class="ml-auto text-sm text-white">${((friendindex === 1) ? friend.status1 : friend.status2) || "offline"}</span>
								</li>`;
				}
			}
			friendlist.innerHTML = accepted;
		} else {
			friendlist.innerHTML = 'You are not logged in -> go to /google-login';
		}
	} catch (error) {
		console.error("Error friends:", error);
	}
}

async function requestList(login: string) {
	const friendlist = document.getElementById('requestlist');
	if (!friendlist)
		return;
	try {
		const response = await fetch(`/api/friend`, { method: 'GET' });
		if (response.status == 401) {
			friendlist.innerHTML = 'You are not logged in -> go to /google-login';
			return;
		} else if (!response.ok) {
			console.error("Error in route - GET /api/friend");
			return;
		}
		const data = await response.json();
		if (data.success) {
			let pending = "";
			let sent = "";
			for (const friend of data.data) {
				if (friend.status === 'pending') {
					if (friend.username1 === login) {
						sent = sent + `<li class="flex justify-between items-center p-2 bg-purple-600 rounded-md">
								<span><img src='/uploads/${friend.user_id2}.png' class="w-10 h-10 rounded-full border-2 border-gray-300" onerror="this.onerror=null; this.src='/uploads/default.png';"></span>
								<span class="text-white p-2">${friend.username2}</span>
								<span class="ml-auto text-sm text-white">waiting...</span>
								</li>`;
					} else {
						pending = pending + `<li class="flex justify-between items-center p-2 bg-purple-600 rounded-md">
								<span><img src='/uploads/${friend.user_id1}.png' class="w-10 h-10 rounded-full border-2 border-gray-300" onerror="this.onerror=null; this.src='/uploads/default.png';"></span>
								<span class="text-white p-2">${friend.username1}</span>
								<button class="ml-auto px-3 py-1 bg-purple-400 text-green-500 rounded-md accept-btn" data-username="${friend.username1}">accept</button>
								</li>`;
					}
				}
			}
			friendlist.innerHTML = pending + sent;

			// Add event listeners for accept buttons
			const acceptButtons = document.querySelectorAll('.accept-btn');
			acceptButtons.forEach(button => {
				button.addEventListener('click', async (event) => {
					const username = (event.target as HTMLElement).getAttribute('data-username');
					if (!username) return;
					try {
						const response = await fetch('/api/friend', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ username })
						});
						if (response.ok) {
							window.location.reload();
						} else {
							console.error("Error in route - POST /api/friend");
						}
					} catch (error) {
						console.error("Error accepting friend request:", error);
					}
				});
			});
		} else {
			friendlist.innerHTML = 'You are not logged in -> go to /google-login';
		}
	} catch (error) {
		console.error("Error friends:", error);
	}
}

async function gamestats(login: string) {
	const matchhistory = document.getElementById('matchhistory');

	if (!matchhistory)
		return;
	const response = await fetch(`/api/game`, { method: 'GET' });
	if (response.status == 401) {
		matchhistory.innerHTML = 'Log in to see your past games';
		return;
	} else if (!response.ok) {
		console.error("Error in route - GET /api/game");
		return;
	}
	const data = await response.json();
	if (data.success) {
		let content = "";
		for (const game of data.data) {
			if (game.username1 === login)
				content = content + `<li class="p-2 bg-purple-600 text-white rounded-md">Match vs ${(game.multi) ? game.username2 : "AI"} - ${(game.winner_id === game.user_id1) ? "WIN" : "LOSS"}</li>`;
			else
				content = content + `<li class="p-2 bg-purple-600 text-white rounded-md">Match vs ${(game.multi) ? game.username1 : "AI"} - ${(game.winner_id === game.user_id2) ? "WIN" : "LOSS"}</li>`;
		}
		matchhistory.innerHTML = content || "<p>No matches yet</p>";
	} else {
		matchhistory.innerHTML = 'Log in to see your past games';
	}
}
