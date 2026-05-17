// Create starfield background
function createStarfield() {
    const starfield = document.createElement('div');
    starfield.className = 'starfield';
    document.body.insertBefore(starfield, document.body.firstChild);

    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starfield.appendChild(star);
    }
}

// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 12;
const paddleHeight = 80;
const ballSize = 8;

// Player paddle (left side)
const player = {
    x: 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6,
    glowColor: '#00ffff',
    glowIntensity: 0
};

// Computer paddle (right side)
const computer = {
    x: canvas.width - paddleWidth - 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4.5,
    glowColor: '#ff007f',
    glowIntensity: 0
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: 5,
    dy: 5,
    speed: 5,
    maxSpeed: 8,
    glowColor: '#ffff00',
    glowIntensity: 1,
    trail: []
};

// Score
let playerScore = 0;
let computerScore = 0;
let mouseY = canvas.height / 2;

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
    mouseY = e.clientY - rect.top;
    // Move paddle to follow mouse with smooth interpolation
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

// Draw neon glow rectangle
function drawNeonRect(x, y, width, height, color, glowSize = 15) {
    // Draw glow
    ctx.shadowColor = color;
    ctx.shadowBlur = glowSize;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);

    // Draw brighter core
    ctx.shadowBlur = glowSize / 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(x + 1, y + 1, width - 2, height - 2);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// Draw neon glow circle (for ball)
function drawNeonCircle(x, y, size, color, glowSize = 20) {
    // Draw glow
    ctx.shadowColor = color;
    ctx.shadowBlur = glowSize;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Draw brighter core
    ctx.shadowBlur = glowSize / 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, size - 2, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// Draw ball trail
function drawBallTrail() {
    for (let i = 0; i < ball.trail.length; i++) {
        const point = ball.trail[i];
        const alpha = (i / ball.trail.length) * 0.6;
        ctx.shadowColor = ball.glowColor;
        ctx.shadowBlur = 8 * alpha;
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, ball.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// Draw center line with glow
function drawCenterLine() {
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.setLineDash([15, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);
}

// Draw border with glow
function drawBorder() {
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
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
            
            // Add paddle hit glow
            paddle.glowIntensity = 1;
            
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

// Update ball position and trail
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Add to trail
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 15) {
        ball.trail.shift();
    }

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
    ball.trail = [];
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Update glow intensity
function updateGlowIntensity() {
    player.glowIntensity = Math.max(0, player.glowIntensity - 0.02);
    computer.glowIntensity = Math.max(0, computer.glowIntensity - 0.02);
}

// Draw everything
function draw() {
    // Clear canvas with gradient
    const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width);
    gradient.addColorStop(0, 'rgba(20, 30, 60, 0.9)');
    gradient.addColorStop(1, 'rgba(10, 14, 39, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Draw ball trail
    drawBallTrail();

    // Draw paddles with neon glow
    const playerGlow = 15 + (player.glowIntensity * 10);
    const computerGlow = 15 + (computer.glowIntensity * 10);
    
    drawNeonRect(player.x, player.y, player.width, player.height, player.glowColor, playerGlow);
    drawNeonRect(computer.x, computer.y, computer.width, computer.height, computer.glowColor, computerGlow);

    // Draw ball with neon glow
    drawNeonCircle(ball.x, ball.y, ball.size, ball.glowColor, 20);

    // Draw border
    drawBorder();
}

// Game loop
function gameLoop() {
    handleInput();
    updateComputerAI();
    updateBall();
    updateGlowIntensity();
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

// Initialize and start game
createStarfield();
gameLoop();
