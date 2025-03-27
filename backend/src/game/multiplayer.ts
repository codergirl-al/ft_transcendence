const canvas = document.getElementById("pong") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const paddleWidth = 10, paddleHeight = 100;

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

const player: Paddle = { x: 10, y: canvas.height / 2 - 50, dy: 0, score: 0 };
const ai: Paddle = { x: canvas.width - 20, y: canvas.height / 2 - 50, dy: 0, score: 0 };

const ball: Ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  speed: 5,
  dx: 5,
  dy: 5,
};

function drawRect(x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

function drawText(text: string, x: number, y: number) {
  ctx.fillStyle = "#FFF";
  ctx.font = "32px Arial";
  ctx.fillText(text, x, y);
}

function render() {
  drawRect(0, 0, canvas.width, canvas.height, "#000");
  drawText(player.score.toString(), canvas.width / 4, 50);
  drawText(ai.score.toString(), 3 * canvas.width / 4, 50);
  drawRect(player.x, player.y, paddleWidth, paddleHeight, "#FFF");
  drawRect(ai.x, ai.y, paddleWidth, paddleHeight, "#FFF");
  drawCircle(ball.x, ball.y, ball.radius, "#FFF");
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = -ball.dx;
  ball.speed = 5;
}

function update(gameId: number, userId1: number, userId2: number) {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  const paddle = ball.x < canvas.width / 2 ? player : ai;

  if (
    ball.x + ball.radius > paddle.x &&
    ball.x - ball.radius < paddle.x + paddleWidth &&
    ball.y + ball.radius > paddle.y &&
    ball.y - ball.radius < paddle.y + paddleHeight
  ) {
    let collidePoint = ball.y - (paddle.y + paddleHeight / 2);
    collidePoint = collidePoint / (paddleHeight / 2);
    const angleRad = collidePoint * (Math.PI / 4);
    const direction = ball.x < canvas.width / 2 ? 1 : -1;
    ball.dx = direction * ball.speed * Math.cos(angleRad);
    ball.dy = ball.speed * Math.sin(angleRad);
    ball.speed += 0.5;
  }

  if (ball.x - ball.radius < 0) {
    ai.score++;
    resetBall();
  } else if (ball.x + ball.radius > canvas.width) {
    player.score++;
    resetBall();
  }

  player.y += player.dy;
  ai.y += ai.dy;
  player.y = Math.max(Math.min(player.y, canvas.height - paddleHeight), 0);
  ai.y = Math.max(Math.min(ai.y, canvas.height - paddleHeight), 0);

  if (player.score >= 5 || ai.score >= 5) {
    const winner = player.score > ai.score ? userId1 : userId2;
    fetch(`/api/game/${gameId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score1: player.score,
        score2: ai.score,
        winner
      })
    }).then(() => {
      alert("Game Over. Refresh to play again.");
    });
    clearInterval(loop);
  }
}

function gameLoop(gameId: number, userId1: number, userId2: number) {
  update(gameId, userId1, userId2);
  render();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "w") player.dy = -7;
  if (e.key === "s") player.dy = 7;
  if (e.key === "ArrowUp") ai.dy = -7;
  if (e.key === "ArrowDown") ai.dy = 7;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "w" || e.key === "s") player.dy = 0;
  if (e.key === "ArrowUp" || e.key === "ArrowDown") ai.dy = 0;
});

let loop: number;

export function startGame(gameId: number, userId1: number, userId2: number) {
  loop = window.setInterval(() => gameLoop(gameId, userId1, userId2), 1000 / 60);
}
