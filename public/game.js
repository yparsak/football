const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const GOAL_SIZE = 150;
const PLAYER_SPEED = 5;
const INITIAL_BALL_SPEED = 2;

let leftScore = 0;
let rightScore = 0;
let ballSpeedMultiplier = 1.0;
let gameState = 'START';

const keys = {};

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = true;

    if (key === 'enter') {
        if (gameState === 'START' || gameState === 'PAUSED') {
            gameState = 'PLAYING';
        }
    } else if (key === 'escape') {
        if (gameState === 'PLAYING') {
            gameState = 'PAUSED';
        } else if (gameState === 'PAUSED') {
            gameState = 'PLAYING';
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

class Player {
    constructor(x, y, upKey, downKey) {
        this.x = x;
        this.y = y;
        this.width = PADDLE_WIDTH;
        this.height = PADDLE_HEIGHT;
        this.upKey = upKey;
        this.downKey = downKey;
    }

    draw() {
        ctx.fillStyle = 'white';

        // Draw curved paddle
        ctx.beginPath();
        const radius = 5; // Radius for curved corners

        // Top edge with slight curve
        ctx.moveTo(this.x + radius, this.y);
        ctx.quadraticCurveTo(this.x + this.width / 2, this.y - 5, this.x + this.width - radius, this.y);

        // Right edge
        ctx.lineTo(this.x + this.width, this.y + radius);
        ctx.lineTo(this.x + this.width, this.y + this.height - radius);

        // Bottom edge with slight curve
        ctx.lineTo(this.x + this.width - radius, this.y + this.height);
        ctx.quadraticCurveTo(this.x + this.width / 2, this.y + this.height + 5, this.x + radius, this.y + this.height);

        // Left edge
        ctx.lineTo(this.x, this.y + this.height - radius);
        ctx.lineTo(this.x, this.y + radius);

        ctx.closePath();
        ctx.fill();
    }

    update() {
        if (keys[this.upKey]) {
            this.y -= PLAYER_SPEED;
        }
        if (keys[this.downKey]) {
            this.y += PLAYER_SPEED;
        }

        // Keep player within canvas bounds
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
    }
}

const player1 = new Player(20, canvas.height / 2 - PADDLE_HEIGHT / 2, 'q', 'a');
const player2 = new Player(canvas.width - 30, canvas.height / 2 - PADDLE_HEIGHT / 2, 'p', 'l');

class Ball {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        const angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // -45 to 45 degrees
        const direction = Math.random() < 0.5 ? 1 : -1;
        this.vx = direction * INITIAL_BALL_SPEED * Math.cos(angle);
        this.vy = INITIAL_BALL_SPEED * Math.sin(angle);
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, BALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.vx * ballSpeedMultiplier;
        this.y += this.vy * ballSpeedMultiplier;

        // Bounce off top and bottom
        if (this.y - BALL_SIZE / 2 < 0 || this.y + BALL_SIZE / 2 > canvas.height) {
            this.vy = -this.vy;
        }

        // Check for goals
        if (this.x < 0) {
            if (this.y > (canvas.height - GOAL_SIZE) / 2 && this.y < (canvas.height + GOAL_SIZE) / 2) {
                rightScore++;
                this.reset();
            } else {
                this.vx = -this.vx;
                this.x = 0 + BALL_SIZE / 2;
            }
        }

        if (this.x > canvas.width) {
            if (this.y > (canvas.height - GOAL_SIZE) / 2 && this.y < (canvas.height + GOAL_SIZE) / 2) {
                leftScore++;
                this.reset();
            } else {
                this.vx = -this.vx;
                this.x = canvas.width - BALL_SIZE / 2;
            }
        }

        // Bounce off players
        if (this.x - BALL_SIZE / 2 < player1.x + player1.width &&
            this.x + BALL_SIZE / 2 > player1.x &&
            this.y > player1.y &&
            this.y < player1.y + player1.height) {

            ballSpeedMultiplier *= 1.002;
            this.vx = Math.abs(this.vx);

            const relativeHit = (this.y - (player1.y + player1.height / 2)) / (player1.height / 2);
            const angleShift = relativeHit * (20 * Math.PI / 180);

            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const currentAngle = Math.atan2(this.vy, this.vx);
            const newAngle = currentAngle + angleShift;

            this.vx = speed * Math.cos(newAngle);
            this.vy = speed * Math.sin(newAngle);

            // Ensure vx stays positive to prevent getting stuck
            if (this.vx < 0.5) this.vx = 0.5;
            this.x = player1.x + player1.width + BALL_SIZE / 2;
        }

        if (this.x + BALL_SIZE / 2 > player2.x &&
            this.x - BALL_SIZE / 2 < player2.x + player2.width &&
            this.y > player2.y &&
            this.y < player2.y + player2.height) {

            ballSpeedMultiplier *= 1.002;
            this.vx = -Math.abs(this.vx);

            const relativeHit = (this.y - (player2.y + player2.height / 2)) / (player2.height / 2);
            const angleShift = relativeHit * (20 * Math.PI / 180);

            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const currentAngle = Math.atan2(this.vy, this.vx);
            const newAngle = currentAngle - angleShift;

            this.vx = speed * Math.cos(newAngle);
            this.vy = speed * Math.sin(newAngle);

            // Ensure vx stays negative to prevent getting stuck
            if (this.vx > -0.5) this.vx = -0.5;
            this.x = player2.x - BALL_SIZE / 2;
        }
    }
}

const ball = new Ball();

function drawPitch() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;

    // Center line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Goals
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, (canvas.height - GOAL_SIZE) / 2, 10, GOAL_SIZE);
    ctx.fillRect(canvas.width - 10, (canvas.height - GOAL_SIZE) / 2, 10, GOAL_SIZE);
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${leftScore} - ${rightScore}`, canvas.width / 2, 30);
}

function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#1a4a1a'; // Green pitch
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawPitch();

    if (gameState === 'PLAYING') {
        // Update
        player1.update();
        player2.update();
        ball.update();
    }

    // Draw
    player1.draw();
    player2.draw();
    ball.draw();
    drawScore();

    if (gameState === 'START') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press Enter to Start', canvas.width / 2, canvas.height / 2);
    } else if (gameState === 'PAUSED') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('Press Enter or ESC to Resume', canvas.width / 2, canvas.height / 2 + 50);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
