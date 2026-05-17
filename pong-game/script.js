// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

// Player paddle (left side)
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer paddle (right side)
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4.5
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: 5,
    dy: 5,
    speed: 5,
    maxSpeed: 8
};

// Score
let playerScore = 0;
let computerScore = 0;

// Keyboard input
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse tracking
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    // Move paddle to follow mouse with some smoothing
    const targetY = mouseY - player.height / 2;
    player.y = Math.max(0, Math.min(canvas.height - player.height, targetY));
});

// Arrow keys control
function handleInput() {
    if (keys['ArrowUp']) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys['ArrowDown']) {
        player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    }
}

// Computer AI
function updateComputerAI() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;

    // Simple AI: follow the ball with some delay
    if (computerCenter < ballCenter - 35) {
        computer.y = Math.min(canvas.height - computer.height, computer.y + computer.speed);
    } else if (computerCenter > ballCenter + 35) {
        computer.y = Math.max(0, computer.y - computer.speed);
    }
}

// Draw rectangle
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Draw circle (for ball)
function drawCircle(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

// Draw center line
function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Check collision with paddle
function checkPaddleCollision(paddle) {
    // Check if ball is within paddle's Y range
    if (ball.y - ball.size < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y) {
        
        // Check if ball is at paddle's X position
        if (ball.x - ball.size < paddle.x + paddle.width &&
            ball.x + ball.size > paddle.x) {
            
            // Calculate hit position (0 to 1, where 0.5 is center)
            const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
            
            // Bounce ball back
            ball.dx = -ball.dx * 1.05; // Increase speed slightly
            ball.dy = hitPos * ball.maxSpeed;
            
            // Move ball away from paddle to prevent multiple collisions
            if (ball.dx > 0) {
                ball.x = paddle.x + paddle.width + ball.size;
            } else {
                ball.x = paddle.x - ball.size;
            }
            
            return true;
        }
    }
    return false;
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top and bottom)
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }

    // Paddle collision
    checkPaddleCollision(player);
    checkPaddleCollision(computer);

    // Score points
    if (ball.x - ball.size < 0) {
        computerScore++;
        updateScore();
        resetBall();
    } else if (ball.x + ball.size > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 5;
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#fff');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#fff');

    // Draw ball
    drawCircle(ball.x, ball.y, ball.size, '#fff');

    // Draw borders
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// Game loop
function gameLoop() {
    handleInput();
    updateComputerAI();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Reset game
document.getElementById('resetBtn').addEventListener('click', () => {
    playerScore = 0;
    computerScore = 0;
    updateScore();
    resetBall();
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.y = canvas.height / 2 - paddleHeight / 2;
});

// Start game
gameLoop();
