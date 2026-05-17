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

// Set canvas size based on viewport
function resizeCanvas() {
    const maxWidth = Math.min(400, window.innerWidth - 40);
    canvas.width = maxWidth;
    canvas.height = maxWidth * 1.5;
}

// Game constants
const ROAD_WIDTH = canvas.width;
const CAR_WIDTH = ROAD_WIDTH / 6;
const CAR_HEIGHT = CAR_WIDTH * 1.5;
const LANE_WIDTH = ROAD_WIDTH / 3;

// Game state
let gameRunning = false;
let score = 0;
let lives = 3;
let speed = 5;
let level = 1;
let obstaclesAvoided = 0;

// Player car
const player = {
    x: ROAD_WIDTH / 2 - CAR_WIDTH / 2,
    y: canvas.height - CAR_HEIGHT - 20,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    lane: 1, // 0 = left, 1 = middle, 2 = right
};

// Obstacles array
let obstacles = [];

// Road offset for animation
let roadOffset = 0;

// Input handling
const keys = {};
let touchStartX = 0;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Touch controls
document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchmove', (e) => {
    if (!gameRunning) return;
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;

    if (Math.abs(diff) > 30) {
        if (diff < 0 && player.lane < 2) {
            player.lane++;
        } else if (diff > 0 && player.lane > 0) {
            player.lane--;
        }
        touchStartX = touchX;
    }
}, false);

// Update player position
function updatePlayer() {
    if (keys['ArrowLeft']) {
        if (player.lane > 0) player.lane--;
    }
    if (keys['ArrowRight']) {
        if (player.lane < 2) player.lane++;
    }

    // Update player x based on lane
    player.x = player.lane * LANE_WIDTH + LANE_WIDTH / 2 - CAR_WIDTH / 2;
}

// Obstacle class
class Obstacle {
    constructor() {
        this.lane = Math.floor(Math.random() * 3);
        this.x = this.lane * LANE_WIDTH + LANE_WIDTH / 2 - CAR_WIDTH / 2;
        this.y = -CAR_HEIGHT - 20;
        this.width = CAR_WIDTH;
        this.height = CAR_HEIGHT;
        this.speed = speed * 1.2;
        this.color = Math.random() > 0.5 ? '#ff007f' : '#ff1493';
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        // Draw car body with neon glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw headlights
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 5, this.y + 5, this.width / 4, this.height / 3);
        ctx.fillRect(this.x + this.width - this.width / 4 - 5, this.y + 5, this.width / 4, this.height / 3);

        // Draw tail lights
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 5, this.y + this.height - this.height / 3 - 5, this.width / 4, this.height / 3);
        ctx.fillRect(this.x + this.width - this.width / 4 - 5, this.y + this.height - this.height / 3 - 5, this.width / 4, this.height / 3);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

    isOffScreen() {
        return this.y > canvas.height;
    }
}

// Spawn obstacles
function spawnObstacle() {
    if (Math.random() < 0.02 + (level * 0.01)) {
        obstacles.push(new Obstacle());
    }
}

// Update obstacles
function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.update();

        // Check collision with player
        if (checkCollision(player, obstacle)) {
            lives--;
            obstacles.splice(index, 1);
            if (lives <= 0) {
                endGame();
            }
        }

        // Remove off-screen obstacles
        if (obstacle.isOffScreen()) {
            obstacles.splice(index, 1);
            score += 10;
            obstaclesAvoided++;
            updateLevel();
        }
    });
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update level based on obstacles avoided
function updateLevel() {
    level = Math.floor(obstaclesAvoided / 5) + 1;
    speed = 5 + (level - 1) * 1.5;
    updateUI();
}

// Draw road
function drawRoad() {
    // Road background
    ctx.fillStyle = '#1a1a4d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Road gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 20, 60, 0.5)');
    gradient.addColorStop(0.5, 'rgba(0, 30, 80, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 20, 60, 0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw road markings with animation
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.setLineDash([30, 20]);
    ctx.lineDashOffset = -roadOffset;
    ctx.lineWidth = 3;

    // Center lines
    ctx.beginPath();
    ctx.moveTo(LANE_WIDTH, 0);
    ctx.lineTo(LANE_WIDTH, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(LANE_WIDTH * 2, 0);
    ctx.lineTo(LANE_WIDTH * 2, canvas.height);
    ctx.stroke();

    // Side borders
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    roadOffset = (roadOffset + speed) % 50;
}

// Draw player car
function drawPlayer() {
    // Main body with glow
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Brighter core
    ctx.shadowBlur = 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(player.x + 2, player.y + 2, player.width - 4, player.height - 4);

    // Headlights
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(player.x + 5, player.y + 5, player.width / 4, player.height / 3);
    ctx.fillRect(player.x + player.width - player.width / 4 - 5, player.y + 5, player.width / 4, player.height / 3);

    // Tail lights
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(player.x + 5, player.y + player.height - player.height / 3 - 5, player.width / 4, player.height / 3);
    ctx.fillRect(player.x + player.width - player.width / 4 - 5, player.y + player.height - player.height / 3 - 5, player.width / 4, player.height / 3);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('speed').textContent = Math.round(speed);
    document.getElementById('lives').textContent = lives;
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    drawRoad();

    // Update and draw obstacles
    updateObstacles();
    obstacles.forEach(obstacle => obstacle.draw());

    // Update player
    updatePlayer();
    drawPlayer();

    // Spawn new obstacles
    spawnObstacle();

    updateUI();
    requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    gameRunning = true;
    score = 0;
    lives = 3;
    speed = 5;
    level = 1;
    obstaclesAvoided = 0;
    obstacles = [];
    roadOffset = 0;
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('startBtn').style.display = 'none';
    updateUI();
    gameLoop();
}

// End game
function endGame() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('restartBtn').focus();
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('startBtn').style.display = 'block';
    startGame();
});

// Initialize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
createStarfield();
updateUI();

// Draw initial state
drawRoad();
drawPlayer();
