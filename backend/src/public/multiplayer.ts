const player1Elem = document.getElementById("player1") as HTMLElement | null;
if (player1Elem) {
 player1Elem.innerHTML =
  localStorage.getItem("username") ||
  localStorage.getItem("multiplayerPlayer2") ||
  "Player1";
}

document.addEventListener("DOMContentLoaded", () => {
 const canvas = document.getElementById("pongMulti") as HTMLCanvasElement;
 if (!canvas) return;
 const ctx = canvas.getContext("2d")!;

 const paddleWidth = 10;
 const paddleHeight = 100;

 interface Paddle {
  x: number;
  y: number;
  dy: number;
  score: number;
 }

 interface Ball {
  x: number;
  y: number;
  radius: number;
  speed: number;
  dx: number;
  dy: number;
 }

 const player1: Paddle = { x: 10, y: canvas.height / 2 - 50, dy: 0, score: 0 };
 const player2: Paddle = {
  x: canvas.width - 20,
  y: canvas.height / 2 - 50,
  dy: 0,
  score: 0,
 };

 const ball: Ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  speed: 5,
  dx: 5,
  dy: 5,
 };

 let gameOver = false;
 let loop: number;
 let paused = false;
 let resultSentMulti = false;

 function initGameState(): void {
  player1.score = 0;
  player2.score = 0;
  player1.y = canvas.height / 2 - 50;
  player2.y = canvas.height / 2 - 50;
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 5;
  ball.dx = 5;
  ball.dy = 5;
  gameOver = false;
  resultSentMulti = false;
 }

 function startGame(): void {
  initGameState();
  clearInterval(loop);
  loop = window.setInterval(gameLoop, 1000 / 60);
 }

 function drawRect(x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
 }

 function drawCircle(x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
 }

 function drawText(text: string, x: number, y: number) {
  ctx.fillStyle = "#FFF";
  ctx.font = "32px Arial";
  ctx.fillText(text, x, y);
 }

 function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = -ball.dx;
  ball.speed = 5;
 }

 function checkCollision(p: Paddle): boolean {
  return (
   ball.x - ball.radius < p.x + paddleWidth &&
   ball.x + ball.radius > p.x &&
   ball.y + ball.radius > p.y &&
   ball.y - ball.radius < p.y + paddleHeight
  );
 }

 function update() {
  if (gameOver) return;

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y - ball.radius < 0) {
   ball.y = ball.radius;
   ball.dy = ball.dy >= 0 ? ball.dy : Math.abs(ball.dy) || 1;
  } else if (ball.y + ball.radius > canvas.height) {
   ball.y = canvas.height - ball.radius;
   ball.dy = ball.dy <= 0 ? ball.dy : -Math.abs(ball.dy) || -1;
  }

  if (checkCollision(player1)) {
   let collidePoint = ball.y - (player1.y + paddleHeight / 2);
   collidePoint = collidePoint / (paddleHeight / 2);
   const angle = collidePoint * (Math.PI / 4);
   ball.dx = ball.speed * Math.cos(angle);
   ball.dy = ball.speed * Math.sin(angle);
   ball.speed += 0.5;
  }

  if (checkCollision(player2)) {
   let collidePoint = ball.y - (player2.y + paddleHeight / 2);
   collidePoint = collidePoint / (paddleHeight / 2);
   const angle = collidePoint * (Math.PI / 4);
   ball.dx = -ball.speed * Math.cos(angle);
   ball.dy = ball.speed * Math.sin(angle);
   ball.speed += 0.5;
  }

  if (ball.x - ball.radius < 0) {
   player2.score++;
   resetBall();
  } else if (ball.x + ball.radius > canvas.width) {
   player1.score++;
   resetBall();
  }

  player1.y += player1.dy;
  player2.y += player2.dy;

  player1.y = Math.max(Math.min(player1.y, canvas.height - paddleHeight), 0);
  player2.y = Math.max(Math.min(player2.y, canvas.height - paddleHeight), 0);

  if (player1.score >= 5 || player2.score >= 5) {
   gameOver = true;
   clearInterval(loop);
  }
 }

 function render() {
  drawRect(0, 0, canvas.width, canvas.height, "#000");
  drawText(player1.score.toString(), canvas.width / 4, 50);
  drawText(player2.score.toString(), (3 * canvas.width) / 4, 50);
  // NEW: Draw player names in the canvas with a smaller font
  ctx.font = "16px Arial";
  const player1Name = localStorage.getItem("username") || "Player1";
  const player2Name = localStorage.getItem("multiplayerPlayer2") || "Player2";
  const textWidth1 = ctx.measureText(player1Name).width;
  const textWidth2 = ctx.measureText(player2Name).width;
  ctx.fillText(player1Name, canvas.width / 4 - textWidth1 / 2, 80);
  ctx.fillText(player2Name, (3 * canvas.width) / 4 - textWidth2 / 2, 80);
  ctx.font = "32px Arial"; // restore font size

  drawRect(player1.x, player1.y, paddleWidth, paddleHeight, "#FFF");
  drawRect(player2.x, player2.y, paddleWidth, paddleHeight, "#FFF");
  drawCircle(ball.x, ball.y, ball.radius, "#FFF");
 }

 function gamerender() {
  drawRect(0, 0, canvas.width, canvas.height, "#000");
  drawText(player1.score.toString(), canvas.width / 4, 50);
  drawText(player2.score.toString(), (3 * canvas.width) / 4, 50);
  drawRect(player1.x, player1.y, paddleWidth, paddleHeight, "#FFF");
  drawRect(player2.x, player2.y, paddleWidth, paddleHeight, "#FFF");
  drawCircle(ball.x, ball.y, ball.radius, "#FFF");

  if (gameOver) {
   const multiContainer = document.getElementById("multiplayerGameContainer");
   if (
    multiContainer &&
    multiContainer.style.display !== "none" &&
    !resultSentMulti
   ) {
    sendMultiplayerGameResult();
    resultSentMulti = true;
   }
   ctx.fillStyle = "#FFF";
   ctx.font = "bold 48px Arial";
   const winner = player1.score > player2.score ? localStorage.getItem("username") : localStorage.getItem("multiplayerPlayer2");
   const message = winner + " WON THE GAME";
   const msgWidth = ctx.measureText(message).width;
   ctx.fillText("Game Over", canvas.width / 2 - 120, canvas.height / 2 - 40);
   ctx.fillText(
    message,
    canvas.width / 2 - msgWidth / 2,
    canvas.height / 2 + 10
   );
   ctx.font = "24px Arial";
  }
 }

 function gameLoop() {
  update();
  render();
  gamerender();
 }

 document.addEventListener("keydown", (e) => {
  if (e.key === "w") player1.dy = -7;
  if (e.key === "s") player1.dy = 7;
  if (e.key === "ArrowUp") player2.dy = -7;
  if (e.key === "ArrowDown") player2.dy = 7;
 });

 document.addEventListener("keyup", (e) => {
  if (e.key === "w" || e.key === "s") player1.dy = 0;
  if (e.key === "ArrowUp" || e.key === "ArrowDown") player2.dy = 0;
 });

 const pauseBtnMulti = document.getElementById(
  "pause-btn-multi"
 ) as HTMLButtonElement | null;
 const restartBtnMulti = document.getElementById(
  "restart-btn-multi"
 ) as HTMLButtonElement | null;

 if (pauseBtnMulti) {
  pauseBtnMulti.addEventListener("click", () => {
   if (!paused) {
    clearInterval(loop);
    paused = true;
    pauseBtnMulti.textContent = "Resume";
   } else {
    loop = window.setInterval(gameLoop, 1000 / 60);
    paused = false;
    pauseBtnMulti.textContent = "Pause";
   }
  });
 }

 if (restartBtnMulti) {
  restartBtnMulti.addEventListener("click", () => {
   startGame();
   if (paused) {
    paused = false;
    if (pauseBtnMulti) pauseBtnMulti.textContent = "Pause";
   }
  });
 }

 document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
   clearInterval(loop);
  } else {
   if (!gameOver && !paused) {
    clearInterval(loop);
    loop = window.setInterval(gameLoop, 1000 / 60);
   }
  }
 });

 async function sendMultiplayerGameResult() {
  const body = {
   multi: true,
   user1: localStorage.getItem("username"),
   user2: localStorage.getItem("multiplayerPlayer2"),
   winner: player1.score > player2.score ? 1 : 2,
  };
  try {
   const response = await fetch("/api/game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
   });
   if (!response.ok) {
    console.error("Error sending game result", response.statusText);
   } else {
    console.log("Game result sent successfully");
   }
  } catch (error) {
   console.error("Error sending game result", error);
  }
 }

 const backBtnMulti = document.getElementById(
  "back-btn-multi"
 ) as HTMLButtonElement | null;
 if (backBtnMulti) {
  backBtnMulti.addEventListener("click", () => {
   clearInterval(loop);
   paused = false;
   initGameState();
   const gameContainer = document.getElementById("multiplayerGameContainer");
   const formContainer = document.getElementById("multiplayerFormContainer");
   if (gameContainer) gameContainer.style.display = "none";
   if (formContainer) formContainer.style.display = "block";
  });
 }

 const startGameBtn = document.getElementById(
  "start-game-btn"
 ) as HTMLButtonElement | null;
 if (startGameBtn) {
  startGameBtn.style.display = "none";
  startGameBtn.addEventListener("click", () => {
   startGame();
   startGameBtn.style.display = "none";
  });
 }

 interface PlayerResponse {
  data: string[];
 }

 let allPlayersList: PlayerResponse = { data: [] };
 let selectedPlrs: string[] = [];

 async function fetchAllPlayers(): Promise<void> {
  try {
   const response = await fetch("/api/user/all");
   if (!response.ok) throw new Error("Network response was not ok");
   allPlayersList = await response.json();
  } catch (error) {
   console.error("Error fetching users:", error);
  }
 }
 fetchAllPlayers();

 const playerSearchInput = document.getElementById(
  "player2"
 ) as HTMLInputElement;

 playerSearchInput.addEventListener("input", () => {
  const query = playerSearchInput.value.toLowerCase();
  if (query.length < 2) {
   searchResultsContainerMulti!.style.display = "none";
   searchResultsContainerMulti!.innerHTML = "";
   return;
  }
  const filteredUsers: string[] = allPlayersList.data.filter((username) =>
   username.toLowerCase().includes(query)
  );
  displaySearchResultsMulti(filteredUsers);
 });

 const player2Div = document.getElementById("player2") as HTMLElement;
 let searchResultsContainerMulti = document.getElementById(
  "search-results-multiplayer"
 ) as HTMLDivElement | null;
 if (!searchResultsContainerMulti) {
  searchResultsContainerMulti = document.createElement("div");
  searchResultsContainerMulti.id = "search-results-multiplayer";
  player2Div.appendChild(searchResultsContainerMulti);
 }

 function displaySearchResultsMulti(users: string[]): void {
  searchResultsContainerMulti!.innerHTML = "";
  if (users.length === 0) {
   searchResultsContainerMulti!.style.display = "none";
   return;
  }
  users.forEach((username) => {
   const div = document.createElement("div");
   div.textContent = username;
   div.className = "search-result-item";
   div.onclick = () => selectPlayer2(username);
   searchResultsContainerMulti!.appendChild(div);
  });
  searchResultsContainerMulti!.style.display = "block";
 }

 function selectPlayer2(username: string): void {
  if (selectedPlrs.includes(username)) return;
  selectedPlrs.push(username);
  updateSelectedUser();

  playerSearchInput.style.display = "none";
  searchResultsContainerMulti!.innerHTML = "";
  searchResultsContainerMulti!.style.display = "none";

  let displayElem = document.getElementById(
   "player2-display"
  ) as HTMLElement | null;
  if (!displayElem) {
   displayElem = document.createElement("p");
   displayElem.id = "player2-display";
   displayElem.className = "text-xl font-semibold text-center mb-4";
   player2Div.parentElement?.appendChild(displayElem);
  }
  displayElem.textContent = username;
 }

 function updateSelectedUser(): void {
  const list = document.getElementById("selected-users") as HTMLUListElement;
  list.innerHTML = "";
  selectedPlrs.forEach((player) => {
   const li = document.createElement("li");
   li.classList.add(
    "px-4",
    "py-2",
    "mx-1",
    "my-1",
    "rounded-lg",
    "font-semibold"
   );
   li.textContent = player;
   list.appendChild(li);
  });
 }

 const startMultiBtn = document.getElementById(
  "startMultiplayerGame"
 ) as HTMLButtonElement | null;
 if (startMultiBtn) {
  startMultiBtn.addEventListener("click", async () => {
   const player2El = document.getElementById(
    "player2-display"
   ) as HTMLElement | null;
   const player1Name = localStorage.getItem("username");
   const player2Name = player2El?.textContent?.trim();

   if (player1Name && player2Name) {
    localStorage.setItem("multiplayerPlayer2", player2Name);

    const formContainer = document.getElementById(
     "multiplayerFormContainer"
    ) as HTMLElement | null;
    const gameContainer = document.getElementById(
     "multiplayerGameContainer"
    ) as HTMLElement | null;
    if (formContainer) formContainer.style.display = "none";
    if (gameContainer) gameContainer.style.display = "block";
    if (startGameBtn) {
     startGameBtn.style.display = "block";
    } else {
     startGame();
    }
   } else {
    alert("Please enter names for both players.");
   }
  });
 }

 function registerMulti(): void {
  const player1El = document.getElementById(
   "player1"
  ) as HTMLInputElement | null;
  const player2El = document.getElementById(
   "player2"
  ) as HTMLInputElement | null;
  const p1 = player1El?.value.trim();
  const p2 = player2El?.value.trim();

  if (!p1 || !p2) {
   alert("Please enter both names.");
   return;
  }
 }
});
