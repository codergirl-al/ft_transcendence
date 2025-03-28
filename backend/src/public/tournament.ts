// tournament.ts
interface TournamentMatch {
  player1: string;
  player2: string;
}

class Tournament {
  players: string[];
  matches: TournamentMatch[];
  currentMatchIndex: number;
  
  constructor(players: string[]) {
    this.players = players;
    this.currentMatchIndex = 0;
    this.matches = this.createMatches(players);
  }
  
  private createMatches(players: string[]): TournamentMatch[] {
    var matches: TournamentMatch[] = [];
    for (var i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        matches.push({ player1: players[i], player2: players[i + 1] });
      } else {
        // Odd number, last player gets a bye
        matches.push({ player1: players[i], player2: "BYE" });
      }
    }
    return matches;
  }
  
  nextMatch(): TournamentMatch | null {
    if (this.currentMatchIndex < this.matches.length) {
      return this.matches[this.currentMatchIndex++];
    }
    return null;
  }
}

var currentTournament: Tournament | null = null;

/**
 * Call this function (for example, from your registration form) with an array of aliases.
 */
function registerTournament(players: string[]): void {
  if (players.length < 2) {
    alert("At least 2 players are required for a tournament.");
    return;
  }
  currentTournament = new Tournament(players);
  alert("Tournament registered with " + players.length + " players.");
}

/**
 * Start the tournament matches.
 */
function startTournament(): void {
  if (!currentTournament) {
    alert("No tournament registered.");
    return;
  }
  playNextMatch();
}

function playNextMatch(): void {
  if (!currentTournament) return;
  var match = currentTournament.nextMatch();
  if (!match) {
    alert("Tournament finished!");
    return;
  }
  if (match.player2 === "BYE") {
    alert(match.player1 + " advances due to bye!");
    playNextMatch();
    return;
  }
  // Save current match players for multiplayer game (they will be read by multiplayer.ts)
  localStorage.setItem("multiplayerPlayer1", match.player1);
  localStorage.setItem("multiplayerPlayer2", match.player2);
  alert("Next Match: " + match.player1 + " vs. " + match.player2);
  // Start the multiplayer game (assumes multiplayer.ts is loaded and defines startMultiGame)
  startMultiGame();
  
  // Listen for match completion event dispatched by the multiplayer game\n  document.addEventListener(\"tournamentMatchComplete\", function handler(e: CustomEvent) {\n    document.removeEventListener(\"tournamentMatchComplete\", handler);\n    var winner = e.detail.winner as string;\n    alert(winner + \" wins this match!\");\n    playNextMatch();\n  });\n}

// Expose functions globally (if needed)
function getTournamentFunctions() {\n  return { registerTournament: registerTournament, startTournament: startTournament };\n}
