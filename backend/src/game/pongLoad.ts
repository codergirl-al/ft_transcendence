import { startGame } from "./multiplayer.js";

// These values will be injected at runtime by the backend
const gameDataElement = document.getElementById("pong") as HTMLCanvasElement;


startGame();
