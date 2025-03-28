
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("pong") as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;

  const paddleWidth = 10;
  const paddleHeight = 100;
  const AI_SPEED = 5;

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

  let gameOver = false;
  let loop: number;

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

  function updateAI() {
    const center = ai.y + paddleHeight / 2;
    ai.dy = ball.y < center - 10 ? -AI_SPEED : ball.y > center + 10 ? AI_SPEED : 0;
    ai.y += ai.dy;
    ai.y = Math.max(Math.min(ai.y, canvas.height - paddleHeight), 0);
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

    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) ball.dy = -ball.dy;

    if (checkCollision(player)) {
      let collidePoint = ball.y - (player.y + paddleHeight / 2);
      collidePoint = collidePoint / (paddleHeight / 2);
      let angle = collidePoint * (Math.PI / 4);
      ball.dx = ball.speed * Math.cos(angle);
      ball.dy = ball.speed * Math.sin(angle);
      ball.speed += 0.5;
    }

    if (checkCollision(ai)) {
      let collidePoint = ball.y - (ai.y + paddleHeight / 2);
      collidePoint = collidePoint / (paddleHeight / 2);
      let angle = collidePoint * (Math.PI / 4);
      ball.dx = -ball.speed * Math.cos(angle);
      ball.dy = ball.speed * Math.sin(angle);
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
    player.y = Math.max(Math.min(player.y, canvas.height - paddleHeight), 0);

    updateAI();

    if (player.score >= 5 || ai.score >= 5) {
      gameOver = true;
      clearInterval(loop);
    }
  }

  function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#000");
    drawText(player.score.toString(), canvas.width / 4, 50);
    drawText(ai.score.toString(), (3 * canvas.width) / 4, 50);
    drawRect(player.x, player.y, paddleWidth, paddleHeight, "#FFF");
    drawRect(ai.x, ai.y, paddleWidth, paddleHeight, "#FFF");
    drawCircle(ball.x, ball.y, ball.radius, "#FFF");
  }

  function gameLoop() {
    update();
    render();
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "w") player.dy = -7;
    if (e.key === "s") player.dy = 7;
    if (gameOver && e.key.toLowerCase() === "r") location.reload();
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "s") player.dy = 0;
  });

  loop = window.setInterval(gameLoop, 1000 / 60);
};
