const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.width = 800;
canvas.height = 400;

const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;

let playerY = canvas.height / 2 - paddleHeight / 2;
let aiY = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2 - ballSize / 2;
let ballY = canvas.height / 2 - ballSize / 2;
let ballSpeedX = 4;
let ballSpeedY = 4;

function drawRect(x, y, width, height, color) {
	context.fillStyle = color;
	context.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
	context.fillStyle = color;
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2, true);
	context.fill();
}

function draw() {
	drawRect(0, 0, canvas.width, canvas.height, 'black');
	drawRect(0, playerY, paddleWidth, paddleHeight, 'white');
	drawRect(canvas.width - paddleWidth, aiY, paddleWidth, paddleHeight, 'white');
	drawCircle(ballX, ballY, ballSize, 'white');
}

function update() {
	ballX += ballSpeedX;
	ballY += ballSpeedY;

	if (ballY <= 0 || ballY >= canvas.height - ballSize) {
		ballSpeedY = -ballSpeedY;
	}

	if (ballX <= paddleWidth) {
		if (ballY > playerY && ballY < playerY + paddleHeight) {
			ballSpeedX = -ballSpeedX;
		} else {
			resetBall();
		}
	}

	if (ballX >= canvas.width - paddleWidth - ballSize) {
		if (ballY > aiY && ballY < aiY + paddleHeight) {
			ballSpeedX = -ballSpeedX;
		} else {
			resetBall();
		}
	}

	aiY = ballY - paddleHeight / 2;
}

function resetBall() {
	ballX = canvas.width / 2 - ballSize / 2;
	ballY = canvas.height / 2 - ballSize / 2;
	ballSpeedX = -ballSpeedX;
}

function gameLoop() {
	update();
	draw();
	requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (event) => {
	const rect = canvas.getBoundingClientRect();
	playerY = event.clientY - rect.top - paddleHeight / 2;
});

gameLoop();