document.addEventListener("DOMContentLoaded", async () => {
	searchbar();
});

function searchbar() {
	const userview = document.getElementById('userview');
	const status = document.getElementById('searchstatus');
	const search = document.getElementById('userSearchbar') as HTMLInputElement;
	const btn = document.getElementById('userSearchBtn') as HTMLButtonElement;
	const username = document.getElementById('searchUsername');
	const avatar = document.getElementById('searchAvatar') as HTMLImageElement;
	const onlinestatus = document.getElementById('searchOnlinestatus');

	if (!search || !btn || !userview || !status || !username || !avatar || !onlinestatus)
		return ;
	btn.addEventListener('click', async function () {
		// check search
		if (search.value.length < 3) {
			status.innerText = "User not found";
			return ;
		}
		const response = await fetch(`/api/user/${search.value}`, {method: 'GET'});
		if (!response.ok) {
			status.innerText = 'Something went wrong';
			return ;
		}
		const data = await response.json();
		if (!data.success) {
			status.innerText = 'User not found';
			return ;
		}
		username.innerHTML = data.data.username;
		onlinestatus.innerHTML = data.data.status;
		avatar.src = `/uploads/${data.data.id}.png`;
		await searchgamestats(data.data.username);
		await searchmatches(data.data.username);
		userview.classList.remove("hidden");
	});
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
		for (const game of data.data) {
			if (game.username1 === login)
				content = content + `<li class="p-2 bg-purple-600 text-white rounded-md">Match vs ${(game.multi) ? game.username2 : "AI"} - ${(game.winner_id === game.user_id1) ? "WIN" : "LOSS"}</li>`;
			else
				content = content + `<li class="p-2 bg-purple-600 text-white rounded-md">Match vs ${(game.multi) ? game.username1 : "AI"} - ${(game.winner_id === game.user_id2) ? "WIN" : "LOSS"}</li>`;
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
