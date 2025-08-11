const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

const basket = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 40,
    width: 80,
    height: 20,
    speed: 7,
    moveLeft: false,
    moveRight: false
};

let stars = [];
let score = 0;
let gameOver = false;
let animationId;

function drawBasket() {
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
    ctx.strokeStyle = '#bfa100';
    ctx.strokeRect(basket.x, basket.y, basket.width, basket.height);
}

function drawStar(star) {
    ctx.save();
    ctx.translate(star.x, star.y);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        ctx.lineTo(0, star.radius);
        ctx.translate(0, star.radius);
        ctx.rotate((Math.PI * 2) / 10);
        ctx.lineTo(0, -star.radius);
        ctx.translate(0, -star.radius);
        ctx.rotate(-((Math.PI * 6) / 10));
    }
    ctx.closePath();
    ctx.fillStyle = '#fff700';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
}

function spawnStar() {
    const radius = 14 + Math.random() * 6;
    stars.push({
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: -radius,
        radius: radius,
        speed: 2 + Math.random() * 2
    });
}

function update() {
    if (basket.moveLeft) basket.x -= basket.speed;
    if (basket.moveRight) basket.x += basket.speed;
    basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));

    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        star.y += star.speed;
        // Collision detection
        if (
            star.y + star.radius > basket.y &&
            star.x > basket.x &&
            star.x < basket.x + basket.width
        ) {
            stars.splice(i, 1);
            score++;
            scoreDiv.textContent = `Score: ${score}`;
            continue;
        }
        // Remove stars that fall below
        if (star.y - star.radius > canvas.height) {
            gameOver = true;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBasket();
    stars.forEach(drawStar);
}

function gameLoop() {
    if (gameOver) {
        cancelAnimationFrame(animationId);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
        ctx.fillStyle = '#fff';
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 36);
        restartBtn.style.display = 'inline-block';
        return;
    }
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

let starTimer = 0;
function spawnStarsLoop() {
    if (!gameOver) {
        if (starTimer <= 0) {
            spawnStar();
            starTimer = 30 + Math.random() * 30;
        } else {
            starTimer--;
        }
        setTimeout(spawnStarsLoop, 16);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') basket.moveLeft = true;
    if (e.key === 'ArrowRight') basket.moveRight = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') basket.moveLeft = false;
    if (e.key === 'ArrowRight') basket.moveRight = false;
});
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    basket.x = Math.max(0, Math.min(canvas.width - basket.width, mouseX - basket.width / 2));
});

restartBtn.addEventListener('click', () => {
    // Reset game state
    stars = [];
    score = 0;
    gameOver = false;
    basket.x = canvas.width / 2 - basket.width / 2;
    scoreDiv.textContent = 'Score: 0';
    restartBtn.style.display = 'none';
    gameLoop();
    spawnStarsLoop();
});

// Start the game
scoreDiv.textContent = 'Score: 0';
gameLoop();
spawnStarsLoop();
