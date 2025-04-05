document.addEventListener("DOMContentLoaded", async () => {
	await searchbar();
});

async function searchbar() {
	const userview = document.getElementById('userview');
	const username = document.getElementById('searchUsername');
	const avatar = document.getElementById('searchAvatar') as HTMLImageElement;
	const onlinestatus = document.getElementById('searchOnlinestatus');
	// searchbar
	const search = document.getElementById('userSearchbar') as HTMLInputElement;
	const searchresults = document.getElementById("search-results-users") as HTMLDivElement | null;
	const status = document.getElementById('searchstatus');
	const allusers = await fetchAllPlayers();

	if (!search || !userview || !status || !username || !avatar || !onlinestatus || !searchresults) {
		return ;
	}

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
		displaySearchNames(filteredUsers, searchresults);
	});
}

function displaySearchNames(users: string[], container: HTMLDivElement): void {
	container.innerHTML = "";
	if (users.length === 0) {
		container.style.display = "none";
		return;
	}
	users.forEach((username) => {
		const div = document.createElement("div");
		div.textContent = username;
		div.className = "search-result-item";
		div.onclick = () => displayWrapper(container, username);
		container.appendChild(div);
	});
	container.style.display = "block";
}

function displayWrapper(div:HTMLDivElement, username:string) {
	displayUser(username);
	div.style.display = "none";
}

async function displayUser(user: string) {
	const userview = document.getElementById('userview');
	const username = document.getElementById('searchUsername');
	const avatar = document.getElementById('searchAvatar') as HTMLImageElement;
	const onlinestatus = document.getElementById('searchOnlinestatus');

	if (!userview || !username || !avatar || !onlinestatus)
		return ;

	const response = await fetch(`/api/user/${user}`, {method: 'GET'});
	if (response.status == 404) {
		console.error("User not found");
		return;
	} else if (!response.ok) {
		console.error("Error in route - GET /api/game");
		return;
	}
	const data = await response.json();
	if (data.success) {
		username.innerHTML = data.data.username;
		onlinestatus.innerHTML = data.data.status;
		avatar.src = `/uploads/${data.data.id}.png`;
		await searchgamestats(data.data.username);
		await searchmatches(data.data.username);
		userview.classList.remove("hidden");
	}
}

async function searchmatches(login: string) {
	const matchhistory = document.getElementById('searchMatchhistory');

	if (!matchhistory)
		return;
	const response = await fetch(`/api/game/user/${login}`, { method: 'GET' });
	if (response.status == 404) {
		console.error("User not found");
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
			if (game.username1 === login)
				str = `${login} vs ${(game.multi) ? game.username2 : "AI"} - ${(game.winner_id === game.user_id1) ? "WIN" : "LOSS"}`;
			else
				str = `${login} vs ${(game.multi) ? game.username1 : "AI"} - ${(game.winner_id === game.user_id2) ? "WIN" : "LOSS"}`;
			content = content + `<li class="p-2 bg-purple-600 text-white rounded-md flex flex-row"><p>${str}</p><p class="ml-auto">${dateformat(game.date)}</p></li>`;
		}
		matchhistory.innerHTML = content || "<p>No matches yet</p>";
	}
}

async function searchgamestats(login: string) {
	const games = document.getElementById('searchGames');
	const tourn = document.getElementById('searchtwins');
	const wins = document.getElementById('searchwins');
	const losses = document.getElementById('searchlosses');

	if (!games || !tourn || !wins || !losses)
		return;
	const response = await fetch(`/api/user/${login}/stats`, { method: 'GET' });
	if (response.status == 404) {
		console.error("User not found");
		return;
	} else if (!response.ok) {
		console.error("Error in route - GET /api/user/:id/stats");
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

function dateformat(date: string) {
	const day = date.substring(8, 10);
	const month = date.substring(5, 7)
	const year = date.substring(0, 4);
	return `${day}/${month}/${year}`;
}
// 0 1 2 3 4 5 6 7 8 9
// 2 0 2 5 - 0 1 - 0 4

async function fetchAllPlayers() {
	let allPlayersList = { data: [] };
	try {
		const response = await fetch("/api/user/all");
		if (!response.ok) throw new Error("Network response was not ok");
		allPlayersList = await response.json();
	} catch (error) {
		console.error("Error fetching users:", error);
	}
	return allPlayersList;
}