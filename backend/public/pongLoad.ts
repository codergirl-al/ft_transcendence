// document.addEventListener("DOMContentLoaded", async () => {
//   console.log("DOM fully loaded");
//   try {
//     // Only use a plain string for the path
//     const { startGame } = await import("./multiplayer.js");
//     console.log("multiplayer module imported successfully");

//     const gameDataElement = document.getElementById("pong") as HTMLCanvasElement;
//     if (!gameDataElement) {
//       console.error("Canvas element with id 'pong' not found.");
//       return;
//     }
//     startGame();
//   } catch (error) {
//     console.error("Error importing multiplayer module:", error);
//   }
// });
