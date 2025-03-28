document.addEventListener("DOMContentLoaded", () => {
	// Get the canvas and context
	const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
	if (!canvas) return;
	
	const ctx = canvas.getContext("2d")as CanvasRenderingContext2D;
	if (!ctx) return;
	
	// Paddle and ball parameters
	const PADDLE_WIDTH = 10;
	const PADDLE_HEIGHT = 100;
	let playerY = 250;
	let aiY = 250;
	let ballX = canvas.width / 2;
	let ballY = canvas.height / 2;
	let ballSpeedX = 5;
	let ballSpeedY = 3;
	const BALL_RADIUS = 8;
	
	// Mouse control for the player's paddle
	canvas.addEventListener("mousemove", (evt) => {
	  const rect = canvas.getBoundingClientRect();
	  const mouseY = evt.clientY - rect.top;
	  playerY = mouseY - (PADDLE_HEIGHT / 2);
	});
	
	// Main game loop
	function gameLoop(): void {
	  update();
	  draw();
	  requestAnimationFrame(gameLoop);
	}
	
	// Update game state
	function update(): void {
	  ballX += ballSpeedX;
	  ballY += ballSpeedY;
	  
	  // Bounce off the top and bottom
	  if (ballY < 0 || ballY > canvas.height) {
		ballSpeedY = -ballSpeedY;
	  }
	  
	  // Collision with the player's paddle
	  if (ballX < PADDLE_WIDTH) {
		if (ballY > playerY && ballY < playerY + PADDLE_HEIGHT) {
		  ballSpeedX = -ballSpeedX;
		} else {
		  resetBall();
		}
	  }
	  
	  // Collision with the AI paddle
	  if (ballX > canvas.width - PADDLE_WIDTH) {
		if (ballY > aiY && ballY < aiY + PADDLE_HEIGHT) {
		  ballSpeedX = -ballSpeedX;
		} else {
		  resetBall();
		}
	  }
	  
	  // Simple AI movement
	  const aiCenter = aiY + (PADDLE_HEIGHT / 2);
	  if (aiCenter < ballY - 35) {
		aiY += 6;
	  } else if (aiCenter > ballY + 35) {
		aiY -= 6;
	  }
	}
	
	// Draw game objects on canvas
	function draw(): void {
	  // Clear the canvas
	  ctx.fillStyle = "#000";
	  ctx.fillRect(0, 0, canvas.width, canvas.height);
	  
	  // Draw paddles
	  ctx.fillStyle = "#fff";
	  ctx.fillRect(0, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
	  ctx.fillRect(canvas.width - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);
	  
	  // Draw the ball
	  ctx.beginPath();
	  ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
	  ctx.fillStyle = "#ff0";
	  ctx.fill();
	}
	
	// Reset the ball to the center
	function resetBall(): void {
	  ballX = canvas.width / 2;
	  ballY = canvas.height / 2;
	  ballSpeedX = -ballSpeedX;
	  ballSpeedY = 3;
	}
	
	// Start the game loop
	requestAnimationFrame(gameLoop);
  });
