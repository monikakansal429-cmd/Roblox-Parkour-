// ==========================================
// ULTIMATE PARKOUR
// Vanilla JavaScript Parkour Game
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W, H;

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ==========================================
// GAME VARIABLES
// ==========================================

let currentLevel = 1;
let gameRunning = false;
let paused = false;

let cameraX = 0;
let levelLength = 6000;

let coins = 0;
let score = 0;
let lives = 3;
let deaths = 0;
let startTime = 0;

let checkpoint = {
  x: 100,
  y: 300
};

let keys = {};

let platforms = [];
let obstacles = [];
let coinObjects = [];
let particles = [];

// ==========================================
// PLAYER
// ==========================================

const player = {
  x: 100,
  y: 300,

  width: 35,
  height: 55,

  vx: 0,
  vy: 0,

  speed: 0.7,
  maxSpeed: 7,

  jumpPower: 14,

  grounded: false,
  jumps: 0,

  sprint: false
};

// ==========================================
// KEYBOARD
// ==========================================

document.addEventListener("keydown", function(e) {

  keys[e.key.toLowerCase()] = true;

  if (
    e.key === " " ||
    e.key === "ArrowUp" ||
    e.key.toLowerCase() === "w"
  ) {
    jump();
    e.preventDefault();
  }

  if (e.key.toLowerCase() === "p") {
    paused = !paused;
  }

  if (e.key.toLowerCase() === "r") {
    restartCurrentLevel();
  }
});

document.addEventListener("keyup", function(e) {
  keys[e.key.toLowerCase()] = false;
});

// ==========================================
// MOBILE CONTROLS
// ==========================================

function mobileButton(id, key) {

  const btn = document.getElementById(id);

  btn.addEventListener("touchstart", e => {
    e.preventDefault();
    keys[key] = true;
  });

  btn.addEventListener("touchend", e => {
    e.preventDefault();
    keys[key] = false;
  });
}

mobileButton("leftBtn", "arrowleft");
mobileButton("rightBtn", "arrowright");
mobileButton("sprintBtn", "shift");

document.getElementById("jumpBtn").addEventListener("touchstart", e => {
  e.preventDefault();
  jump();
});

// ==========================================
// JUMP
// ==========================================

function jump() {

  if (!gameRunning || paused) return;

  if (player.grounded) {

    player.vy = -player.jumpPower;
    player.grounded = false;
    player.jumps = 1;

    createParticles(
      player.x + player.width / 2,
      player.y + player.height,
      8
    );

    soundJump();

  } else if (player.jumps < 2) {

    player.vy = -player.jumpPower * 0.9;
    player.jumps++;

    createParticles(
      player.x + player.width / 2,
      player.y + player.height,
      6
    );

    soundJump();
  }
}

// ==========================================
// LEVEL DATA
// ==========================================

function createLevel(level) {

  platforms = [];
  obstacles = [];
  coinObjects = [];
  particles = [];

  cameraX = 0;

  player.x = 100;
  player.y = 300;
  player.vx = 0;
  player.vy = 0;

  checkpoint.x = 100;
  checkpoint.y = 300;

  levelLength = level === 1 ? 6000 :
                level === 2 ? 7500 : 9500;

  // Starting platform

  addPlatform(0, 500, 800, 80);

  if (level === 1) {

    easyLevel();

  } else if (level === 2) {

    hardLevel();

  } else {

    impossibleLevel();

  }

  // Finish platform

  addPlatform(levelLength - 500, 450, 600, 100);

  obstacles.push({
    type: "finish",
    x: levelLength - 350,
    y: 350,
    width: 30,
    height: 100
  });
}

// ==========================================
// EASY LEVEL
// ==========================================

function easyLevel() {

  let x = 900;

  for (let i = 0; i < 18; i++) {

    let width = 250 + Math.random() * 120;
    let y = 350 + Math.random() * 100;

    addPlatform(x, y, width, 35);

    addCoin(x + width / 2, y - 50);

    if (i % 4 === 2) {
      addSpike(x + width / 2, y - 25, 40, 25);
    }

    if (i === 5 || i === 11) {
      checkpoint.x = x;
      checkpoint.y = y - 100;
    }

    x += width + 130;
  }
}

// ==========================================
// HARD LEVEL
// ==========================================

function hardLevel() {

  let x = 850;

  for (let i = 0; i < 22; i++) {

    let width = 150 + Math.random() * 100;
    let y = 300 + Math.random() * 180;

    addPlatform(x, y, width, 30);

    addCoin(x + width / 2, y - 55);

    if (i % 3 === 0) {
      addSpike(x + width / 2, y - 25, 45, 25);
    }

    if (i % 5 === 0) {
      addMovingPlatform(
        x + 30,
        y - 120,
        100,
        25
      );
    }

    if (i % 6 === 0) {
      addBlade(x + width / 2, y - 80);
    }

    x += width + 170;
  }
}

// ==========================================
// IMPOSSIBLE LEVEL
// ==========================================

function impossibleLevel() {

  let x = 850;

  for (let i = 0; i < 30; i++) {

    let width = 80 + Math.random() * 90;
    let y = 250 + Math.random() * 220;

    addPlatform(x, y, width, 25);

    if (i % 2 === 0) {
      addSpike(x + width / 2, y - 25, 40, 25);
    }

    if (i % 3 === 0) {
      addBlade(x + width / 2, y - 70);
    }

    if (i % 4 === 0) {
      addMovingPlatform(
        x,
        y - 130,
        80,
        20
      );
    }

    if (i % 5 === 0) {
      addLaser(x + width / 2, y - 180);
    }

    if (i % 6 === 0) {
      addCoin(x + width / 2, y - 70);
    }

    x += width + 230;
  }
}

// ==========================================
// OBJECT CREATION
// ==========================================

function addPlatform(x, y, width, height) {

  platforms.push({
    x,
    y,
    width,
    height,
    moving: false
  });
}

function addMovingPlatform(x, y, width, height) {

  platforms.push({
    x,
    y,
    width,
    height,
    moving: true,
    startX: x,
    offset: Math.random() * 100,
    speed: 0.02 + Math.random() * 0.02
  });
}

function addSpike(x, y, width, height) {

  obstacles.push({
    type: "spike",
    x,
    y,
    width,
    height
  });
}

function addBlade(x, y) {

  obstacles.push({
    type: "blade",
    x,
    y,
    width: 50,
    height: 50,
    angle: 0
  });
}

function addLaser(x, y) {

  obstacles.push({
    type: "laser",
    x,
    y,
    width: 10,
    height: 180
  });
}

function addCoin(x, y) {

  coinObjects.push({
    x,
    y,
    radius: 10,
    collected: false
  });
}

// ==========================================
// UPDATE
// ==========================================

function update() {

  if (!gameRunning || paused) return;

  // Movement

  if (keys["arrowleft"] || keys["a"]) {

    player.vx -= player.speed;

  }

  if (keys["arrowright"] || keys["d"]) {

    player.vx += player.speed;

  }

  player.sprint = keys["shift"];

  let maxSpeed = player.sprint ? 11 : player.maxSpeed;

  player.vx *= 0.88;

  player.vx = Math.max(
    -maxSpeed,
    Math.min(maxSpeed, player.vx)
  );

  // Gravity

  player.vy += 0.65;

  if (player.vy > 18) {
    player.vy = 18;
  }

  player.x += player.vx;
  player.y += player.vy;

  player.grounded = false;

  // Moving platforms

  for (let p of platforms) {

    if (p.moving) {

      p.x =
        p.startX +
        Math.sin(Date.now() * p.speed + p.offset) * 100;

    }
  }

  // Platform collision

  for (let p of platforms) {

    if (
      player.x + player.width > p.x &&
      player.x < p.x + p.width &&
      player.y + player.height >= p.y &&
      player.y + player.height <= p.y + 30 &&
      player.vy >= 0
    ) {

      player.y = p.y - player.height;

      player.vy = 0;

      player.grounded = true;

      player.jumps = 0;
    }
  }

  // Coins

  for (let coin of coinObjects) {

    if (coin.collected) continue;

    let dx =
      player.x + player.width / 2 - coin.x;

    let dy =
      player.y + player.height / 2 - coin.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 35) {

      coin.collected = true;

      coins++;

      score += 100;

      createParticles(
        coin.x,
        coin.y,
        15
      );

      soundCoin();
    }
  }

  // Obstacles

  for (let o of obstacles) {

    if (o.type === "blade") {
      o.angle += 0.15;
    }

    if (o.type === "finish") {

      if (
        player.x + player.width > o.x &&
        player.x < o.x + o.width &&
        player.y < o.y + o.height
      ) {

        completeLevel();
      }
    }

    else if (collision(player, o)) {

      die();

    }
  }

  // Falling

  if (player.y > H + 300) {

    die();

  }

  // Camera

  let targetCamera =
    player.x - W * 0.35;

  cameraX +=
    (targetCamera - cameraX) * 0.08;

  if (cameraX < 0) cameraX = 0;

  if (cameraX > levelLength - W) {
    cameraX = levelLength - W;
  }

  // Particles

  updateParticles();

  updateHUD();
}

// ==========================================
// COLLISION
// ==========================================

function collision(a, b) {

  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// ==========================================
// DEATH
// ==========================================

function die() {

  if (!gameRunning) return;

  deaths++;

  lives--;

  soundDeath();

  createParticles(
    player.x + player.width / 2,
    player.y + player.height / 2,
    30
  );

  if (lives <= 0) {

    gameOver();

    return;
  }

  setTimeout(() => {

    player.x = checkpoint.x;
    player.y = checkpoint.y;

    player.vx = 0;
    player.vy = 0;

  }, 300);
}

// ==========================================
// DRAW
// ==========================================

function draw() {

  ctx.clearRect(0, 0, W, H);

  drawBackground();

  ctx.save();

  ctx.translate(-cameraX, 0);

  drawPlatforms();
  drawCoins();
  drawObstacles();
  drawPlayer();
  drawParticles();

  ctx.restore();
}

// ==========================================
// BACKGROUND
// ==========================================

function drawBackground() {

  let gradient =
    ctx.createLinearGradient(0, 0, 0, H);

  if (currentLevel === 1) {

    gradient.addColorStop(0, "#0a4d68");
    gradient.addColorStop(1, "#06121d");

  } else if (currentLevel === 2) {

    gradient.addColorStop(0, "#3d2630");
    gradient.addColorStop(1, "#09080d");

  } else {

    gradient.addColorStop(0, "#16002d");
    gradient.addColorStop(1, "#020006");
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Parallax buildings

  ctx.fillStyle = "rgba(0,0,0,0.35)";

  let offset =
    (cameraX * 0.2) % 250;

  for (
    let x = -offset;
    x < W + 300;
    x += 180
  ) {

    let height =
      150 + ((x * 7) % 150);

    ctx.fillRect(
      x,
      H - height,
      130,
      height
    );
  }
}

// ==========================================
// DRAW PLATFORMS
// ==========================================

function drawPlatforms() {

  for (let p of platforms) {

    ctx.fillStyle =
      currentLevel === 3
        ? "#401d63"
        : "#176b86";

    ctx.fillRect(
      p.x,
      p.y,
      p.width,
      p.height
    );

    ctx.strokeStyle = "#00eaff";
    ctx.lineWidth = 2;

    ctx.strokeRect(
      p.x,
      p.y,
      p.width,
      p.height
    );
  }
}

// ==========================================
// DRAW PLAYER
// ==========================================

function drawPlayer() {

  ctx.save();

  ctx.translate(
    player.x,
    player.y
  );

  // Glow

  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00eaff";

  ctx.fillStyle = "#00eaff";

  ctx.fillRect(
    5,
    15,
    25,
    40
  );

  // Head

  ctx.fillStyle = "#ffffff";

  ctx.fillRect(
    8,
    0,
    19,
    18
  );

  // Eye

  ctx.fillStyle = "#111";

  ctx.fillRect(
    20,
    6,
    4,
    4
  );

  // Legs

  ctx.fillStyle = "#0077ff";

  ctx.fillRect(
    7,
    52,
    8,
    12
  );

  ctx.fillRect(
    21,
    52,
    8,
    12
  );

  ctx.restore();
}

// ==========================================
// DRAW COINS
// ==========================================

function drawCoins() {

  for (let coin of coinObjects) {

    if (coin.collected) continue;

    ctx.beginPath();

    ctx.arc(
      coin.x,
      coin.y,
      coin.radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = "#ffd700";

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ffd700";

    ctx.fill();

    ctx.shadowBlur = 0;
  }
}

// ==========================================
// DRAW OBSTACLES
// ==========================================

function drawObstacles() {

  for (let o of obstacles) {

    if (o.type === "spike") {

      ctx.fillStyle = "#ff1744";

      ctx.beginPath();

      ctx.moveTo(
        o.x,
        o.y + o.height
      );

      ctx.lineTo(
        o.x + o.width / 2,
        o.y
      );

      ctx.lineTo(
        o.x + o.width,
        o.y + o.height
      );

      ctx.closePath();

      ctx.fill();
    }

    if (o.type === "blade") {

      ctx.save();

      ctx.translate(
        o.x + o.width / 2,
        o.y + o.height / 2
      );

      ctx.rotate(o.angle);

      ctx.fillStyle = "#ff004c";

      ctx.fillRect(
        -30,
        -5,
        60,
        10
      );

      ctx.fillRect(
        -5,
        -30,
        10,
        60
      );

      ctx.restore();
    }

    if (o.type === "laser") {

      ctx.fillStyle = "#ff003c";

      ctx.shadowBlur = 20;
      ctx.shadowColor = "#ff003c";

      ctx.fillRect(
        o.x,
        o.y,
        o.width,
        o.height
      );

      ctx.shadowBlur = 0;
    }

    if (o.type === "finish") {

      ctx.fillStyle = "#ffffff";

      ctx.fillRect(
        o.x,
        o.y,
        5,
        o.height
      );

      ctx.fillStyle = "#00ff88";

      ctx.fillRect(
        o.x + 5,
        o.y,
        60,
        35
      );

      ctx.fillStyle = "#001";

      ctx.font = "bold 16px Arial";

      ctx.fillText(
        "FINISH",
        o.x + 10,
        o.y + 23
      );
    }
  }
}

// ==========================================
// PARTICLES
// ==========================================

function createParticles(x, y, amount) {

  for (let i = 0; i < amount; i++) {

    particles.push({
      x,
      y,

      vx:
        (Math.random() - 0.5) * 7,

      vy:
        (Math.random() - 0.5) * 7,

      life: 40 + Math.random() * 30
    });
  }
}

function updateParticles() {

  for (let p of particles) {

    p.x += p.vx;
    p.y += p.vy;

    p.vy += 0.2;

    p.life--;
  }

  particles =
    particles.filter(p => p.life > 0);
}

function drawParticles() {

  for (let p of particles) {

    ctx.fillStyle =
      `rgba(0,234,255,${p.life / 70})`;

    ctx.fillRect(
      p.x,
      p.y,
      5,
      5
    );
  }
}

// ==========================================
// HUD
// ==========================================

function updateHUD() {

  document.getElementById("levelText").textContent =
    currentLevel;

  document.getElementById("lives").textContent =
    lives;

  document.getElementById("coins").textContent =
    coins;

  document.getElementById("score").textContent =
    score;

  let time =
    Math.floor(
      (Date.now() - startTime) / 1000
    );

  document.getElementById("timer").textContent =
    time;
}

// ==========================================
// LEVEL START
// ==========================================

function startLevel(level) {

  currentLevel = level;

  document.getElementById("menu")
    .classList.add("hidden");

  document.getElementById("levels")
    .classList.add("hidden");

  document.getElementById("howto")
    .classList.add("hidden");

  document.getElementById("message")
    .classList.add("hidden");

  document.getElementById("game")
    .classList.remove("hidden");

  coins = 0;
  score = 0;
  lives = 3;
  deaths = 0;

  createLevel(level);

  startTime = Date.now();

  gameRunning = true;
  paused = false;
}

// ==========================================
// LEVEL COMPLETE
// ==========================================

function completeLevel() {

  if (!gameRunning) return;

  gameRunning = false;

  let time =
    Math.floor(
      (Date.now() - startTime) / 1000
    );

  score +=
    Math.max(
      0,
      1000 - time * 2
    );

  score += lives * 200;

  document.getElementById("messageTitle")
    .textContent =
    "🏆 LEVEL COMPLETE!";

  document.getElementById("messageText")
    .textContent =
    `Time: ${time}s | Coins: ${coins} | Score: ${score}`;

  document.getElementById("nextButton")
    .style.display =
    currentLevel < 3
      ? "block"
      : "none";

  document.getElementById("message")
    .classList.remove("hidden");

  soundWin();
}

// ==========================================
// GAME OVER
// ==========================================

function gameOver() {

  gameRunning = false;

  document.getElementById("messageTitle")
    .textContent =
    "💀 GAME OVER";

  document.getElementById("messageText")
    .textContent =
    "You ran out of lives!";

  document.getElementById("nextButton")
    .style.display =
    "none";

  document.getElementById("message")
    .classList.remove("hidden");
}

// ==========================================
// NAVIGATION
// ==========================================

function showLevels() {

  gameRunning = false;

  document.querySelectorAll(".screen")
    .forEach(el =>
      el.classList.add("hidden")
    );

  document.getElementById("levels")
    .classList.remove("hidden");
}

function showHowToPlay() {

  document.querySelectorAll(".screen")
    .forEach(el =>
      el.classList.add("hidden")
    );

  document.getElementById("howto")
    .classList.remove("hidden");
}

function backToMenu() {

  document.querySelectorAll(".screen")
    .forEach(el =>
      el.classList.add("hidden")
    );

  document.getElementById("menu")
    .classList.remove("hidden");
}

function restartCurrentLevel() {

  document.getElementById("message")
    .classList.add("hidden");

  startLevel(currentLevel);
}

function nextLevel() {

  if (currentLevel < 3) {

    document.getElementById("message")
      .classList.add("hidden");

    startLevel(currentLevel + 1);
  }
}

// ==========================================
// SOUND
// ==========================================

let audioContext;

function playTone(freq, duration) {

  try {

    if (!audioContext) {

      audioContext =
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )();
    }

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.frequency.value =
      freq;

    oscillator.connect(gain);

    gain.connect(
      audioContext.destination
    );

    gain.gain.value = 0.08;

    oscillator.start();

    oscillator.stop(
      audioContext.currentTime +
      duration
    );

  } catch (e) {}
}

function soundJump() {
  playTone(500, 0.08);
}

function soundCoin() {
  playTone(900, 0.12);
}

function soundDeath() {
  playTone(100, 0.3);
}

function soundWin() {

  playTone(700, 0.1);

  setTimeout(
    () => playTone(1000, 0.15),
    100
  );
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {

  update();

  draw();

  requestAnimationFrame(gameLoop);
}

gameLoop();
