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
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
const GRID_SIZE = 20;
const TILE_COUNT = 20;
canvas.width = GRID_SIZE * TILE_COUNT;
canvas.height = GRID_SIZE * TILE_COUNT;

// Game variables
let gameRunning = false;
let gamePaused = false;
let score = 0;
let bestScore = localStorage.getItem('snakeBestScore') || 0;
let level = 1;
let gameSpeed = 100;

// Snake
let snake = [
    { x: 10, y: 10 }
];

// Food
let food = {
    x: Math.floor(Math.random() * TILE_COUNT),
    y: Math.floor(Math.random() * TILE_COUNT)
};

// Direction
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

// Colors
const SNAKE_COLOR = '#00ffff';
const SNAKE_GLOW = '#00ffff';
const FOOD_COLOR = '#ffff00';
const FOOD_GLOW = '#ffff00';
const WALL_COLOR = '#ff007f';
const GRID_COLOR = 'rgba(0, 255, 255, 0.1)';
const BG_COLOR = '#0a1a2e';

// Input handling
const keys = {};
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('keydown', handleKeyPress);
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

function handleKeyPress(e) {
    if (!gameRunning || gamePaused) return;

    switch(e.key) {
        case 'ArrowUp':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
    }
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    if (!gameRunning || gamePaused) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 30 && direction.x === 0) nextDirection = { x: 1, y: 0 };
        if (diffX < -30 && direction.x === 0) nextDirection = { x: -1, y: 0 };
    } else {
        if (diffY > 30 && direction.y === 0) nextDirection = { x: 0, y: 1 };
        if (diffY < -30 && direction.y === 0) nextDirection = { x: 0, y: -1 };
    }

    touchStartX = touchEndX;
    touchStartY = touchEndY;
}

// Button controls
document.getElementById('upBtn').addEventListener('click', () => {
    if (gameRunning && !gamePaused && direction.y === 0) nextDirection = { x: 0, y: -1 };
});

document.getElementById('downBtn').addEventListener('click', () => {
    if (gameRunning && !gamePaused && direction.y === 0) nextDirection = { x: 0, y: 1 };
});

document.getElementById('leftBtn').addEventListener('click', () => {
    if (gameRunning && !gamePaused && direction.x === 0) nextDirection = { x: -1, y: 0 };
});

document.getElementById('rightBtn').addEventListener('click', () => {
    if (gameRunning && !gamePaused && direction.x === 0) nextDirection = { x: 1, y: 0 };
});

// Draw grid
function drawGrid() {
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
}

// Draw snake
function drawSnake() {
    snake.forEach((segment, index) => {
        const x = segment.x * GRID_SIZE + GRID_SIZE / 2;
        const y = segment.y * GRID_SIZE + GRID_SIZE / 2;
        const size = GRID_SIZE * 0.45;

        // Glow effect
        ctx.shadowColor = SNAKE_GLOW;
        ctx.shadowBlur = 15;
        ctx.fillStyle = SNAKE_COLOR;
        ctx.fillRect(
            segment.x * GRID_SIZE + 2,
            segment.y * GRID_SIZE + 2,
            GRID_SIZE - 4,
            GRID_SIZE - 4
        );

        // Head is brighter
        if (index === 0) {
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 20;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        } else {
            ctx.shadowBlur = 10;
            ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
        }

        ctx.fillRect(
            segment.x * GRID_SIZE + 3,
            segment.y * GRID_SIZE + 3,
            GRID_SIZE - 6,
            GRID_SIZE - 6
        );
    });

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// Draw food
function drawFood() {
    const x = food.x * GRID_SIZE;
    const y = food.y * GRID_SIZE;

    // Glow effect
    ctx.shadowColor = FOOD_GLOW;
    ctx.shadowBlur = 20;
    ctx.fillStyle = FOOD_COLOR;
    ctx.beginPath();
    ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2 - 3, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// Update snake
function updateSnake() {
    direction = nextDirection;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        endGame();
        return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10 * level;
        spawnFood();
        updateLevel();
    } else {
        snake.pop();
    }
}

// Spawn food
function spawnFood() {
    let newFood;
    let collision;

    do {
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
        collision = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (collision);

    food = newFood;
}

// Update level
function updateLevel() {
    level = 1 + Math.floor(score / 100);
    gameSpeed = Math.max(30, 100 - (level - 1) * 5);
}

// Draw everything
function draw() {
    // Background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 50, 100, 0.2)');
    gradient.addColorStop(0.5, 'rgba(0, 20, 60, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 50, 100, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid();

    // Draw food
    drawFood();

    // Draw snake
    drawSnake();

    // Draw border
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = 'transparent';
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('bestScore').textContent = bestScore;
    document.getElementById('level').textContent = level;
}

// Game loop
let lastUpdateTime = 0;

function gameLoop(currentTime) {
    if (currentTime - lastUpdateTime > gameSpeed) {
        if (gameRunning && !gamePaused) {
            updateSnake();
            updateUI();
        }
        lastUpdateTime = currentTime;
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    gameRunning = true;
    gamePaused = false;
    score = 0;
    level = 1;
    gameSpeed = 100;
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    spawnFood();

    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('pauseBtn').classList.remove('hidden');
    document.getElementById('pauseBtn').textContent = '⏸ Pause';

    updateUI();
}

// Pause game
function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.textContent = gamePaused ? '▶ Resume' : '⏸ Pause';
}

// End game
function endGame() {
    gameRunning = false;
    gamePaused = false;

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('snakeBestScore', bestScore);
    }

    document.getElementById('finalScore').textContent = score;
    document.getElementById('bestFinal').textContent = bestScore;
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('restartBtn').focus();
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);

document.getElementById('pauseBtn').addEventListener('click', togglePause);

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('startBtn').classList.remove('hidden');
    startGame();
});

// Initialize
createStarfield();
updateUI();
draw();
requestAnimationFrame(gameLoop);

// Resize canvas if needed
window.addEventListener('resize', () => {
    // Canvas maintains aspect ratio with CSS
});
