document.addEventListener("DOMContentLoaded", async () => {
	searchUser();
	const login = await myUser();
	if (!login || login.length < 1)
		return ;
	getFriends(login);
});

function searchUser() {
	const usersearchBtn = document.getElementById('usersearchBtn');
	const usersearch = document.getElementById('usersearch') as HTMLInputElement | null;
	const userdisplay = document.getElementById('usersearchdisplay');
	if (!usersearchBtn || !usersearch || !userdisplay)
		return ;
	usersearchBtn.addEventListener('click', async () => {
		const username = usersearch.value.trim();
		if (!username)
			throw Error("No username given");
		try {
			const response = await fetch(`/api/user/${username}`, {method: 'GET'});
			if (!response.ok) {
				console.error("Error in route - GET /api/user/:id");
			}
			const data = await response.json();
			if (data.success) {
				const status = data.data.status || "";
				userdisplay.innerHTML = `<img src="/uploads/${data.data.id}.png" class="w-10 h-10 rounded-full border-2 border-purple-200 shadow" onerror="this.onerror=null; this.src='/uploads/default.png';">
										<p>${data.data.username}</p>
										<p>${status}</p>`;
			} else {
				userdisplay.innerHTML = `<p>User not found</p>`;
			}
		} catch (error) {
			console.error(error);
		}
	});
}

async function myUser() {
	let login = "";
	const username = document.getElementById('myUsername');
	const avatar = document.getElementById('myAvatar') as HTMLImageElement;
	const status = document.getElementById('myOnlinestatus');

	if (!username || !avatar || !status )
		return null;
	try {
		const response = await fetch(`/api/user`, {method: 'GET'});
		if (!response.ok) {
			username.innerHTML = 'You are not logged in -> go to /google-login';
			return ;
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

async function getFriends(login: string) {
	const friendlist = document.getElementById('friendlist');
	if (!friendlist)
		return ;
	try {
		const response = await fetch(`/api/friend`, {method: 'GET'});
		if (response.status == 401) {
			friendlist.innerHTML = 'You are not logged in -> go to /google-login';
			return ;
		} else if (!response.ok) {
			console.error("Error in route - GET /api/friend");
			return ;
		}
		const data = await response.json();
		if (data.success) {
			let content = "<p>Friends</p>";
			for (const friend of data.data) {
				if (friend.username1 === login)
					content = content + `<div><img src='/uploads/${friend.user_id2}.png' class="w-10 h-10 rounded-full border-2 border-purple-200 shadow" onerror="this.onerror=null; this.src='/uploads/default.png';"><p>${friend.username2}</p><p>${friend.status2 || "offline"}</p></div>`;
				else
					content = content + `<div><img src='/uploads/${friend.user_id1}.png' class="w-10 h-10 rounded-full border-2 border-purple-200 shadow" onerror="this.onerror=null; this.src='/uploads/default.png';"><p>${friend.username1}</p><p>${friend.status1 || "offline"}</p></div>`;
			}
			friendlist.innerHTML = content;
			content = "";
		} else {
			friendlist.innerHTML = 'You are not logged in -> go to /google-login';
		}
	} catch (error) {
		console.error("Error friends:", error);
	}
}
