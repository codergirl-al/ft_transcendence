// const canvas = document.getElementById("pong") as HTMLCanvasElement;
// const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// // Constants for paddle and ball
// const paddleWidth = 10;
// const paddleHeight = 100;

// // Interfaces for our game objects
// interface Paddle {
//   x: number;
//   y: number;
//   dx: number;
//   dy: number;
//   score: number;
// }

// interface Ball {
//   x: number;
//   y: number;
//   radius: number;
//   speed: number;
//   dx: number;
//   dy: number;
// }

// let gameOver = false;
// let loop: number;

// // Initialize the two players
// const player1: Paddle = {
//   x: 10,
//   y: canvas.height / 2 - paddleHeight / 2,
//   dx: 0,
//   dy: 0,
//   score: 0,
// };

// const player2: Paddle = {
//   x: canvas.width - paddleWidth - 10,
//   y: canvas.height / 2 - paddleHeight / 2,
//   dx: 0,
//   dy: 0,
//   score: 0,
// };

// // Initialize the ball
// const ball: Ball = {
//   x: canvas.width / 2,
//   y: canvas.height / 2,
//   radius: 10,
//   speed: 5,
//   dx: 5,
//   dy: 5,
// };

// // Drawing helper functions
// function drawRect(x: number, y: number, w: number, h: number, color: string | CanvasGradient) {
//   ctx.fillStyle = color;
//   ctx.fillRect(x, y, w, h);
// }

// function drawCircle(x: number, y: number, r: number, color: string) {
//   ctx.fillStyle = color;
//   ctx.beginPath();
//   ctx.arc(x, y, r, 0, Math.PI * 2, false);
//   ctx.closePath();
//   ctx.fill();
// }

// function drawText(text: string, x: number, y: number) {
//   ctx.fillStyle = "#FFF";
//   ctx.font = "32px Arial";
//   ctx.fillText(text, x, y);
// }

// // Draw a dashed net in the center
// function drawNet() {
//   for (let i = 0; i < canvas.height; i += 20) {
//     drawRect(canvas.width / 2 - 1, i, 2, 10, "#FFF");
//   }
// }

// // Render the game: background, net, scores, paddles, ball, and (if over) game over message
// function render() {
//   // Create a vertical gradient background
//   const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
//   gradient.addColorStop(0, "#020024");
//   gradient.addColorStop(0.5, "#090979");
//   gradient.addColorStop(1, "#00d4ff");
//   drawRect(0, 0, canvas.width, canvas.height, gradient);

//   drawNet();

//   // Display scores (positioned roughly in the left/right quarters)
//   drawText(player1.score.toString(), canvas.width / 4, 50);
//   drawText(player2.score.toString(), (3 * canvas.width) / 4, 50);

//   // Draw both paddles and the ball
//   drawRect(player1.x, player1.y, paddleWidth, paddleHeight, "#FFF");
//   drawRect(player2.x, player2.y, paddleWidth, paddleHeight, "#FFF");
//   drawCircle(ball.x, ball.y, ball.radius, "#FFF");

//   // If the game is over, show a centered message
//   if (gameOver) {
//     ctx.fillStyle = "#FFF";
//     ctx.font = "bold 48px Arial";
//     const winner = player1.score > player2.score ? "Player 1 Wins!" : "Player 2 Wins!";
//     ctx.fillText("Game Over", canvas.width / 2 - 120, canvas.height / 2 - 20);
//     ctx.fillText(winner, canvas.width / 2 - 160, canvas.height / 2 + 40);
//     ctx.font = "24px Arial";
//     ctx.fillText("Press R to Restart", canvas.width / 2 - 100, canvas.height / 2 + 80);
//   }
// }

// // Reset the ball to the center and reverse its horizontal direction
// function resetBall() {
//   ball.x = canvas.width / 2;
//   ball.y = canvas.height / 2;
//   ball.speed = 5;
//   ball.dx = -ball.dx;
//   ball.dy = 5 * (Math.random() > 0.5 ? 1 : -1);
// }

// // Check if the ball collides with a given paddle
// function checkPaddleCollision(paddle: Paddle): boolean {
//   return (
//     ball.x + ball.radius > paddle.x &&
//     ball.x - ball.radius < paddle.x + paddleWidth &&
//     ball.y + ball.radius > paddle.y &&
//     ball.y - ball.radius < paddle.y + paddleHeight
//   );
// }

// // Update game objects: ball movement, collisions, scoring, and paddle movement
// function update() {
//   if (gameOver) return;

//   // Move the ball
//   ball.x += ball.dx;
//   ball.y += ball.dy;

//   // Bounce off top and bottom edges
//   if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
//     ball.dy = -ball.dy;
//   }

//   // Check collision with player1 paddle
//   if (checkPaddleCollision(player1)) {
//     let collidePoint = ball.y - (player1.y + paddleHeight / 2);
//     collidePoint /= paddleHeight / 2;
//     const angleRad = collidePoint * (Math.PI / 4);
//     ball.dx = ball.speed * Math.cos(angleRad);
//     ball.dy = ball.speed * Math.sin(angleRad);
//     ball.speed += 0.5;
//   }
//   // Check collision with player2 paddle
//   else if (checkPaddleCollision(player2)) {
//     let collidePoint = ball.y - (player2.y + paddleHeight / 2);
//     collidePoint /= paddleHeight / 2;
//     const angleRad = collidePoint * (Math.PI / 4);
//     ball.dx = -ball.speed * Math.cos(angleRad);
//     ball.dy = ball.speed * Math.sin(angleRad);
//     ball.speed += 0.5;
//   }

//   // Update scores if the ball goes off the screen
//   if (ball.x - ball.radius < 0) {
//     player2.score++;
//     resetBall();
//   } else if (ball.x + ball.radius > canvas.width) {
//     player1.score++;
//     resetBall();
//   }

//   // Update paddle positions based on their current velocity
//   player1.x += player1.dx;
//   player1.y += player1.dy;
//   player2.x += player2.dx;
//   player2.y += player2.dy;

//   // Clamp player1 to the left half of the canvas
//   player1.y = Math.max(Math.min(player1.y, canvas.height - paddleHeight), 0);
//   player1.x = Math.max(Math.min(player1.x, canvas.width / 2 - paddleWidth - 10), 0);
  
//   // Clamp player2 to the right half of the canvas
//   player2.y = Math.max(Math.min(player2.y, canvas.height - paddleHeight), 0);
//   player2.x = Math.max(Math.min(player2.x, canvas.width - paddleWidth), canvas.width / 2);

//   // End the game if a player reaches 5 points
//   if (player1.score >= 5 || player2.score >= 5) {
//     gameOver = true;
//     clearInterval(loop);
//   }
// }

// // The main game loop: update positions and then render everything
// function gameLoop() {
//   update();
//   render();
// }

// // Event listeners for key controls
// document.addEventListener("keydown", (e) => {
//   // Restart the game if it is over and the player presses "r"
//   if (gameOver && e.key === "r") {
//     restartGame();
//     return;
//   }

//   // Player1 controls (WASD)
//   switch (e.key) {
//     case "w":
//       player1.dy = -7;
//       break;
//     case "s":
//       player1.dy = 7;
//       break;
//     case "a":
//       player1.dx = -7;
//       break;
//     case "d":
//       player1.dx = 7;
//       break;
//     // Player2 controls (Arrow keys)
//     case "ArrowUp":
//       player2.dy = -7;
//       break;
//     case "ArrowDown":
//       player2.dy = 7;
//       break;
//     case "ArrowLeft":
//       player2.dx = -7;
//       break;
//     case "ArrowRight":
//       player2.dx = 7;
//       break;
//   }
// });

// document.addEventListener("keyup", (e) => {
//   switch (e.key) {
//     // Stop vertical movement for player1
//     case "w":
//     case "s":
//       player1.dy = 0;
//       break;
//     // Stop horizontal movement for player1
//     case "a":
//     case "d":
//       player1.dx = 0;
//       break;
//     // Stop vertical movement for player2
//     case "ArrowUp":
//     case "ArrowDown":
//       player2.dy = 0;
//       break;
//     // Stop horizontal movement for player2
//     case "ArrowLeft":
//     case "ArrowRight":
//       player2.dx = 0;
//       break;
//   }
// });

// // Restart game: reset scores, positions, ball, and resume the loop
// function restartGame() {
//   player1.score = 0;
//   player2.score = 0;
//   player1.x = 10;
//   player1.y = canvas.height / 2 - paddleHeight / 2;
//   player2.x = canvas.width - paddleWidth - 10;
//   player2.y = canvas.height / 2 - paddleHeight / 2;
//   ball.x = canvas.width / 2;
//   ball.y = canvas.height / 2;
//   ball.speed = 5;
//   ball.dx = 5;
//   ball.dy = 5;
//   gameOver = false;
//   loop = window.setInterval(gameLoop, 1000 / 60);
// }

// // // Start the game loop
// // export function startGame() {
// //   console.log("startGame() called");
// // }
//   loop = window.setInterval(gameLoop, 1000 / 60);




// pong.ts
document.addEventListener("DOMContentLoaded", () => {
  // Assume the backend injects these variables into the template
  // For example, in your EJS you might have:
  //   <script>
  //     window.GAME_MODE = "<%= mode %>";
  //     window.PLAYER1_NAME = "<%= player1Name || '' %>";
  //     window.PLAYER2_NAME = "<%= player2Name || '' %>";
  //   </script>
  const mode: string = (window as any).GAME_MODE || "single";
  const isSinglePlayer = mode === "single";

  // For single player, we don't need a player name; for multiplayer, both names are expected
  const player1Name: string = isSinglePlayer ? "Player 1" : (window as any).PLAYER1_NAME || "Player 1";
  const player2Name: string = isSinglePlayer ? "AI" : (window as any).PLAYER2_NAME || "Player 2";

  const canvas = document.getElementById("pong") as HTMLCanvasElement;
  if (!canvas) {
    console.error("Canvas element with id 'pong' not found.");
    return;
  }
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  // --- Constants ---
  const paddleWidth = 10;
  const paddleHeight = 100;
  const AI_SPEED = 5;
  const winningScore = 5;

  // --- Interfaces ---
  interface Paddle {
    x: number;
    y: number;
    dy: number;
    score: number;
    name: string;
  }
  interface Ball {
    x: number;
    y: number;
    radius: number;
    speed: number;
    dx: number;
    dy: number;
  }

  // --- Game Objects ---
  const player1: Paddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0,
    score: 0,
    name: player1Name,
  };

  const player2: Paddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0,
    score: 0,
    name: player2Name,
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
  let loopId: number;

  // --- Drawing Helpers ---
  function drawRect(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
  function drawCircle(x: number, y: number, r: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
  function drawText(text: string, x: number, y: number, size = 32) {
    ctx.fillStyle = "#FFF";
    ctx.font = `${size}px Arial`;
    ctx.fillText(text, x, y);
  }

  // --- Render ---
  function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#000");
    drawText(`${player1.name}: ${player1.score}`, canvas.width / 8, 50, 24);
    drawText(`${player2.name}: ${player2.score}`, (5 * canvas.width) / 8, 50, 24);
    drawRect(player1.x, player1.y, paddleWidth, paddleHeight, "#FFF");
    drawRect(player2.x, player2.y, paddleWidth, paddleHeight, "#FFF");
    drawCircle(ball.x, ball.y, ball.radius, "#FFF");

    if (gameOver) {
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 48px Arial";
      const winner = player1.score > player2.score ? player1.name + " Wins!" : player2.name + " Wins!";
      const msgWidth = ctx.measureText(winner).width;
      ctx.fillText("Game Over", canvas.width / 2 - 120, canvas.height / 2 - 40);
      ctx.fillText(winner, canvas.width / 2 - msgWidth / 2, canvas.height / 2 + 10);
      ctx.font = "24px Arial";
      ctx.fillText("Press R to Restart", canvas.width / 2 - 100, canvas.height / 2 + 50);
    }
  }

  // --- Game Logic ---
  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.dx = -ball.dx;
    ball.dy = 5 * (Math.random() > 0.5 ? 1 : -1);
  }
  function checkPaddleCollision(paddle: Paddle) {
    return (
      ball.x + ball.radius > paddle.x &&
      ball.x - ball.radius < paddle.x + paddleWidth &&
      ball.y + ball.radius > paddle.y &&
      ball.y - ball.radius < paddle.y + paddleHeight
    );
  }
  function updateAI() {
    const aiCenter = player2.y + paddleHeight / 2;
    if (ball.y < aiCenter - 10) {
      player2.dy = -AI_SPEED;
    } else if (ball.y > aiCenter + 10) {
      player2.dy = AI_SPEED;
    } else {
      player2.dy = 0;
    }
    player2.y += player2.dy;
    player2.y = Math.max(Math.min(player2.y, canvas.height - paddleHeight), 0);
  }
  function update() {
    if (gameOver) return;

    ball.x += ball.dx;
    ball.y += ball.dy;
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
      ball.dy = -ball.dy;
    }
    if (checkPaddleCollision(player1)) {
      let collidePoint = ball.y - (player1.y + paddleHeight / 2);
      collidePoint /= paddleHeight / 2;
      const angleRad = collidePoint * (Math.PI / 4);
      ball.dx = ball.speed * Math.cos(angleRad);
      ball.dy = ball.speed * Math.sin(angleRad);
      ball.speed += 0.5;
    } else if (checkPaddleCollision(player2)) {
      let collidePoint = ball.y - (player2.y + paddleHeight / 2);
      collidePoint /= paddleHeight / 2;
      const angleRad = collidePoint * (Math.PI / 4);
      ball.dx = -ball.speed * Math.cos(angleRad);
      ball.dy = ball.speed * Math.sin(angleRad);
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
    player1.y = Math.max(Math.min(player1.y, canvas.height - paddleHeight), 0);
    if (isSinglePlayer) {
      updateAI();
    } else {
      player2.y += player2.dy;
      player2.y = Math.max(Math.min(player2.y, canvas.height - paddleHeight), 0);
    }
    if (player1.score >= winningScore || player2.score >= winningScore) {
      gameOver = true;
      clearInterval(loopId);
    }
  }
  function gameLoop() {
    update();
    render();
  }

  // --- Input Handlers ---
  document.addEventListener("keydown", (e) => {
    if (gameOver && e.key.toLowerCase() === "r") {
      restartGame();
      return;
    }
    // Player 1 (W/S)
    if (e.key === "w") {
      player1.dy = -7;
    } else if (e.key === "s") {
      player1.dy = 7;
    }
    // For multiplayer, use arrow keys for Player 2
    if (!isSinglePlayer) {
      if (e.key === "ArrowUp") {
        player2.dy = -7;
      } else if (e.key === "ArrowDown") {
        player2.dy = 7;
      }
    }
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "s") {
      player1.dy = 0;
    }
    if (!isSinglePlayer) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        player2.dy = 0;
      }
    }
  });
  function restartGame() {
    player1.score = 0;
    player2.score = 0;
    player1.y = canvas.height / 2 - paddleHeight / 2;
    player2.y = canvas.height / 2 - paddleHeight / 2;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.dx = 5;
    ball.dy = 5;
    gameOver = false;
    loopId = window.setInterval(gameLoop, 1000 / 60);
  }

  loopId = window.setInterval(gameLoop, 1000 / 60);
});
