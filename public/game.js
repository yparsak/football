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
let lastSpeedIncrease = Date.now();

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
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
        ctx.fillRect(this.x, this.y, this.width, this.height);
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
            this.vx = Math.abs(this.vx);
        }

        if (this.x + BALL_SIZE / 2 > player2.x &&
            this.x - BALL_SIZE / 2 < player2.x + player2.width &&
            this.y > player2.y &&
            this.y < player2.y + player2.height) {
            this.vx = -Math.abs(this.vx);
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

    // Update
    player1.update();
    player2.update();
    ball.update();

    // Increase speed every 20 seconds
    const now = Date.now();
    if (now - lastSpeedIncrease > 20000) {
        ballSpeedMultiplier *= 1.1;
        lastSpeedIncrease = now;
        console.log('Speed increased! New multiplier:', ballSpeedMultiplier);
    }

    // Draw
    player1.draw();
    player2.draw();
    ball.draw();
    drawScore();

    requestAnimationFrame(gameLoop);
}

gameLoop();
