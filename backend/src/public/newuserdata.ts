document.addEventListener("DOMContentLoaded", async () => {
 friendSearch();
 const login = await getmyUser();
 if (!login || login.length < 1) return;
 gamestats(login);
 matches(login);
 getFriendlist(login);
 requestList(login);
});

async function friendSearch() {
 const statustext = document.getElementById("statustext");
 const search = document.getElementById("newFriendBar") as HTMLInputElement | null;
 const searchresults = document.getElementById("friendsearch-results") as HTMLDivElement | null;
 const allusers = await fetchAllPlayers();

 if (!search || !searchresults || !statustext) return;
 search.addEventListener("input", () => {
  const query = search.value.toLowerCase();
  if (query.length < 2) {
   searchresults.style.display = "none";
   searchresults.innerHTML = "";
   return;
  }
 const filteredUsers = (allusers.data as string[]).filter((username) =>
   username.toLowerCase().includes(query)
  );
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
 let login = localStorage.getItem("username") || "";
 try {
  const response = await fetch("/api/friend", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ username }),
  });
  const data = await response.json();
  if (data.success) {
   statusblock.innerHTML = "friend request sent";
   const friendlist = document.getElementById("requestlistone");
   if (friendlist) {
    const friendData = {
     username1: login,
     username2: username,
     user_id1: data.data.user_id1,
     user_id2: data.data.user_id2,
     status1: "",
     status2: "",
     status: data.data.status,
    };
    const newFriendElement = addLiElementRequest(friendData, login);
    friendlist.appendChild(newFriendElement);
   }
  } else if (data.status === 401) {
   statusblock.innerHTML = "log in to make friends :)";
  } else if (data.status === 404) {
   statusblock.innerHTML = "user not found";
  } else {
   statusblock.innerHTML = `couldn't send request`;
  }
 } catch (error) {
  // Swallow error to avoid console noise.
 }
}

// -------------------------------------
// Fetch logged-in user info
// -------------------------------------
async function getmyUser() {
 let login = "";
 const username = document.getElementById("myUsername");
 const avatar = document.getElementById("myAvatar");
 const status = document.getElementById("myOnlinestatus");

 if (!username || !avatar || !status) return null;
 try {
  const response = await fetch(`/api/user`, { method: "GET" });
  if (!response.ok) {
   username.innerHTML = "You are not logged in -> go to /google-login";
   return;
  }
  const data = await response.json();
  if (data.success) {
   login = data.data.username;
   username.innerHTML = data.data.username;
   status.innerHTML = "online";
   avatar.src = `/uploads/${data.data.id}.png`;
  } else {
   username.innerHTML = "You are not logged in -> go to /google-login";
  }
 } catch (error) {
  // Swallow error.
 }
 return login;
}

// -------------------------------------
// Fetch and display accepted friends
// -------------------------------------
async function getFriendlist(login: any) {
 const friendlist = document.getElementById("friendlist");
 if (!friendlist) return;
 try {
  const response = await fetch(`/api/friend`, { method: "GET" });
  if (response.status == 401) {
   friendlist.innerHTML = "You are not logged in -> go to /google-login";
   return;
  } else if (!response.ok) {
   return;
  }
  const data = await response.json();
  if (data.success) {
   // Clear any existing friend list
   friendlist.innerHTML = "";
   for (const friend of data.data) {
    if (friend.status === "accepted") {
     const li = addLiElement(friend, login);
     friendlist.appendChild(li);
    }
   }
   // No bulk attachment of cancel-btn listeners here.
  } else {
   friendlist.innerHTML = "You are not logged in -> go to /google-login";
  }
 } catch (error) {
  // Swallow error.
 }
}

// -------------------------------------
// Render an accepted friend list item
// -------------------------------------
function addLiElement(friend: any, login: any) {
 const li = document.createElement("li");
 li.classList.add(
  "flex",
  "justify-between",
  "items-center",
  "p-2",
  "bg-purple-600",
  "rounded-md"
 );

 // Determine the other party (the friend)
 const friendUsername =
  friend.username1 === login ? friend.username2 : friend.username1;
 const friendUserId =
  friend.username1 === login ? friend.user_id2 : friend.user_id1;

 // Avatar
 const imgSpan = document.createElement("span");
 const img = document.createElement("img");
 img.src = `/uploads/${friendUserId}.png`;
 img.classList.add(
  "w-10",
  "h-10",
  "rounded-full",
  "border-2",
  "border-purple-200"
 );
 img.setAttribute(
  "onerror",
  "this.onerror=null; this.src='/uploads/default.png';"
 );
 imgSpan.appendChild(img);

 // Username display
 const usernameSpan = document.createElement("span");
 usernameSpan.classList.add("text-white", "p-2");
 usernameSpan.textContent = friendUsername;

 // Status display
 const statusSpan = document.createElement("span");
 statusSpan.classList.add("px-3", "ml-auto", "text-sm", "text-white");
 // Use the proper status field for the logged-in user
 statusSpan.textContent =
  friend.username1 === login ? friend.status1 : friend.status2 || "offline";

 // Cancel (red X) button to unfriend
 const cancelButton = document.createElement("button");
 cancelButton.classList.add(
  "px-3",
  "py-1",
  "bg-red-500",
  "text-white",
  "rounded-md",
  "cancel-btn"
 );
 // Set the data-username to the friend (other party)
 cancelButton.setAttribute("data-username", friendUsername);
 cancelButton.innerHTML = "&times;";
 // Attach the event listener immediately so only one listener is added
 cancelButton.addEventListener("click", async (event) => {
  await handleDelete(event, li);
 });

 li.appendChild(imgSpan);
 li.appendChild(usernameSpan);
 li.appendChild(statusSpan);
 li.appendChild(cancelButton);
 return li;
}

// -------------------------------------
// Fetch and display friend requests (pending)
// -------------------------------------
async function requestList(login: any) {
 const friendlist = document.getElementById("requestlist");
 if (!friendlist) return;
 try {
  const response = await fetch(`/api/friend`, { method: "GET" });
  if (response.status == 401) {
   friendlist.innerHTML = "You are not logged in -> go to /google-login";
   return;
  } else if (!response.ok) {
   return;
  }
  const data = await response.json();
  if (data.success) {
   const sent = document.getElementById("requestlistone");
   const pending = document.getElementById("requestlisttwo");
   if (!sent || !pending) return;
   // Clear any previous entries
   sent.innerHTML = "";
   pending.innerHTML = "";
   for (const friend of data.data) {
    if (friend.status === "pending") {
     const newelement = addLiElementRequest(friend, login);
     if (friend.username1 === login) {
      sent.appendChild(newelement);
     } else {
      pending.appendChild(newelement);
     }
    }
   }
  } else {
   friendlist.innerHTML = "You are not logged in";
  }
 } catch (error) {
  // Swallow error.
 }
}

// -------------------------------------
// Render a pending friend request item
// -------------------------------------
function addLiElementRequest(friend: any, login: any) {
 const li = document.createElement("li");
 li.className =
  "flex justify-between items-center p-2 bg-purple-600 rounded-md";

 const img = document.createElement("img");
 // For pending requests, display the other party’s avatar
 img.src = `/uploads/${
  friend.username1 === login ? friend.user_id2 : friend.user_id1
 }.png`;
 img.className = "w-10 h-10 rounded-full border-2 border-purple-200";
 img.onerror = () => (img.src = "/uploads/default.png");

 const nameSpan = document.createElement("span");
 nameSpan.className = "text-white p-2";
 nameSpan.textContent =
  friend.username1 === login ? friend.username2 : friend.username1;

 li.appendChild(img);
 li.appendChild(nameSpan);

 if (friend.status === "pending") {
  if (friend.username1 === login) {
   // Outgoing friend request (sent by logged-in user)
   const waitingSpan = document.createElement("span");
   waitingSpan.className = "px-3 text-sm text-white";
   waitingSpan.textContent = "waiting...";

   const deleteBtn = document.createElement("button");
   deleteBtn.className =
    "ml-auto px-3 py-1 bg-red-500 text-white rounded-md cancel-btn";
   deleteBtn.textContent = "Delete";
   // For sent requests, the friend to cancel is the one in username2
   deleteBtn.dataset.username = friend.username2;
   deleteBtn.addEventListener("click", async (event) => {
    await handleDelete(event, li);
   });

   li.appendChild(deleteBtn);
   li.appendChild(waitingSpan);
  } else {
   // Incoming friend request (received by logged-in user)
   const acceptBtn = document.createElement("button");
   acceptBtn.className =
    "ml-auto px-3 py-1 bg-green-500 text-white rounded-md accept-btn";
   acceptBtn.textContent = "Accept";
   acceptBtn.dataset.username = friend.username1;
   acceptBtn.addEventListener("click", async (event) => {
    await handleAccept(event, li);
   });

   const deleteBtn = document.createElement("button");
   deleteBtn.className =
    "ml-2 px-3 py-1 bg-red-500 text-white rounded-md cancel-btn";
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

// -------------------------------------
// Accept a friend request
// -------------------------------------
async function handleAccept(event: any, liElement: HTMLLIElement) {
 const target = event.currentTarget;
 const username = target.dataset.username;
 if (!username) return;
 try {
  const response = await fetch("/api/friend", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ username }),
  });
  if (response.ok) {
   liElement.remove();
  }
 } catch (error) {
  // Swallow error.
 }
}

// -------------------------------------
// Delete/unfriend or cancel friend request
// -------------------------------------
async function handleDelete(event: any, liElement: HTMLLIElement) {
 const target = event.currentTarget;
 const username = target.dataset.username;
 if (!username) return;
 try {
  const response = await fetch(`/api/friend/${username}/delete`, {
   method: "GET",
  });
  if (response.ok) {
   liElement.remove();
  }
 } catch (error) {
  // Swallow error.
 }
}

// -------------------------------------
// Fetch and display match history
// -------------------------------------
async function matches(login: any) {
 const matchhistory = document.getElementById("matchhistory");
 if (!matchhistory) return;
 const response = await fetch(`/api/game`, { method: "GET" });
 if (response.status == 401) {
  matchhistory.innerHTML = "Log in to see your past games";
  return;
 } else if (!response.ok) {
  return;
 }
 const data = await response.json();
 if (data.success) {
  // Clear old matches (if reloading)
  matchhistory.innerHTML = "";
  for (const game of data.data) {
   const li = addLiElementMatch(game, login);
   matchhistory.appendChild(li);
  }
 } else {
  matchhistory.innerHTML = "Log in to see your past games";
 }
}

// -------------------------------------
// Render a single match history item
// -------------------------------------
function addLiElementMatch(game: any, login: any) {
 const li = document.createElement("li");
 li.classList.add(
  "p-2",
  "bg-purple-600",
  "text-white",
  "rounded-md",
  "flex",
  "flex-row"
 );

 const para1 = document.createElement("p");
 if (game.username1 === login) {
  para1.innerText = `${login} vs ${game.multi ? game.username2 : "AI"} - ${
   game.winner_id === game.user_id1 ? "WIN" : "LOSS"
  }`;
 } else {
  para1.innerText = `${login} vs ${game.multi ? game.username1 : "AI"} - ${
   game.winner_id === game.user_id2 ? "WIN" : "LOSS"
  }`;
 }

 const para2 = document.createElement("p");
 para2.classList.add("ml-auto");
 para2.innerText = dateformat(game.date);

 li.appendChild(para1);
 li.appendChild(para2);
 return li;
}

// -------------------------------------
// Fetch and display user game statistics
// -------------------------------------
async function gamestats(login: any) {
 const games = document.getElementById("totalGames");
 const tourn = document.getElementById("tournamentwins");
 const wins = document.getElementById("wins");
 const losses = document.getElementById("losses");

 if (!games || !tourn || !wins || !losses) return;
 const response = await fetch(`/api/user/${login}/stats`, { method: "GET" });
 if (response.status == 404) {
  return;
 } else if (!response.ok) {
  return;
 }
 const data = await response.json();
 if (data.success) {
  games.innerText = `${data.data.total_games}`;
  tourn.innerText = `${data.data.tour_wins}`;
  wins.innerText = `${data.data.game_wins}`;
  losses.innerText = `${data.data.losses}`;
 } else {
  games.innerText = "0";
  tourn.innerText = "0";
  wins.innerText = "0";
  losses.innerText = "0";
 }
}
