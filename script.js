const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const recordText = document.getElementById("record");
const gameOverScreen = document.getElementById("gameOver");
const pauseBtn = document.getElementById("pauseBtn");

const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");
const winSound = document.getElementById("winSound");

const box = 20;

let snake, direction, food, score;
let game, speed, paused = false;

/* ---------- RECORD ---------- */
let record = localStorage.getItem("snakeRecord") || 0;
recordText.textContent = record;

/* ---------- INIT ---------- */
function initGame() {
    snake = [{ x: 200, y: 200 }];
    direction = "RIGHT";
    score = 0;
    speed = 220;
    paused = false;

    scoreText.textContent = score;
    gameOverScreen.style.display = "none";
    pauseBtn.textContent = "⏸️ Pausa";

    food = randomFood();

    clearInterval(game);
    game = setInterval(draw, speed);
}

function randomFood() {
    return {
        x: Math.floor(Math.random() * 19) * box,
        y: Math.floor(Math.random() * 19) * box
    };
}

/* ---------- CONTROLES ---------- */
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") setDirection("LEFT");
    if (e.key === "ArrowUp") setDirection("UP");
    if (e.key === "ArrowRight") setDirection("RIGHT");
    if (e.key === "ArrowDown") setDirection("DOWN");
});

let startX, startY;

canvas.addEventListener("touchstart", e => {
    e.preventDefault(); // evita scroll
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
}, { passive: false });

canvas.addEventListener("touchend", e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    const threshold = 30; // sensibilidad swipe

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > threshold) setDirection("RIGHT");
        if (dx < -threshold) setDirection("LEFT");
    } else {
        if (dy > threshold) setDirection("DOWN");
        if (dy < -threshold) setDirection("UP");
    }
}, { passive: false });

function setDirection(dir) {
    if (paused) return;
    if (dir === "LEFT" && direction !== "RIGHT") direction = dir;
    if (dir === "UP" && direction !== "DOWN") direction = dir;
    if (dir === "RIGHT" && direction !== "LEFT") direction = dir;
    if (dir === "DOWN" && direction !== "UP") direction = dir;
}

/* ---------- PAUSA ---------- */
pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "▶️ Reanudar" : "⏸️ Pausa";
};

/* ---------- GAME LOOP ---------- */
function draw() {
    if (paused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Snake (cuerpo más realista)
    snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? "#0ff" : "#0aa";
        ctx.fillRect(p.x, p.y, box, box);
        ctx.strokeStyle = "#003";
        ctx.strokeRect(p.x, p.y, box, box);
    });

    // Comida
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(food.x + 10, food.y + 10, 8, 0, Math.PI * 2);
    ctx.fill();

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX -= box;
    if (direction === "UP") headY -= box;
    if (direction === "RIGHT") headX += box;
    if (direction === "DOWN") headY += box;

    if (headX === food.x && headY === food.y) {
        score++;
        scoreText.textContent = score;
        eatSound.play();
        if (navigator.vibrate) navigator.vibrate(40);

        food = randomFood();

        if (speed > 80) {
            speed -= 10;
            clearInterval(game);
            game = setInterval(draw, speed);
        }

        if (score == 5) {
            winSound.play();
            window.location.href = "final.html";
        }
    } else {
        snake.pop();
    }

    const newHead = { x: headX, y: headY };

    if (
        headX < 0 || headY < 0 ||
        headX >= canvas.width || headY >= canvas.height ||
        collision(newHead, snake)
    ) {
        endGame();
        return;
    }

    snake.unshift(newHead);
}

function collision(head, body) {
    return body.some(p => p.x === head.x && p.y === head.y);
}

/* ---------- GAME OVER ---------- */
function endGame() {
    clearInterval(game);
    gameOverScreen.style.display = "flex";
    gameOverSound.play();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    if (score > record) {
        record = score;
        localStorage.setItem("snakeRecord", record);
        recordText.textContent = record;
    }
}

function restartGame() {
    initGame();
}

initGame();


