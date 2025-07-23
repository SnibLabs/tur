const GAME_WIDTH = 480;
const GAME_HEIGHT = 640;

const FOREST_GREENS = [
    "#8cd17d",
    "#6ab97d",
    "#599c4e",
    "#b0e19c",
    "#3e7d48"
];
const FOREST_FLOWERS = [
    "#e4d6f8", // pale purple
    "#f7e9a0", // yellow
    "#f8b5d6", // pink
    "#aef8e1", // teal
    "#fadcda"  // pale coral
];
const GLOW_COLORS = [
    "#d5ffea", "#fff7be", "#e7e2ff", "#ffe6f4"
];
const MUSHROOM_CAPS = [
    "#ee6d84", "#ffc94c", "#9d71e7", "#6ee7b7"
];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

class FairyParticle {
    constructor(x, y) {
        this.x = x + (Math.random() - 0.5) * 26;
        this.y = y + (Math.random() - 0.5) * 26;
        const angle = Math.random() * 2 * Math.PI;
        const speed = 0.5 + Math.random() * 1.4;
        this.vx = Math.cos(angle) * speed * 0.5;
        this.vy = Math.sin(angle) * speed * 0.5 - (0.5 + Math.random() * 0.7);
        this.alpha = 0.7 + Math.random() * 0.5;
        this.radius = 2 + Math.random() * 2.3;
        this.life = 22 + Math.random() * 10;
        this.color = randomFrom(GLOW_COLORS);
        this.age = 0;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.97;
        this.vy *= 0.98;
        this.vy += 0.07; // gentle gravity
        this.alpha -= 0.012 + Math.random() * 0.012;
        this.radius *= 0.992;
        this.age++;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        let grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, Math.max(1.1, this.radius * 1.7));
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.8, this.radius * 1.7), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    isDead() {
        return this.alpha <= 0.01 || this.age > this.life || this.radius <= 0.8;
    }
}

class FairyExplosion {
    constructor(x, y, count = 22) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push(new FairyParticle(x, y));
        }
    }
    update() {
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => !p.isDead());
    }
    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
    isEmpty() {
        return this.particles.length === 0;
    }
}

function drawForestSpirit(ctx, x, y, radius, isBoss = false) {
    ctx.save();
    ctx.translate(x, y);

    let bodyColor = isBoss ? "#c8fcdb" : "#d7f7c2";
    let auraColor = isBoss ? "#c0fbe8" : "#e6ffe7";
    let eyeColor = "#1a4932";
    let blushColor = "#f8b5d6";
    let flowerColor = randomFrom(FOREST_FLOWERS);

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius * (isBoss ? 1.55 : 1.25), 0, Math.PI * 2);
    ctx.shadowColor = auraColor;
    ctx.shadowBlur = isBoss ? 36 : 16;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = auraColor;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.shadowColor = "#7cfcc5";
    ctx.shadowBlur = isBoss ? 18 : 7;
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(-radius * 0.4, radius * 0.3, radius * 0.17, radius * 0.08, 0, 0, Math.PI * 2);
    ctx.ellipse(radius * 0.4, radius * 0.3, radius * 0.17, radius * 0.08, 0, 0, Math.PI * 2);
    ctx.fillStyle = blushColor;
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(-radius * 0.33, -radius * 0.22, radius * 0.11, 0, Math.PI * 2);
    ctx.arc(radius * 0.33, -radius * 0.22, radius * 0.11, 0, Math.PI * 2);
    ctx.fillStyle = eyeColor;
    ctx.globalAlpha = 0.92;
    ctx.shadowBlur = 0;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#2d5e3b";
    ctx.lineWidth = Math.max(1, radius * 0.08);
    ctx.arc(0, radius * 0.13, radius * 0.19, 0.18 * Math.PI, 0.82 * Math.PI, false);
    ctx.stroke();
    ctx.restore();

    for (let side of [-1, 1]) {
        ctx.save();
        ctx.rotate(side * 0.3);
        ctx.beginPath();
        ctx.moveTo(side * radius * 0.7, -radius * 0.7);
        ctx.quadraticCurveTo(
            side * radius * 1.1, -radius * 1.1,
            side * radius * 0.3, -radius * 1.25
        );
        ctx.quadraticCurveTo(
            side * radius * 0.6, -radius * 1.05,
            side * radius * 0.7, -radius * 0.7
        );
        ctx.closePath();
        ctx.fillStyle = randomFrom(FOREST_GREENS);
        ctx.globalAlpha = 0.82;
        ctx.shadowColor = "#bfffad";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
    }

    ctx.save();
    let flowerCount = isBoss ? 5 : 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < flowerCount; i++) {
        let ang = -Math.PI / 6 + (i * Math.PI / (isBoss ? 2.6 : 2.0));
        let fx = Math.cos(ang) * radius * 0.68;
        let fy = Math.sin(ang) * radius * 0.68 - radius * 0.46;
        ctx.beginPath();
        ctx.arc(fx, fy, radius * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = randomFrom(FOREST_FLOWERS);
        ctx.globalAlpha = 0.78 + Math.random() * 0.17;
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 3;
        ctx.fill();
    }
    ctx.restore();

    if (isBoss) {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.translate(radius * 0.8, radius * 0.6);
        ctx.rotate(0.2);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
        ctx.fillStyle = "#fffbe7";
        ctx.shadowColor = "#e7fff6";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
    }

    ctx.restore();
}

function drawMushroomPlayer(ctx, x, y, radius) {
    ctx.save();
    ctx.translate(x, y);

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.35, radius * 1.04, radius * 0.64, 0, Math.PI * 1, Math.PI * 2, false);
    let capColor = randomFrom(MUSHROOM_CAPS);
    ctx.fillStyle = capColor;
    ctx.shadowColor = "#fff6f9";
    ctx.shadowBlur = 12;
    ctx.fill();

    for (let i = 0; i < 4; i++) {
        let cx = Math.cos((i + 0.5) * Math.PI / 2) * radius * 0.4 + (Math.random() - 0.5) * 6;
        let cy = -radius * 0.5 + Math.sin((i + 0.5) * Math.PI / 2) * radius * 0.22 + (Math.random() - 0.5) * 4;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.17, 0, Math.PI * 2);
        ctx.fillStyle = "#fffbe7";
        ctx.globalAlpha = 0.93;
        ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.28, radius * 0.55, radius * 0.74, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#fffbe7";
    ctx.shadowColor = "#b2e4c5";
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 0.95;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(-radius * 0.22, radius * 0.1, radius * 0.1, 0, Math.PI * 2);
    ctx.arc(radius * 0.22, radius * 0.1, radius * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = "#37291e";
    ctx.globalAlpha = 0.92;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "#6a4733";
    ctx.lineWidth = Math.max(1, radius * 0.08);
    ctx.arc(0, radius * 0.22, radius * 0.18, 0.18 * Math.PI, 0.82 * Math.PI, false);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
}

class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = (type === 'boss') ? 38 : 18;
        this.hp = (type === 'boss') ? 60 : 1;
        this.alive = true;

        this.color = (type === 'boss') ? '#c8fcdb' : '#d7f7c2';
        this.fairyColor = (type === 'boss') ? '#bfffad' : '#e6ffe7';
    }
    update() {
        this.y += (this.type === 'boss') ? 0.85 : 2.15;
    }
    draw(ctx) {
        drawForestSpirit(ctx, this.x, this.y, this.radius, this.type === 'boss');
    }
    hit(damage = 1) {
        this.hp -= damage;
        if (this.hp <= 0) this.alive = false;
    }
    isDead() {
        return !this.alive;
    }
}

class Game {
    constructor(canvas, showGameOver) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.showGameOver = showGameOver;
        this.running = true;

        this.enemies = [];
        this.playerBullets = [];
        this.fairyExplosions = [];

        this.score = 0;
        this.bossDefeated = false;

        this.keys = {};
        this._setupInput();

        this.enemySpawnTimer = 0;
        this.bossSpawned = false;

        this.player = {
            x: GAME_WIDTH / 2,
            y: GAME_HEIGHT - 50,
            radius: 18,
        };

        this._animationFrame = null;
        this._loop = this._loop.bind(this);
    }

    destroy() {
        this.running = false;
        if (this._animationFrame) cancelAnimationFrame(this._animationFrame);
    }

    _setupInput() {
        this.keydownHandler = e => { this.keys[e.code] = true; };
        this.keyupHandler = e => { this.keys[e.code] = false; };
        this.canvas.addEventListener('keydown', this.keydownHandler);
        this.canvas.addEventListener('keyup', this.keyupHandler);
    }

    _removeInput() {
        this.canvas.removeEventListener('keydown', this.keydownHandler);
        this.canvas.removeEventListener('keyup', this.keyupHandler);
    }

    _spawnEnemy() {
        if (!this.bossSpawned && this.score >= 200 && !this.bossDefeated) {
            this.enemies.push(new Enemy(GAME_WIDTH / 2, 60, 'boss'));
            this.bossSpawned = true;
            return;
        }

        const x = 30 + Math.random() * (GAME_WIDTH - 60);
        this.enemies.push(new Enemy(x, -20));
    }

    _spawnPlayerBullet() {
        this.playerBullets.push({
            x: this.player.x,
            y: this.player.y - this.player.radius,
            vy: -7,
            radius: 4,
            color: "#bfffad"
        });
    }

    _updateEntities() {
        for (let e of this.enemies) e.update();

        for (let b of this.playerBullets) b.y += b.vy;

        for (let fe of this.fairyExplosions) fe.update();
        this.fairyExplosions = this.fairyExplosions.filter(fe => !fe.isEmpty());
    }

    _handleCollisions() {
        for (let bi = this.playerBullets.length - 1; bi >= 0; bi--) {
            const b = this.playerBullets[bi];
            for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
                const e = this.enemies[ei];
                const dx = b.x - e.x;
                const dy = b.y - e.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < e.radius + b.radius) {
                    e.hit(1);
                    if (e.isDead()) {
                        const fairyCount = e.type === 'boss' ? 70 : (16 + Math.floor(Math.random() * 8));
                        this.fairyExplosions.push(
                            new FairyExplosion(e.x, e.y, fairyCount)
                        );
                        if (e.type === 'boss') this.bossDefeated = true;
                        this.score += (e.type === 'boss') ? 100 : 10;
                        this.enemies.splice(ei, 1);
                    } else {
                        this.fairyExplosions.push(
                            new FairyExplosion(b.x, b.y, 6 + Math.floor(Math.random() * 4))
                        );
                    }
                    this.playerBullets.splice(bi, 1);
                    break;
                }
            }
        }
    }

    _drawEntities() {
        for (let e of this.enemies) e.draw(this.ctx);

        for (let b of this.playerBullets) {
            this.ctx.save();
            let grad = this.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius * 2.4);
            grad.addColorStop(0, "#fffbe7");
            grad.addColorStop(0.55, b.color || "#bfffad");
            grad.addColorStop(1, "transparent");
            this.ctx.globalAlpha = 1;
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius * 2.4, 0, Math.PI * 2);
            this.ctx.fillStyle = grad;
            this.ctx.shadowColor = "#fffbe7";
            this.ctx.shadowBlur = 6;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            this.ctx.restore();
        }

        for (let fe of this.fairyExplosions) fe.draw(this.ctx);

        drawMushroomPlayer(this.ctx, this.player.x, this.player.y, this.player.radius);
    }

    _drawUI() {
        this.ctx.save();
        this.ctx.font = 'bold 22px "Comic Sans MS", "Segoe Print", cursive, Arial';
        this.ctx.fillStyle = '#c1ffd7';
        this.ctx.shadowColor = '#23e083';
        this.ctx.shadowBlur = 4;
        this.ctx.fillText(`Score: ${this.score}`, 18, 34);
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }

    _drawBackground() {

        let g = this.ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        g.addColorStop(0.0, "#eafbe1");
        g.addColorStop(0.2, "#c3efb2");
        g.addColorStop(0.6, "#8cd17d");
        g.addColorStop(1.0, "#4b794d");
        this.ctx.fillStyle = g;
        this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        for (let i = 0; i < 8; i++) {
            let fx = Math.random() * GAME_WIDTH;
            let fy = Math.random() * (GAME_HEIGHT * 0.7);
            let rad = 16 + Math.random() * 24;
            this.ctx.save();
            let fg = this.ctx.createRadialGradient(fx, fy, 0, fx, fy, rad);
            fg.addColorStop(0, randomFrom(GLOW_COLORS));
            fg.addColorStop(1, "transparent");
            this.ctx.globalAlpha = 0.13 + Math.random() * 0.1;
            this.ctx.beginPath();
            this.ctx.arc(fx, fy, rad, 0, Math.PI * 2);
            this.ctx.fillStyle = fg;
            this.ctx.fill();
            this.ctx.restore();
        }

        for (let i = 0; i < 4; i++) {
            let tx = 30 + Math.random() * (GAME_WIDTH - 60);
            let th = 120 + Math.random() * 70;
            let tw = 22 + Math.random() * 22;
            this.ctx.save();
            this.ctx.globalAlpha = 0.22 + Math.random() * 0.11;
            this.ctx.fillStyle = "#284f34";
            this.ctx.fillRect(tx, GAME_HEIGHT - th, tw, th);

            this.ctx.beginPath();
            this.ctx.arc(tx + tw / 2, GAME_HEIGHT - th, tw * 1.6, 0, Math.PI * 2);
            this.ctx.arc(tx + tw / 2 - tw / 2, GAME_HEIGHT - th + 10, tw, 0, Math.PI * 2);
            this.ctx.arc(tx + tw / 2 + tw / 2, GAME_HEIGHT - th + 10, tw, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    _loop() {
        if (!this.running) {
            this._removeInput();
            return;
        }

        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.x -= 5.4;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.x += 5.4;
        }
        if (this.keys['Space']) {
            if (!this._spacePrev) {
                this._spawnPlayerBullet();
                this._spacePrev = true;
            }
        } else {
            this._spacePrev = false;
        }

        this.player.x = Math.max(this.player.radius, Math.min(GAME_WIDTH - this.player.radius, this.player.x));

        this.enemySpawnTimer--;
        if (this.enemySpawnTimer <= 0) {
            this._spawnEnemy();
            this.enemySpawnTimer = 40 + Math.floor(Math.random() * 20);
        }

        this._updateEntities();

        this._handleCollisions();

        this.playerBullets = this.playerBullets.filter(b => b.y + b.radius > 0);

        this.enemies = this.enemies.filter(e => e.y - e.radius < GAME_HEIGHT && !e.isDead());

        this._drawBackground();
        this._drawEntities();
        this._drawUI();

        if (false /* player dead condition */) {
            this.running = false;
            setTimeout(() => {
                this.showGameOver(this.score, this.bossDefeated);
            }, 500);
            return;
        }

        this._animationFrame = requestAnimationFrame(this._loop);
    }

    render() {
        this._animationFrame = requestAnimationFrame(this._loop);
    }
}

window.addEventListener('DOMContentLoaded', initGame);

function initGame() {
    const container = document.getElementById('gameContainer');
    container.style.position = 'relative';

    const canvas = document.createElement('canvas');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    canvas.tabIndex = 1;
    container.appendChild(canvas);

    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';
    menuOverlay.innerHTML = `
        <div class="menu-title">🍄 Magical Forest Shooter</div>
        <div class="menu-desc">
            Arrow keys or A/D to move, Space to shoot.<br>
            Defend the magical forest!<br>
            <span style="color:#bfffad">Press <b>R</b> for 1-hit shield (5s cooldown)</span>
            <br>
            <span style="color:#aef8e1">Collect mystical drops for: <b>Fairy Burst</b>, <b>Shroom Bombs</b>, <b>Nature Ray</b>, <b>Seed Storm</b>!</span>
        </div>
        <button id="startBtn">Begin!</button>
    `;
    container.appendChild(menuOverlay);

    let game = null;

    document.getElementById('startBtn').onclick = function () {
        menuOverlay.style.display = 'none';
        if (game) game.destroy();
        game = new Game(canvas, showGameOver);
        game.render();
        canvas.focus();
    };

    function showGameOver(score, bossDefeated) {
        const overlay = document.createElement('div');
        overlay.className = 'gameover-overlay';
        overlay.innerHTML = `
            <div class="menu-title">Forest Spirits Rest</div>
            <div class="score-label">Score: ${score}${bossDefeated ? ' <span style="color:#34d39b;">(Forest Guardian Saved!)</span>' : ''}</div>
            <button id="restartBtn">Restart</button>
        `;
        container.appendChild(overlay);

        document.getElementById('restartBtn').onclick = function () {
            overlay.remove();
            if (game) game.destroy();
            game = new Game(canvas, showGameOver);
            game.render();
            canvas.focus();
        };
    }
}