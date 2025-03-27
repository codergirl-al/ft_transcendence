import { startGame } from "./multiplayer.js";

// These values will be injected at runtime by the backend
const gameDataElement = document.getElementById("pong") as HTMLCanvasElement;
const gameId = Number(gameDataElement.dataset.gameId);
const userId1 = Number(gameDataElement.dataset.userId1);
const userId2 = Number(gameDataElement.dataset.userId2);

startGame(gameId, userId1, userId2);
