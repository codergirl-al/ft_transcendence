
document.addEventListener("DOMContentLoaded", async () => {
	friendSearch();
	const login = await getmyUser();
	if (!login || login.length < 1)
		return;
	gamestats(login);
	matches(login);
	getFriendlist(login);
	requestList(login);
});

async function friendSearch() {
	const statustext = document.getElementById('statustext');
	const search = document.getElementById('newFriendBar') as HTMLInputElement | null;
	const searchresults = document.getElementById("friendsearch-results") as HTMLDivElement | null;
	const allusers = await fetchAllPlayers();

	if (!search || !searchresults || !statustext)
		return ;
	search.addEventListener("input", () => {
		const query = search.value.toLowerCase();
		if (query.length < 2) {
			searchresults.style.display = "none";
			searchresults.innerHTML = "";
			return;
		}
		const filteredUsers: string[] = allusers.data.filter((username: string) =>
			username.toLowerCase().includes(query)
		);
		// same as displaySearchNames(filteredUsers, searchresults) ->
		searchresults.innerHTML = "";
		if (filteredUsers.length === 0) {
			searchresults.style.display = "none";
			return;
		}
		filteredUsers.forEach((username) => {
			const div = document.createElement("div");
			div.textContent = username;
			div.className = "search-result-item";
			div.onclick = () => newFriend(username, statustext);
			searchresults.appendChild(div);
		});
		searchresults.style.display = "block";
	});
}

async function newFriend(username: string, statusblock: HTMLElement) {

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
			statusblock.innerHTML = 'friend request sent';
			const friendlist = document.getElementById('friendlist');
			if (friendlist) {
				const newFriendElement = addLiElement(data.data, 1);
				friendlist.appendChild(newFriendElement);
			}
		} else if (data.status === 401) {
			statusblock.innerHTML = 'log in to make friends :)';
		} else if (data.status === 404) {
			statusblock.innerHTML = 'user not found';
		} else {
			statusblock.innerHTML = `couldn't send request`;
		}
	} catch (error) {
		console.error(error);
	}
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
			for (const friend of data.data) {
				let friendindex = (friend.username1 === login) ? 2 : 1;
				if (friend.status === 'accepted') {
					const li = addLiElement(friend, friendindex);
					friendlist.appendChild(li);
				}
			}
			const cancelButtons = document.querySelectorAll('.cancel-btn');
			cancelButtons.forEach(button => {
				button.addEventListener('click', async (event) => {
					const username = (event.target as HTMLElement).getAttribute('data-username');
					if (!username) return;
					try {
						const response = await fetch(`/api/friend/${username}/delete`, { method: 'GET' });
						if (response.ok) {
							const liElement = (event.target as HTMLElement).closest('li');
							if (liElement)
								liElement.remove();
						} else {
							console.error("Error in route - GET /api/friend/:id/delete");
						}
					} catch (error) {
						console.error("Error canceling friend request:", error);
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


interface FriendData {
	user_id1: Number;
	user_id2: Number;
	username1: string;
	username2: string;
	status1: string;
	status2: string;
	status: string;
}

function addLiElement(friend: FriendData, friendindex: Number) {
	const li = document.createElement('li');
	li.classList.add('flex', 'justify-between', 'items-center', 'p-2', 'bg-purple-600', 'rounded-md');

	const imgSpan = document.createElement('span');
	const img = document.createElement('img');
	img.src = `/uploads/${(friendindex === 1) ? friend.user_id1 : friend.user_id2}.png`;
	img.classList.add('w-10', 'h-10', 'rounded-full', 'border-2', 'border-purple-200');
	img.setAttribute('onerror', "this.onerror=null; this.src='/uploads/default.png';");
	imgSpan.appendChild(img);

	const usernameSpan = document.createElement('span');
	usernameSpan.classList.add('text-white', 'p-2');
	usernameSpan.textContent = (friendindex === 1) ? friend.username1 : friend.username2;

	const statusSpan = document.createElement('span');
	statusSpan.classList.add('px-3', 'ml-auto', 'text-sm', 'text-white');
	statusSpan.textContent = ((friendindex === 1) ? friend.status1 : friend.status2) || "offline";

	const cancelButton = document.createElement('button');
	cancelButton.classList.add('px-3', 'py-1', 'bg-red-500', 'text-white', 'rounded-md', 'cancel-btn');
	cancelButton.setAttribute('data-username', friend.username2);
	cancelButton.innerHTML = '&times';

	li.appendChild(imgSpan);
	li.appendChild(usernameSpan);
	li.appendChild(statusSpan);
	li.appendChild(cancelButton);
	return li;
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
			const pending = document.createElement("ul");
			const sent = document.createElement("ul");
			for (const friend of data.data) {
				if (friend.status === 'pending') {
					const newelement = addLiElementRequest(friend, login);
					if (friend.username1 === login) {
						sent.appendChild(newelement);
					} else {
						pending.appendChild(newelement);
					}
				}
			}
			if (pending.children.length > 0) {
				friendlist.appendChild(pending);
			}
			if (sent.children.length > 0) {
				friendlist.appendChild(sent);
			}
		} else {
			friendlist.innerHTML = 'You are not logged in';
		}
	} catch (error) {
		console.error("Error friends:", error);
	}
}

function addLiElementRequest(friend: FriendData, login: string) {
	const li = document.createElement("li");
	li.className = "flex justify-between items-center p-2 bg-purple-600 rounded-md";

	const img = document.createElement("img");
	img.src = `/uploads/${friend.username1 === login ? friend.user_id2 : friend.user_id1}.png`;
	img.className = "w-10 h-10 rounded-full border-2 border-purple-200";
	img.onerror = () => (img.src = "/uploads/default.png");

	const nameSpan = document.createElement("span");
	nameSpan.className = "text-white p-2";
	nameSpan.textContent = friend.username1 === login ? friend.username2 : friend.username1;

	li.appendChild(img);
	li.appendChild(nameSpan);

	if (friend.status === "pending") {
		if (friend.username1 === login) {//sent
			const waitingSpan = document.createElement("span");
			waitingSpan.className = "px-3 text-sm text-white";
			waitingSpan.textContent = "waiting...";

			const deleteBtn = document.createElement("button");
			deleteBtn.className = "ml-auto px-3 py-1 bg-red-500 text-white rounded-md cancel-btn";
			deleteBtn.textContent = "Delete";
			deleteBtn.dataset.username = friend.username2;
			deleteBtn.addEventListener("click", async (event) => {
				await handleDelete(event, li);
			});

			li.appendChild(deleteBtn);
			li.appendChild(waitingSpan);
		} else {//incoming
			const acceptBtn = document.createElement("button");
			acceptBtn.className = "ml-auto px-3 py-1 bg-green-500 text-white rounded-md accept-btn";
			acceptBtn.textContent = "Accept";
			acceptBtn.dataset.username = friend.username1;
			acceptBtn.addEventListener("click", async (event) => {
				await handleAccept(event, li);
			});

			const deleteBtn = document.createElement("button");
			deleteBtn.className = "ml-2 px-3 py-1 bg-red-500 text-white rounded-md cancel-btn";
			deleteBtn.textContent = "×";
			deleteBtn.dataset.username = friend.username1;
			deleteBtn.addEventListener("click", async (event) => {
				await handleDelete(event, li);
			});

			li.appendChild(acceptBtn);
			li.appendChild(deleteBtn);
		}
	}
	return li;
}

async function handleAccept(event: MouseEvent, liElement: HTMLLIElement) {
	const target = event.target as HTMLElement;
	const username = target.dataset.username;
	if (!username) return;
	try {
		const response = await fetch("/api/friend", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username })
		});
		if (response.ok) {
			liElement.remove();
		} else {
			console.error("Error in route - POST /api/friend");
		}
	} catch (error) {
		console.error("Error accepting friend request:", error);
	}
}

async function handleDelete(event: MouseEvent, liElement: HTMLLIElement) {
	const target = event.target as HTMLElement;
	const username = target.dataset.username;
	if (!username) return;
	try {
		const response = await fetch(`/api/friend/${username}/delete`, { method: "GET" });
		if (response.ok) {
			liElement.remove();
		} else {
			console.error("Error in route - GET /api/friend/:id/delete");
		}
	} catch (error) {
		console.error("Error canceling friend request:", error);
	}
}


async function matches(login: string) {
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
		let str = "";
		for (const game of data.data) {
			const li = addLiElementMatch(game, login);
			matchhistory.appendChild(li);
		}
		matchhistory.innerHTML = content || "<p>No matches yet</p>";
	} else {
		matchhistory.innerHTML = 'Log in to see your past games';
	}
}

interface GameData {
	multi: Number;
	user_id1: Number;
	user_id2: Number;
	winner_id: Number;
	username1: string;
	username2: string;
	date: string;
}

function addLiElementMatch(game: GameData, login: string) {
	const li = document.createElement('li');
	li.classList.add('p-2', 'bg-purple-600', 'text-white', 'rounded-md', 'flex', 'flex-row');
	
	const para1 = document.createElement('p');
	if (game.username1 === login)
		para1.innerText = `${login} vs ${(game.multi) ? game.username2 : "AI"} - ${(game.winner_id === game.user_id1) ? "WIN" : "LOSS"}`;
	else
		para1.innerText = `${login} vs ${(game.multi) ? game.username1 : "AI"} - ${(game.winner_id === game.user_id2) ? "WIN" : "LOSS"}`;

	const para2 = document.createElement('p');
	para2.classList.add('ml-auto');
	para2.innerText = `${dateformat(game.date)}`;

	li.appendChild(para1);
	li.appendChild(para2);
	return li;
}

async function gamestats(login: string) {
	const games = document.getElementById('totalGames');
	const tourn = document.getElementById('tournamentwins');
	const wins = document.getElementById('wins');
	const losses = document.getElementById('losses');

	if (!games || !tourn || !wins || !losses)
		return;
	const response = await fetch(`/api/user/${login}/stats`, { method: 'GET' });
	if (response.status == 404) {
		console.error("User not found");
		return;
	} else if (!response.ok) {
		console.error("Error in route - GET /api/game");
		return;
	}
	const data = await response.json();
	if (data.success) {
		games.innerText = `${data.data.total_games}`;
		tourn.innerText = `${data.data.tour_wins}`;
		wins.innerText = `${data.data.game_wins}`;
		losses.innerText = `${data.data.losses}`;
	} else {
		games.innerText = '0';
		tourn.innerText = '0';
		wins.innerText = '0';
		losses.innerText = '0';
	}
}
