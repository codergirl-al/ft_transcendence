// interface Match {
//  player1: string;
//  player2: string;
// }

// class Tournament {
//  private players: string[];
//  private matches: Match[];
//  private currentMatchIndex: number;
//  public readonly paddleSpeed: number;

//  constructor(players: string[]) {
//   this.players = players;
//   this.matches = [];
//   this.currentMatchIndex = 0;
//   this.paddleSpeed = 5;
//   this.generateMatches();
//  }

//  private generateMatches(): void {
//   this.matches = [];
//   for (let i = 0; i < this.players.length; i++) {
//    for (let j = i + 1; j < this.players.length; j++) {
//     this.matches.push({ player1: this.players[i], player2: this.players[j] });
//    }
//   }
//  }

//  public getNextMatch(): Match | null {
//   if (this.currentMatchIndex < this.matches.length) {
//    return this.matches[this.currentMatchIndex++];
//   }
//   return null;
//  }

//  public resetTournament(): void {
//   this.currentMatchIndex = 0;
//   this.generateMatches();
//  }

//  public getMatchSchedule(): Match[] {
//   return this.matches;
//  }
// }

// async function startTournament(tournament: Tournament): Promise<void> {
//  alert("Tournament is starting!");
//  let match: Match | null;
//  while ((match = tournament.getNextMatch()) !== null) {
//   console.log(`Starting match: ${match.player1} vs ${match.player2}`);
//   // Here you can initiate the multiplayer game view or match logic.
//   // For demonstration, we simply wait 2 seconds before moving to the next match.
//   await new Promise((resolve) => setTimeout(resolve, 2000));
//  }

//  console.log("Tournament complete!");
// }

// interface UsersResponse {
//  data: string[];
// }

// let allUsersList: UsersResponse = { data: [] };
// let selectedPlayers: string[] = [];

// async function fetchAllUsers(): Promise<void> {
//  try {
//   const response = await fetch("/api/user/all");
//   if (!response.ok) throw new Error("Network response was not ok");
//   allUsersList = await response.json();
//  } catch (error) {
//   console.error("Error fetching users:", error);
//  }
// }
// fetchAllUsers();

// const userSearchInput = document.getElementById(
//  "user-search"
// ) as HTMLInputElement;

// userSearchInput.addEventListener("input", () => {
//  const query = userSearchInput.value.toLowerCase();
//  if (query.length < 2) {
//   searchResultsContainer!.style.display = "none";
//   searchResultsContainer!.innerHTML = "";
//   return;
//  }
//  const filteredUsers: string[] = allUsersList.data.filter((username) =>
//   username.toLowerCase().includes(query)
//  );
//  console.log("these are the filtered users", filteredUsers);
//  displaySearchResults(filteredUsers);
// });

// // Get the search container; using the same ID "user-search" for container if intended.
// const userSearchDiv = document.getElementById("user-search") as HTMLElement;

// // Get or create the search results container.
// let searchResultsContainer = document.getElementById(
//  "search-results"
// ) as HTMLDivElement | null;
// if (!searchResultsContainer) {
//  searchResultsContainer = document.createElement("div");
//  searchResultsContainer.id = "search-results";
//  userSearchDiv.appendChild(searchResultsContainer);
// }

// // Display the search results.
// function displaySearchResults(users: string[]): void {
//  searchResultsContainer!.innerHTML = "";
//  if (users.length === 0) {
//   searchResultsContainer!.style.display = "none";
//   return;
//  }
//  users.forEach((username) => {
//   const div = document.createElement("div");
//   div.textContent = username;
//   div.className = "search-result-item";
//   div.onclick = () => selectUser(username);
//   searchResultsContainer!.appendChild(div);
//  });
//  searchResultsContainer!.style.display = "block";
// }

// // Add a user to the selected list.
// function selectUser(username: string): void {
//  if (selectedPlayers.includes(username)) return;
//  if (selectedPlayers.length >= 6) {
//   alert("You can only invite up to 6 players.");
//   return;
//  }
//  selectedPlayers.push(username);
//  updateSelectedUsers();
//  searchResultsContainer!.innerHTML = "";
//  searchResultsContainer!.style.display = "none";
//  userSearchInput.value = "";
// }

// // Update the selected users UI list.
// function updateSelectedUsers(): void {
//  const list = document.getElementById("selected-users") as HTMLUListElement;
//  list.innerHTML = "";
//  selectedPlayers.forEach((player) => {
//   const li = document.createElement("li");
//   li.classList.add(
//    "bg-purple-500",
//    "bg-opacity-30",
//    "text-red",
//    "px-4",
//    "py-2",
//    "mx-1",
//    "my-1",
//    "rounded-lg",
//    "font-semibold"
//   );
//   li.textContent = player;
//   list.appendChild(li);
//  });
// }

// // Registers the tournament by sending the selected players to the backend.
// async function registerTournament(): Promise<void> {
//  if (selectedPlayers.length < 4) {
//   alert("Please select at least 4 players to start a tournament.");
//   return;
//  }
//  try {
//   const response = await fetch("/api/tournament", {
//    method: "POST",
//    headers: {
//     "Content-Type": "application/json",
//    },
//    body: JSON.stringify({ players: selectedPlayers.length }),
//   });
//   console.log("meme: response", response);
//   if (!response.ok) throw new Error("Failed to register tournament");
//   const data = await response.json();
//   (
//    document.getElementById("tournament-registration-view") as HTMLElement
//   ).style.display = "none";
//   (
//    document.getElementById("tournament-start-view") as HTMLElement
//   ).style.display = "flex";
//   const regList = document.getElementById(
//    "registered-users"
//   ) as HTMLUListElement;
//   regList.innerHTML = "";
//   selectedPlayers.forEach((player) => {
//    const li = document.createElement("li");
//    li.classList.add(
//     "text-white",
//     "px-3",
//     "py-2",
//     "mx-1",
//     "my-1",
//     "font-semibold"
//    );
//    li.textContent = player;
//    regList.appendChild(li);
//   });
//   console.log("Tournament registered with ID:", data.id);
//  } catch (error) {
//   console.error("Error registering tournament:", error);
//   alert("Error registering tournament");
//  }
// }

// // Starts the tournament and processes the matches.
// async function startTournamentFront(): Promise<void> {
//  alert("Tournament is starting!");
//  // Initialize a new Tournament instance with the selected players.
//  const tournament = new Tournament(selectedPlayers);

//  // Optionally, update the UI with the match schedule.
//  const schedule = tournament.getMatchSchedule();
//  const matchScheduleDiv = document.getElementById(
//   "match-schedule"
//  ) as HTMLElement | null;
//  if (matchScheduleDiv) {
//   matchScheduleDiv.innerHTML = `<p>Match Schedule:</p><ul>${schedule
//    .map((match) => `<li>${match.player1} vs ${match.player2}</li>`)
//    .join("")}</ul>`;
//  }

//  // Process the matches using the imported tournament logic.
//  await startTournament(tournament);

//  // After all matches are done, update the UI accordingly.
//  alert("Tournament complete!");
// }

// // Add an event listener to the Start Tournament button.
// const startTournamentBtn = document.getElementById(
//  "start-tournament-btn"
// ) as HTMLButtonElement | null;
// if (startTournamentBtn) {
//  console.log("werestarting1");
//  startTournamentBtn.addEventListener("click", startTournamentFront);
// }





// tournaments.ts

// ====================== Tournament Scheduling ======================
interface Match {
  player1: string;
  player2: string;
}

class Tournament {
  private players: string[];
  private matches: Match[];
  private currentMatchIndex: number;
  public readonly paddleSpeed: number;

  constructor(players: string[]) {
    this.players = players;
    this.matches = [];
    this.currentMatchIndex = 0;
    this.paddleSpeed = 5;
    this.generateMatches();
  }

  private generateMatches(): void {
    this.matches = [];
    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        this.matches.push({ player1: this.players[i], player2: this.players[j] });
      }
    }
  }

  public getNextMatch(): Match | null {
    if (this.currentMatchIndex < this.matches.length) {
      return this.matches[this.currentMatchIndex++];
    }
    return null;
  }

  public resetTournament(): void {
    this.currentMatchIndex = 0;
    this.generateMatches();
  }

  public getMatchSchedule(): Match[] {
    return this.matches;
  }
}

// ====================== Pong Game for a Single Tournament Match ======================
/**
 * Runs a single Pong match between match.player1 and match.player2 on a dedicated canvas.
 * Returns a Promise that resolves with the winner's name.
 */
async function runPongMatch(match: Match): Promise<string> {
  // Get the tournament canvas.
  const canvas = document.getElementById("pongTournament") as HTMLCanvasElement;
  if (!canvas) throw new Error("Tournament canvas not found");
  const ctx = canvas.getContext("2d")!;

  // Game settings.
  const paddleWidth = 10;
  const paddleHeight = 100;
  const targetScore = 5;

  // Create player objects.
  const player1 = {
    name: match.player1,
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0,
    score: 0,
  };
  const player2 = {
    name: match.player2,
    x: canvas.width - 20,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0,
    score: 0,
  };

  // Create the ball.
  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 5,
    dx: 5,
    dy: 5,
  };

  let gameOver = false;
  let loop: number;
  let matchPaused = false;

  function draw() {
    // Clear the canvas.
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw paddles.
    ctx.fillStyle = "#FFF";
    ctx.fillRect(player1.x, player1.y, paddleWidth, paddleHeight);
    ctx.fillRect(player2.x, player2.y, paddleWidth, paddleHeight);
    // Draw ball.
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    // Draw scores.
    ctx.font = "32px Arial";
    ctx.fillText(player1.score.toString(), canvas.width / 4, 50);
    ctx.fillText(player2.score.toString(), (3 * canvas.width) / 4, 50);
    // Draw player names above paddles.
    ctx.font = "20px Arial";
    ctx.fillText(player1.name, player1.x, player1.y - 10);
    ctx.fillText(player2.name, player2.x, player2.y - 10);
  }

  function update() {
    if (gameOver) return;

    // Update ball position.
    ball.x += ball.dx;
    ball.y += ball.dy;
    // Bounce off top and bottom.
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.dy = Math.abs(ball.dy) || 1;
    } else if (ball.y + ball.radius > canvas.height) {
      ball.y = canvas.height - ball.radius;
      ball.dy = -Math.abs(ball.dy) || -1;
    }

    // Collision detection helper.
    function checkCollision(p: { x: number; y: number }) {
      return (
        ball.x - ball.radius < p.x + paddleWidth &&
        ball.x + ball.radius > p.x &&
        ball.y + ball.radius > p.y &&
        ball.y - ball.radius < p.y + paddleHeight
      );
    }

    // Handle collisions with paddles.
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

    // Score updates.
    if (ball.x - ball.radius < 0) {
      player2.score++;
      resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
      player1.score++;
      resetBall();
    }

    // Update paddle positions.
    player1.y += player1.dy;
    player2.y += player2.dy;
    player1.y = Math.max(Math.min(player1.y, canvas.height - paddleHeight), 0);
    player2.y = Math.max(Math.min(player2.y, canvas.height - paddleHeight), 0);

    // Check for win.
    if (player1.score >= targetScore || player2.score >= targetScore) {
      gameOver = true;
      clearInterval(loop);
    }
  }

  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.dx = (ball.dx > 0 ? 5 : -5);
    ball.dy = (ball.dy > 0 ? 5 : -5);
  }

  // Keyboard controls.
  function keyDownHandler(e: KeyboardEvent) {
    if (e.key === "w") player1.dy = -7;
    if (e.key === "s") player1.dy = 7;
    if (e.key === "ArrowUp") player2.dy = -7;
    if (e.key === "ArrowDown") player2.dy = 7;
  }
  function keyUpHandler(e: KeyboardEvent) {
    if (e.key === "w" || e.key === "s") player1.dy = 0;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") player2.dy = 0;
  }
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  // Run the match loop.
  return new Promise<string>((resolve) => {
    loop = window.setInterval(() => {
      if (!matchPaused) {
        update();
        draw();
      }
      if (gameOver) {
        // After a short delay, display a match-over message and resolve the promise.
        setTimeout(() => {
          ctx.fillStyle = "#FFF";
          ctx.font = "bold 48px Arial";
          const winner = player1.score >= targetScore ? player1.name : player2.name;
          ctx.fillText("Match Over", canvas.width / 2 - 120, canvas.height / 2 - 40);
          ctx.fillText(`${winner} wins!`, canvas.width / 2 - 100, canvas.height / 2 + 10);
          resolve(winner);
        }, 1000);
      }
    }, 1000 / 60);
  });
}

// ====================== Tournament Flow ======================
let tournament: Tournament | null = null;
let currentMatch: Match | null = null;
let matchWins: { [player: string]: number } = {};

// Called when the tournament view loads.
function startTournamentView(): void {
  // Switch views.
  (document.getElementById("tournament-registration-view") as HTMLElement).style.display = "none";
  (document.getElementById("tournament-game-view") as HTMLElement).style.display = "flex";
  // Display the full match schedule.
  if (tournament) {
    const schedule = tournament.getMatchSchedule();
    const matchScheduleDiv = document.getElementById("match-schedule") as HTMLElement | null;
    if (matchScheduleDiv) {
      matchScheduleDiv.innerHTML = `<p>Match Schedule:</p><ul>${schedule
        .map((m, idx) => `<li>Match ${idx + 1}: ${m.player1} vs ${m.player2}</li>`)
        .join("")}</ul>`;
    }
  }
}

// Start the next match in the tournament.
async function startNextMatch(): Promise<void> {
  if (!tournament) {
    alert("Tournament not initialized.");
    return;
  }
  currentMatch = tournament.getNextMatch();
  if (!currentMatch) {
    // Tournament is over. Determine overall winner.
    let overallWinner = "";
    let maxWins = 0;
    for (const player in matchWins) {
      if (matchWins[player] > maxWins) {
        overallWinner = player;
        maxWins = matchWins[player];
      }
    }
    alert(`Tournament complete! Overall winner: ${overallWinner}`);
    // (Optionally, send tournament result to backend here.)
    return;
  }

  // Update UI with current match info.
  const matchInfo = document.getElementById("current-match-info") as HTMLElement;
  if (matchInfo) {
    matchInfo.innerHTML = `<p>Current Match: ${currentMatch.player1} vs ${currentMatch.player2}</p>`;
  }

  // Run the Pong match for the current match.
  const winner = await runPongMatch(currentMatch);
  // Record the win.
  matchWins[winner] = (matchWins[winner] || 0) + 1;
  alert(`Match result: ${winner} wins this match.`);
  // (Optionally, update the match schedule UI to mark this match as completed.)
}

// ====================== View Controls ======================

// Tournament control buttons.
const startMatchBtn = document.getElementById("start-match-btn") as HTMLButtonElement | null;
if (startMatchBtn) {
  startMatchBtn.addEventListener("click", startNextMatch);
}

const pauseTournamentBtn = document.getElementById("pause-btn-tournament") as HTMLButtonElement | null;
if (pauseTournamentBtn) {
  pauseTournamentBtn.addEventListener("click", () => {
    tournamentPaused = !tournamentPaused;
    pauseTournamentBtn.textContent = tournamentPaused ? "Resume" : "Pause";
  });
}

const backTournamentBtn = document.getElementById("back-btn-tournament") as HTMLButtonElement | null;
if (backTournamentBtn) {
  backTournamentBtn.addEventListener("click", () => {
    // Cancel tournament and return to registration view.
    tournamentCancelled = true;
    (document.getElementById("tournament-game-view") as HTMLElement).style.display = "none";
    (document.getElementById("tournament-registration-view") as HTMLElement).style.display = "flex";
    const matchScheduleDiv = document.getElementById("match-schedule") as HTMLElement | null;
    if (matchScheduleDiv) matchScheduleDiv.innerHTML = "";
  });
}

// ====================== Tournament Registration ======================


let selectedPlayers: string[] = [];
const allUsersList: PlayerResponse = fetchAllPlayers();

const userSearchInput = document.getElementById("user-search") as HTMLInputElement;
userSearchInput.addEventListener("input", () => {
	const query = userSearchInput.value.toLowerCase();
  if (query.length < 2) {
    searchResultsContainer!.style.display = "none";
    searchResultsContainer!.innerHTML = "";
    return;
  }
  const filteredUsers: string[] = allUsersList.data.filter((username) =>
    username.toLowerCase().includes(query)
  );
  displaySearchResults(filteredUsers, searchResultsContainer!);
});

const userSearchDiv = document.getElementById("user-search") as HTMLElement;
let searchResultsContainer = document.getElementById("search-results") as HTMLDivElement | null;
if (!searchResultsContainer) {
  searchResultsContainer = document.createElement("div");
  searchResultsContainer.id = "search-results";
  userSearchDiv.appendChild(searchResultsContainer);
}

function displaySearchResults(users: string[], container: HTMLDivElement): void {
	container.innerHTML = "";
  if (users.length === 0) {
    container.style.display = "none";
    return;
  }
  users.forEach((username) => {
    const div = document.createElement("div");
    div.textContent = username;
    div.className = "search-result-item";
    div.onclick = () => selectUser(username);
    container.appendChild(div);
  });
  container.style.display = "block";
}

function selectUser(username: string): void {
  if (selectedPlayers.includes(username)) return;
  if (selectedPlayers.length >= 6) {
    alert("You can only invite up to 6 players.");
    return;
  }
  selectedPlayers.push(username);
  updateSelectedUsers();
  searchResultsContainer!.innerHTML = "";
  searchResultsContainer!.style.display = "none";
  userSearchInput.value = "";
}

function updateSelectedUsers(): void {
  const list = document.getElementById("selected-users") as HTMLUListElement;
  list.innerHTML = "";
  selectedPlayers.forEach((player) => {
    const li = document.createElement("li");
    li.classList.add(
      "bg-purple-500",
      "bg-opacity-30",
      "text-red",
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

// Registration: send tournament registration to backend.
async function registerTournament(): Promise<void> {
  if (selectedPlayers.length < 4) {
    alert("Please select at least 4 players to start a tournament.");
    return;
  }
  try {
    const response = await fetch("/api/tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: selectedPlayers.length, multi: true }),
    });
    if (!response.ok) throw new Error("Failed to register tournament");
    const data = await response.json();
    // Store tournament ID if needed.
    // Switch view: hide registration, show tournament game view.
    (document.getElementById("tournament-registration-view") as HTMLElement).style.display = "none";
    (document.getElementById("tournament-game-view") as HTMLElement).style.display = "flex";
    // Display invited players.
    const regList = document.getElementById("registered-users") as HTMLUListElement;
    regList.innerHTML = "";
    selectedPlayers.forEach((player) => {
      const li = document.createElement("li");
      li.classList.add("text-white", "px-3", "py-2", "mx-1", "my-1", "font-semibold");
      li.textContent = player;
      regList.appendChild(li);
    });
    // Initialize the tournament object.
    tournament = new Tournament(selectedPlayers);
    // Reset match wins.
    matchWins = {};
    // Load tournament game view.
    startTournamentView();
  } catch (error) {
    console.error("Error registering tournament:", error);
    alert("Error registering tournament");
  }
}

// ====================== Button Event Listeners ======================
const registerTournamentBtn = document.getElementById("registerTournamentBtn") as HTMLButtonElement | null;
if (registerTournamentBtn) {
  registerTournamentBtn.addEventListener("click", registerTournament);
}