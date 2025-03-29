// // // tournament.ts
// // interface TournamentMatch {
// //   player1: string;
// //   player2: string;
// // }

// // class Tournament {
// //   players: string[];
// //   matches: TournamentMatch[];
// //   currentMatchIndex: number;
  
// //   constructor(players: string[]) {
// //     this.players = players;
// //     this.currentMatchIndex = 0;
// //     this.matches = this.createMatches(players);
// //   }
  
// //   private createMatches(players: string[]): TournamentMatch[] {
// //     var matches: TournamentMatch[] = [];
// //     for (var i = 0; i < players.length; i += 2) {
// //       if (i + 1 < players.length) {
// //         matches.push({ player1: players[i], player2: players[i + 1] });
// //       } else {
// //         matches.push({ player1: players[i], player2: "BYE" });
// //       }
// //     }
// //     return matches;
// //   }
  
// //   nextMatch(): TournamentMatch | null {
// //     if (this.currentMatchIndex < this.matches.length) {
// //       return this.matches[this.currentMatchIndex++];
// //     }
// //     return null;
// //   }
// // }

// // var currentTournament: Tournament | null = null;

// // function registerTournament(players: string[]): void {
// //   if (players.length < 2) {
// //     alert("At least 2 players are required for a tournament.");
// //     return;
// //   }
// //   currentTournament = new Tournament(players);
// //   alert("Tournament registered with " + players.length + " players.");
// // }

// // function startTournament(): void {
// //   if (!currentTournament) {
// //     alert("No tournament registered.");
// //     return;
// //   }
// //   playNextMatch();
// // }

// // function playNextMatch(): void {
// //   if (!currentTournament) return;
// //   var match = currentTournament.nextMatch();
// //   if (!match) {
// //     alert("Tournament finished!");
// //     return;
// //   }
// //   if (match.player2 === "BYE") {
// //     alert(match.player1 + " advances due to bye!");
// //     playNextMatch();
// //     return;
// //   }
// //   // Save match players for the multiplayer game (so runMultiplayerGame can read them)
// //   localStorage.setItem("multiplayerPlayer1", match.player1);
// //   localStorage.setItem("multiplayerPlayer2", match.player2);
// //   alert("Next Match: " + match.player1 + " vs. " + match.player2);
// //   // Start the multiplayer match by running the multiplayer game function:
// //   runMultiplayerGame();
  
// //   // Listen for match completion event from the multiplayer game
// //   document.addEventListener("tournamentMatchComplete", function handler(e: any) {
// //     document.removeEventListener("tournamentMatchComplete", handler);
// //     var winner = e.detail.winner;
// //     alert(winner + " wins this match!");
// //     // Proceed to the next match
// //     playNextMatch();
// //   });
// // }

// // // Expose tournament functions globally (if needed)
// // function getTournamentFunctions() {
// //   return {
// //     registerTournament: registerTournament,
// //     startTournament: startTournament,
// //   };
// // }


// interface TournamentMatch {
//   player1: string;
//   player2: string;
// }

// class Tournament {
//   players: string[];
//   matches: TournamentMatch[];
//   currentMatchIndex: number;
  
//   constructor(players: string[]) {
//     this.players = players;
//     this.currentMatchIndex = 0;
//     this.matches = this.createMatches(players);
//   }
  
//   private createMatches(players: string[]): TournamentMatch[] {
//     let matches: TournamentMatch[] = [];
//     for (let i = 0; i < players.length; i += 2) {
//       if (i + 1 < players.length) {
//         matches.push({ player1: players[i], player2: players[i + 1] });
//       } else {
//         // Odd number: last player gets a bye
//         matches.push({ player1: players[i], player2: "BYE" });
//       }
//     }
//     return matches;
//   }
  
//   nextMatch(): TournamentMatch | null {
//     if (this.currentMatchIndex < this.matches.length) {
//       return this.matches[this.currentMatchIndex++];
//     }
//     return null;
//   }
// }

// var currentTournament: Tournament | null = null;

// function registerTournament(players: string[]): void {
//   if (players.length < 2) {
//     alert("At least 2 players are required for a tournament.");
//     return;
//   }
//   currentTournament = new Tournament(players);
//   alert("Tournament registered with " + players.length + " players.");
// }

// function startTournament(): void {
//   if (!currentTournament) {
//     alert("No tournament registered.");
//     return;
//   }
//   playNextMatch();
// }

// function playNextMatch(): void {
//   if (!currentTournament) return;
//   var match = currentTournament.nextMatch();
//   if (!match) {
//     alert("Tournament finished!");
//     return;
//   }
//   if (match.player2 === "BYE") {
//     alert(match.player1 + " advances due to bye!");
//     playNextMatch();
//     return;
//   }
//   // Store match players for the multiplayer game
//   localStorage.setItem("multiplayerPlayer1", match.player1);
//   localStorage.setItem("multiplayerPlayer2", match.player2);
//   alert("Next Match: " + match.player1 + " vs. " + match.player2);
  
//   // Start the multiplayer match.
//   // runMultiplayerGame is defined in your multiplayer code.
//   if (typeof runMultiplayerGame === "function") {
//     runMultiplayerGame();
//   } else {
//     console.error("runMultiplayerGame is not defined.");
//   }
  
//   // For testing, simulate the match finishing after 5 seconds:
//   setTimeout(function() {
//     // Randomly pick a winner.
//     var winner = Math.random() < 0.5 ? match.player1 : match.player2;
//     alert(winner + " wins this match!");
//     // Dispatch a custom event to signal match completion.
//     var event = new CustomEvent("tournamentMatchComplete", { detail: { winner: winner } });
//     document.dispatchEvent(event);
//   }, 5000);
  
//   // Listen for the match completion event and move to the next match.
//   document.addEventListener("tournamentMatchComplete", function handler(e: any) {
//     document.removeEventListener("tournamentMatchComplete", handler);
//     playNextMatch();
//   });
// }

// // Expose tournament functions globally
// // (Since we're not using modules, attach them to window)
// (window as any).registerTournament = registerTournament;
// (window as any).startTournament = startTournament;






// tournament.ts

console.log("beeeeeppp");

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
  
  // Pair players in order; if odd number, the last gets a bye.
  private createMatches(players: string[]): TournamentMatch[] {
    let matches: TournamentMatch[] = [];
    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        matches.push({ player1: players[i], player2: players[i + 1] });
      } else {
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
 * Registers the tournament with an array of player aliases.
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
 * Starts the tournament, playing matches one after the other.
 */
function startTournament(): void {
  if (!currentTournament) {
    alert("No tournament registered.");
    return;
  }
  playNextMatch();
}

/**
 * Launches the next match. It sets the current match's player names in localStorage,
 * calls runMultiplayerGame() to start the match, and listens for a custom event
 * 'tournamentMatchComplete' (dispatched by your multiplayer game when finished)
 * to move to the next match.
 */
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
  
  // Store current match players for the multiplayer game.
  localStorage.setItem("multiplayerPlayer1", match.player1);
  localStorage.setItem("multiplayerPlayer2", match.player2);
  alert("Next Match: " + match.player1 + " vs. " + match.player2);
  
  // Start the multiplayer match.
  if (typeof runMultiplayerGame === "function") {
    runMultiplayerGame();
  } else {
    console.error("runMultiplayerGame is not defined.");
    return;
  }

  // Listen for the match completion event.
  document.addEventListener("tournamentMatchComplete", function handler(e: any) {
    document.removeEventListener("tournamentMatchComplete", handler);
    var winner = e.detail.winner;
    alert(winner + " wins this match!");
    // Proceed to the next match.
    playNextMatch();
  });
}

// Expose the tournament functions globally.
(window as any).registerTournament = registerTournament;
(window as any).startTournament = startTournament;
