interface BracketMatch {
 player1: string | null;
 player2: string | null;
 winner?: string;
}

class EliminationTournament {
 rounds: BracketMatch[][];
 currentRound: number;
 currentMatch: number;

 constructor(players: string[]) {
  this.rounds = [];
  this.currentRound = 0;
  this.currentMatch = 0;
  this.generateBracket(players);
 }

 generateBracket(players: string[]): void {
  let shuffled = players.slice();
  shuffled.sort(() => Math.random() - 0.5);
  const n = shuffled.length;
  let bracketSize = 1;
  while (bracketSize < n) {
   bracketSize *= 2;
  }
  const byes = bracketSize - n;

  let slots: (string | null)[] = new Array(bracketSize).fill(null);
  for (let i = 0; i < n; i++) {
   slots[byes + i] = shuffled[i];
  }
  let round1: BracketMatch[] = [];
  for (let i = 0; i < bracketSize / 2; i++) {
   round1.push({
    player1: slots[i],
    player2: slots[bracketSize - 1 - i],
   });
  }
  this.rounds.push(round1);

  let matches = round1.length;
  while (matches > 1) {
   this.rounds.push(
    new Array(matches / 2)
     .fill(null)
     .map(() => ({ player1: null, player2: null }))
   );
   matches = matches / 2;
  }
 }

 getCurrentMatch(): BracketMatch | null {
  if (this.currentRound >= this.rounds.length) return null;
  if (this.currentMatch >= this.rounds[this.currentRound].length) return null;
  return this.rounds[this.currentRound][this.currentMatch];
 }

 recordMatchResult(winner: string): void {
  const match = this.getCurrentMatch();
  if (!match) return;
  match.winner = winner;
  if (this.currentRound < this.rounds.length - 1) {
   const nextIndex = Math.floor(this.currentMatch / 2);
   if (this.currentMatch % 2 === 0) {
    this.rounds[this.currentRound + 1][nextIndex].player1 = winner;
   } else {
    this.rounds[this.currentRound + 1][nextIndex].player2 = winner;
   }
  }
  this.currentMatch++;
  if (this.currentMatch >= this.rounds[this.currentRound].length) {
   this.currentRound++;
   this.currentMatch = 0;
  }
 }

 isComplete(): boolean {
  return this.currentRound >= this.rounds.length;
 }

 getOverallWinner(): string | null {
  if (this.isComplete() && this.rounds.length > 0) {
   return this.rounds[this.rounds.length - 1][0].winner || null;
  }
  return null;
 }
}

interface UsersResponse {
 data: string[];
}
let allUsersList: UsersResponse = { data: [] };
let selectedPlayers: string[] = [];
let globalTournament: EliminationTournament | null = null;
let globalTournamentID: number | null = null;
let matchWins: { [player: string]: number } = {};

async function fetchAllUsers(): Promise<void> {
 try {
  const response = await fetch("/api/user/all");
  if (!response.ok) throw new Error("Network error");
  allUsersList = await response.json();
 } catch (error) {
  console.error("Error fetching users:", error);
 }
}
fetchAllUsers();

function showToast(message: string, duration = 3000) {
 const container = document.getElementById("toast-container");
 if (!container) return;
 const toast = document.createElement("div");
 toast.className =
  "bg-gray-800 text-white px-4 py-2 rounded shadow-md animate-bounce";
 toast.textContent = message;
 container.appendChild(toast);
 setTimeout(() => {
  container.removeChild(toast);
 }, duration);
}

const userSearchInput = document.getElementById(
 "user-search"
) as HTMLInputElement;
userSearchInput.addEventListener("input", () => {
 const query = userSearchInput.value.toLowerCase();
 const results = document.getElementById("search-results") as HTMLDivElement;
 if (query.length < 2) {
  results.style.display = "none";
  results.innerHTML = "";
  return;
 }
 const filtered = allUsersList.data.filter((u) =>
  u.toLowerCase().includes(query)
 );
 results.innerHTML = "";
 if (filtered.length === 0) {
  results.style.display = "none";
  return;
 }
 filtered.forEach((u) => {
  const div = document.createElement("div");
  div.textContent = u;
  div.className = "p-2 cursor-pointer hover:bg-gray-300";
  div.onclick = () => selectUser(u);
  results.appendChild(div);
 });
 results.style.display = "block";
});

const searchResultsContainer = document.getElementById(
 "search-results"
) as HTMLDivElement;
function selectUser(username: string): void {
 if (selectedPlayers.includes(username)) return;
 if (selectedPlayers.length >= 6) {
  showToast("Maximum 6 players allowed.");
  return;
 }
 selectedPlayers.push(username);
 updateSelectedUsers();
 searchResultsContainer.innerHTML = "";
 searchResultsContainer.style.display = "none";
 userSearchInput.value = "";
}

function updateSelectedUsers(): void {
 const list = document.getElementById("selected-users") as HTMLUListElement;
 list.innerHTML = "";
 selectedPlayers.forEach((p) => {
  const li = document.createElement("li");
  li.textContent = p;
  li.className = "bg-purple-500 px-3 py-1 rounded";
  list.appendChild(li);
 });
}

async function registerTournament(): Promise<void> {
 if (selectedPlayers.length < 4) {
  showToast("Select at least 4 players.");
  return;
 }
 try {
  const response = await fetch("/api/tournament", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ players: selectedPlayers.length }),
  });
  if (!response.ok) throw new Error("Registration failed");
  const data = await response.json();
  globalTournamentID = data.data.id;
  showToast(`Tournament ID: ${data.data.id}`, 4000);

  (
   document.getElementById("tournament-registration-view") as HTMLElement
  ).style.display = "none";
  (
   document.getElementById("tournament-start-view") as HTMLElement
  ).style.display = "block";

  const regList = document.getElementById(
   "registered-users"
  ) as HTMLUListElement;
  regList.innerHTML = "";
  selectedPlayers.forEach((p) => {
   const li = document.createElement("li");
   li.textContent = p;
   li.className = "bg-purple-600 px-3 py-1 rounded";
   regList.appendChild(li);
  });

  globalTournament = new EliminationTournament(selectedPlayers);
  matchWins = {};
  selectedPlayers.forEach((p) => (matchWins[p] = 0));
  updateBracketUI();
  updateCurrentMatchInfo("");
  startPongMultiplayer(null);
 } catch (error) {
  console.error(error);
  showToast("Error registering tournament.");
 }
}

function updateBracketUI(): void {
 const container = document.getElementById("match-schedule");
 if (!container || !globalTournament) return;
 let html = "";
 globalTournament.rounds.forEach((round, r) => {
  html += `<div class="mb-2"><h3 class="font-bold">Round ${
   r + 1
  }</h3><ul class="space-y-1">`;
  round.forEach((m, i) => {
   let display = "";
   if (
    r === globalTournament!.currentRound &&
    i === globalTournament!.currentMatch
   ) {
    display = `<button class="px-2 py-1 bg-green-600 rounded hover:bg-green-700" onclick="startMatch()">Start Game</button>`;
   } else if (m.winner) {
    display = `<span class="text-gray-400">Winner: ${m.winner}</span>`;
   } else {
    display = `<span class="text-gray-500">Pending</span>`;
   }
   html += `<li class="flex justify-between items-center">
                <span>${m.player1 || "Pending"} vs ${m.player2 || "Pending"}</span>
                ${display}
              </li>`;
  });
  html += `</ul></div>`;
 });
 container.innerHTML = html;
}

function updateCurrentMatchInfo(text: string) {
 const info = document.getElementById("current-match-info");
 if (info) info.textContent = text;
}

let pongInterval: number | undefined;
let pongPaused = false;
let currentMatchData: BracketMatch | null = null;
function startPongMultiplayer(
  match: BracketMatch | null,
  onGameEnd?: (winner: string) => void
) {
  const canvas = document.getElementById("pongTournament") as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (!match) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  currentMatchData = match;
  const paddleWidth = 10;
  const paddleHeight = 80;
  const ballRadius = 8;
  const targetScore = 5;
  
  let player1 = {
    name: match.player1 || "Pending",
    score: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0,
    x: 0,
  };
  let player2 = {
    name: match.player2 || "Pending",
    score: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0,
    x: canvas.width - paddleWidth,
  };
  
  let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 4,
    dy: 4,
    radius: ballRadius,
    speed: 4,
  };

  if (pongInterval) clearInterval(pongInterval);

  function keyDownHandler(e: KeyboardEvent) {
    if (e.key === "w") player1.dy = -6;
    if (e.key === "s") player1.dy = 6;
    if (e.key === "ArrowUp") player2.dy = -6;
    if (e.key === "ArrowDown") player2.dy = 6;
  }
  function keyUpHandler(e: KeyboardEvent) {
    if (e.key === "w" || e.key === "s") player1.dy = 0;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") player2.dy = 0;
  }
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  async function tournamentSendMatchResult() {
   const body = {
    multi: true,
    user1: player1.name,
    user2: player2.name,
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

  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    const angle = (Math.random() * Math.PI/2) - (Math.PI/4);
    ball.dx = Math.random() < 0.5 ? ball.speed * Math.cos(angle) : -ball.speed * Math.cos(angle);
    ball.dy = ball.speed * Math.sin(angle);
  }

  pongInterval = setInterval(() => {
    if (pongPaused) return;
    player1.y += player1.dy;
    player2.y += player2.dy;
    player1.y = Math.max(0, Math.min(canvas.height - paddleHeight, player1.y));
    player2.y = Math.max(0, Math.min(canvas.height - paddleHeight, player2.y));
    ball.x += ball.dx;
    ball.y += ball.dy;
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
      ball.dy = -ball.dy;
    }
    if (
      ball.x - ball.radius < player1.x + paddleWidth &&
      ball.y > player1.y &&
      ball.y < player1.y + paddleHeight
    ) {
      let collidePoint = ball.y - (player1.y + paddleHeight / 2);
      collidePoint = collidePoint / (paddleHeight / 2);
      const angleRad = collidePoint * (Math.PI / 4);
      ball.dx = ball.speed * Math.cos(angleRad);
      ball.dy = ball.speed * Math.sin(angleRad);
    }
    if (
      ball.x + ball.radius > player2.x &&
      ball.y > player2.y &&
      ball.y < player2.y + paddleHeight
    ) {
      let collidePoint = ball.y - (player2.y + paddleHeight / 2);
      collidePoint = collidePoint / (paddleHeight / 2);
      const angleRad = collidePoint * (Math.PI / 4);
      ball.dx = -ball.speed * Math.cos(angleRad);
      ball.dy = ball.speed * Math.sin(angleRad);
    }
    if (ball.x - ball.radius < 0) {
      player2.score++;
      resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
      player1.score++;
      resetBall();
    }
    if (player1.score >= targetScore || player2.score >= targetScore) {
     clearInterval(pongInterval);
     const winner = player1.score >= targetScore ? player1.name : player2.name;
     tournamentSendMatchResult();
     onGameEnd && onGameEnd(winner);
    }
    render();
  }, 16);

  function render() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   ctx.fillRect(player1.x, player1.y, paddleWidth, paddleHeight);
   ctx.fillRect(player2.x, player2.y, paddleWidth, paddleHeight);
   ctx.beginPath();
   ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
   ctx.fill();
   ctx.font = "20px sans-serif";
   ctx.fillStyle = "white";
   ctx.textAlign = "center";
   const scoreText = `${player1.name} ${player1.score} : ${player2.score} ${player2.name}`;
   ctx.fillText(scoreText, canvas.width / 2, 30);
  }
}
function startMatch(): void {
 if (!globalTournament) {
  showToast("Tournament not initialized.");
  return;
 }
 const currentMatch = globalTournament.getCurrentMatch();
 if (!currentMatch) {
  showToast("Tournament complete!");
  finalizeTournament();
  return;
 }
 updateCurrentMatchInfo(
  `Current Match: ${currentMatch.player1} vs ${currentMatch.player2}`
 );
 startPongMultiplayer(currentMatch, (winner: string) => {
  showToast(`Match result: ${winner} wins!`);
  matchWins[winner] = (matchWins[winner] || 0) + 1;
  globalTournament!.recordMatchResult(winner);
  updateBracketUI();
  updateCurrentMatchInfo("Match complete. Awaiting next match...");
  if (globalTournament!.isComplete()) {
   finalizeTournament();
  }
 });
}

function togglePauseGame(): void {
 pongPaused = !pongPaused;
 showToast(pongPaused ? "Game Paused" : "Game Resumed", 2000);
}

function restartCurrentMatch(): void {
 if (!globalTournament) return;
 const currentMatch = globalTournament.getCurrentMatch();
 if (!currentMatch) return;
 startPongMultiplayer(currentMatch, (winner: string) => {
  showToast(`Match result: ${winner} wins!`);
  matchWins[winner] = (matchWins[winner] || 0) + 1;
  globalTournament!.recordMatchResult(winner);
  updateBracketUI();
  updateCurrentMatchInfo("Match complete. Awaiting next match...");
  if (globalTournament!.isComplete()) {
   finalizeTournament();
  }
 });
}

async function finalizeTournament() {
 if (!globalTournament) return;
 let overallWinner = "";
 let maxWins = 0;
 for (const player in matchWins) {
  if (matchWins[player] > maxWins) {
   maxWins = matchWins[player];
   overallWinner = player;
  }
 }
 updateCurrentMatchInfo(`Overall Winner: ${overallWinner}`);
 showToast(`Tournament complete! Winner: ${overallWinner}`, 5000);
 await endTournamentOnServer(overallWinner);
}

async function endTournamentOnServer(winnerName: string): Promise<void> {
 if (!globalTournamentID) return;
 try {
  const response = await fetch(`/api/tournament/${globalTournamentID}`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ winner_name: winnerName }),
  });
  if (!response.ok) throw new Error("Failed to post final winner");
  showToast(`Final winner "${winnerName}" recorded.`, 4000);
 } catch (error) {
  console.error(error);
  showToast("Error finalizing tournament.");
 }
}

const registerTournamentBtn = document.getElementById(
 "registerTournamentBtn"
) as HTMLButtonElement | null;
if (registerTournamentBtn) {
 registerTournamentBtn.addEventListener("click", registerTournament);
}

const pauseBtn = document.getElementById(
 "pause-btn-tournament"
) as HTMLButtonElement | null;
if (pauseBtn) {
 pauseBtn.addEventListener("click", togglePauseGame);
}

const restartBtn = document.getElementById(
 "restart-btn-tournament"
) as HTMLButtonElement | null;
if (restartBtn) {
 restartBtn.addEventListener("click", restartCurrentMatch);
}

const backBtn = document.getElementById(
 "back-btn-tournament"
) as HTMLButtonElement | null;
if (backBtn) {
 backBtn.addEventListener("click", () => {
  if (pongInterval) clearInterval(pongInterval);
  (
   document.getElementById("tournament-start-view") as HTMLElement
  ).style.display = "none";
  (
   document.getElementById("tournament-registration-view") as HTMLElement
  ).style.display = "block";
  showToast("Returned to registration view.");
 });
}

(window as any).startMatch = startMatch;
