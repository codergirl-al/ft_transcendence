document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("pongMulti") as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;

  const paddleWidth = 10;
  const paddleHeight = 100;

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

  const player1: Paddle = { x: 10, y: canvas.height / 2 - 50, dy: 0, score: 0 };
  const player2: Paddle = { x: canvas.width - 20, y: canvas.height / 2 - 50, dy: 0, score: 0 };

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

    if (checkCollision(player1)) {
      let collidePoint = ball.y - (player1.y + paddleHeight / 2);
      collidePoint = collidePoint / (paddleHeight / 2);
      let angle = collidePoint * (Math.PI / 4);
      ball.dx = ball.speed * Math.cos(angle);
      ball.dy = ball.speed * Math.sin(angle);
      ball.speed += 0.5;
    }

    if (checkCollision(player2)) {
      let collidePoint = ball.y - (player2.y + paddleHeight / 2);
      collidePoint = collidePoint / (paddleHeight / 2);
      let angle = collidePoint * (Math.PI / 4);
      ball.dx = -ball.speed * Math.cos(angle);
      ball.dy = ball.speed * Math.sin(angle);
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
    player2.y += player2.dy;

    player1.y = Math.max(Math.min(player1.y, canvas.height - paddleHeight), 0);
    player2.y = Math.max(Math.min(player2.y, canvas.height - paddleHeight), 0);

    if (player1.score >= 5 || player2.score >= 5) {
      gameOver = true;
      clearInterval(loop);
    }
  }

  function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#000");
    drawText(player1.score.toString(), canvas.width / 4, 50);
    drawText(player2.score.toString(), (3 * canvas.width) / 4, 50);
    drawRect(player1.x, player1.y, paddleWidth, paddleHeight, "#FFF");
    drawRect(player2.x, player2.y, paddleWidth, paddleHeight, "#FFF");
    drawCircle(ball.x, ball.y, ball.radius, "#FFF");
  }

  function gamerender() {
    drawRect(0, 0, canvas.width, canvas.height, "#000");
    drawText(player1.score.toString(), canvas.width / 4, 50);
    drawText(player2.score.toString(), (3 * canvas.width) / 4, 50);
    drawRect(player1.x, player1.y, paddleWidth, paddleHeight, "#FFF");
    drawRect(player2.x, player2.y, paddleWidth, paddleHeight, "#FFF");
    drawCircle(ball.x, ball.y, ball.radius, "#FFF");
  
    if (gameOver) {
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 48px Arial";
      const winner = player1.score > player2.score ? "Player1" : "Player2";
      const message = winner + " WON THE GAME";
      const msgWidth = ctx.measureText(message).width;
      ctx.fillText("Game Over", canvas.width / 2 - 120, canvas.height / 2 - 40);
      ctx.fillText(message, canvas.width / 2 - msgWidth / 2, canvas.height / 2 + 10);
      ctx.font = "24px Arial";
      ctx.fillText("Press R to Restart", canvas.width / 2 - 100, canvas.height / 2 + 50);
    }
  }

  function gameLoop() {
    update();
    render();
    gamerender();
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "w") player1.dy = -7;
    if (e.key === "s") player1.dy = 7;
    if (e.key === "ArrowUp") player2.dy = -7;
    if (e.key === "ArrowDown") player2.dy = 7;
    if (gameOver && e.key.toLowerCase() === "r") location.reload();
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "s") player1.dy = 0;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") player2.dy = 0;
  });

  loop = window.setInterval(gameLoop, 1000 / 60);
};
