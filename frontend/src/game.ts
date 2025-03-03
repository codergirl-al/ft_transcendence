export const startPongGame = () => {
  const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  let ball = { x: 100, y: 100, dx: 2, dy: 2, radius: 10 };
  const drawBall = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ball.x += ball.dx;
    ball.y += ball.dy;
  };
  setInterval(drawBall, 16);
};
