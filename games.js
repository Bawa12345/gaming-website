// ============================================================
// NEXUSPLAY — All Game Engines
// ============================================================

let currentGame = null;
let gameScores = JSON.parse(localStorage.getItem('nexus_scores') || '{}');

function saveScore(game, score) {
  if (!gameScores[game] || score > gameScores[game]) {
    gameScores[game] = score;
    localStorage.setItem('nexus_scores', JSON.stringify(gameScores));
    updateLeaderboard();
  }
  document.getElementById('total-score').textContent =
    Object.values(gameScores).reduce((a, b) => a + b, 0);
}

// ============================================================
// 1. CAR RACING
// ============================================================
function startCarRacing() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 480; canvas.height = 580;
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions"><span>← →</span> or <span>A D</span> to steer | <span>↑ ↓</span> or <span>W S</span> to accelerate / brake</div>`;

  let score = 0, speed = 4, lives = 3, frame = 0, gameOver = false;
  const road = { x: 100, w: 280 };
  const car = { x: canvas.width / 2 - 20, y: canvas.height - 120, w: 40, h: 70, speed: 0 };
  let obstacles = [], powerups = [], roadLines = [];
  for (let i = 0; i < 8; i++) roadLines.push({ y: i * 80 });
  const keys = {};
  document.addEventListener('keydown', e => keys[e.key] = true);
  document.addEventListener('keyup', e => keys[e.key] = false);

  function spawnObstacle() {
    const laneW = road.w / 3;
    const lane = Math.floor(Math.random() * 3);
    obstacles.push({ x: road.x + lane * laneW + laneW / 2 - 20, y: -80, w: 40, h: 70, color: ['#ef4444', '#f59e0b', '#8b5cf6'][lane] });
  }
  function spawnPowerup() {
    powerups.push({ x: road.x + Math.random() * (road.w - 20), y: -30, r: 15, type: '⭐' });
  }
  function collide(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  function loop() {
    if (gameOver) return;
    currentGame = requestAnimationFrame(loop);
    frame++;
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Road
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.roundRect(road.x, 0, road.w, canvas.height, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(124,58,237,0.4)'; ctx.lineWidth = 3;
    ctx.strokeRect(road.x, 0, road.w, canvas.height);

    // Road lines
    roadLines.forEach(l => {
      l.y += speed;
      if (l.y > canvas.height) l.y = -80;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(canvas.width / 2 - 3, l.y, 6, 40);
    });

    // Player car
    if (keys['ArrowLeft'] || keys['a']) car.x = Math.max(road.x + 5, car.x - 6);
    if (keys['ArrowRight'] || keys['d']) car.x = Math.min(road.x + road.w - car.w - 5, car.x + 6);
    if (keys['ArrowUp'] || keys['w']) { speed = Math.min(12, speed + 0.1); }
    if (keys['ArrowDown'] || keys['s']) { speed = Math.max(2, speed - 0.2); }
    speed += 0.003;

    // Draw player car body
    ctx.fillStyle = '#7c3aed'; ctx.beginPath(); ctx.roundRect(car.x, car.y, car.w, car.h, 8); ctx.fill();
    ctx.fillStyle = '#a78bfa'; ctx.fillRect(car.x + 5, car.y + 5, car.w - 10, 20);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(car.x - 5, car.y + car.h - 15, 10, 15);
    ctx.fillRect(car.x + car.w - 5, car.y + car.h - 15, 10, 15);

    // Obstacles
    if (frame % Math.max(30, 80 - Math.floor(speed) * 5) === 0) spawnObstacle();
    if (frame % 200 === 0) spawnPowerup();
    obstacles.forEach((o, i) => {
      o.y += speed;
      ctx.fillStyle = o.color; ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, 8); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(o.x + 5, o.y + 5, o.w - 10, 18);
      if (collide(car, o)) {
        obstacles.splice(i, 1); lives--;
        if (lives <= 0) { gameOver = true; showResult('💥', 'CRASH!', score, 'car-racing'); return; }
      }
      if (o.y > canvas.height) { obstacles.splice(i, 1); score += 10; }
    });

    powerups.forEach((p, i) => {
      p.y += speed * 0.6;
      ctx.font = `${p.r * 1.5}px serif`; ctx.textAlign = 'center';
      ctx.fillText(p.type, p.x + p.r, p.y + p.r);
      if (Math.abs(car.x + car.w / 2 - (p.x + p.r)) < 30 && Math.abs(car.y - (p.y + p.r)) < 40) {
        powerups.splice(i, 1); score += 50; lives = Math.min(5, lives + 1);
      }
      if (p.y > canvas.height) powerups.splice(i, 1);
    });

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, canvas.width, 45);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Orbitron,monospace';
    ctx.textAlign = 'left'; ctx.fillText(`Score: ${score}`, 15, 28);
    ctx.textAlign = 'right'; ctx.fillText('❤️'.repeat(lives), canvas.width - 15, 28);
    ctx.textAlign = 'center'; ctx.fillText(`Speed: ${Math.floor(speed * 10)} km/h`, canvas.width / 2, 28);
    document.getElementById('modal-score').textContent = score;
  }
  loop();
}

// ============================================================
// 2. SPACE SHOOTER
// ============================================================
function startSpaceShooter() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 480; canvas.height = 580;
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions"><span>← →</span> Move | <span>Space</span> Shoot | Destroy all aliens!</div>`;

  let score = 0, lives = 3, frame = 0, gameOver = false;
  const ship = { x: canvas.width / 2 - 20, y: canvas.height - 80, w: 40, h: 50 };
  let bullets = [], enemies = [], stars = [], explosions = [];
  for (let i = 0; i < 80; i++) stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2 + 0.5, s: Math.random() * 1.5 + 0.5 });
  const keys = {};
  document.addEventListener('keydown', e => { keys[e.key] = true; if (e.key === ' ') shoot(); });
  document.addEventListener('keyup', e => keys[e.key] = false);

  function shoot() { bullets.push({ x: ship.x + ship.w / 2 - 3, y: ship.y, w: 6, h: 18, color: '#06b6d4' }); }
  function spawnEnemy() {
    const types = [
      { w: 40, h: 35, color: '#ef4444', pts: 10, emoji: '👾' },
      { w: 50, h: 40, color: '#f59e0b', pts: 20, emoji: '🛸' },
      { w: 35, h: 30, color: '#8b5cf6', pts: 30, emoji: '👽' },
    ];
    const t = types[Math.floor(Math.random() * types.length)];
    enemies.push({ ...t, x: 30 + Math.random() * (canvas.width - 80), y: -50, vy: 1 + score / 500, vx: (Math.random() - 0.5) * 2, hp: 1 });
  }

  function loop() {
    if (gameOver) return;
    currentGame = requestAnimationFrame(loop);
    frame++;
    ctx.fillStyle = '#00000f'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    stars.forEach(s => { s.y += s.s; if (s.y > canvas.height) s.y = 0; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); });

    // Move ship
    if (keys['ArrowLeft'] || keys['a']) ship.x = Math.max(0, ship.x - 6);
    if (keys['ArrowRight'] || keys['d']) ship.x = Math.min(canvas.width - ship.w, ship.x + 6);
    if (frame % 15 === 0 && (keys[' '] || keys['ArrowUp'])) shoot();

    // Draw ship
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath(); ctx.moveTo(ship.x + ship.w / 2, ship.y); ctx.lineTo(ship.x, ship.y + ship.h); ctx.lineTo(ship.x + ship.w, ship.y + ship.h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#06b6d4'; ctx.fillRect(ship.x + ship.w / 2 - 5, ship.y + 15, 10, 20);
    // Engine glow
    ctx.fillStyle = 'rgba(245,158,11,0.8)';
    ctx.beginPath(); ctx.ellipse(ship.x + ship.w / 2, ship.y + ship.h + 5, 10, 8 + Math.random() * 6, 0, 0, Math.PI * 2); ctx.fill();

    // Bullets
    bullets.forEach((b, i) => {
      b.y -= 12; ctx.fillStyle = b.color; ctx.shadowBlur = 10; ctx.shadowColor = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h); ctx.shadowBlur = 0;
      if (b.y < -20) bullets.splice(i, 1);
    });

    // Enemies
    if (frame % (Math.max(30, 60 - Math.floor(score / 100) * 5)) === 0) spawnEnemy();
    enemies.forEach((e, ei) => {
      e.y += e.vy; e.x += e.vx;
      if (e.x < 0 || e.x > canvas.width - e.w) e.vx *= -1;
      ctx.font = `${e.h}px serif`; ctx.textAlign = 'center';
      ctx.fillText(e.emoji, e.x + e.w / 2, e.y + e.h);

      bullets.forEach((b, bi) => {
        if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
          bullets.splice(bi, 1); e.hp--;
          explosions.push({ x: e.x + e.w / 2, y: e.y + e.h / 2, r: 5, max: 30, t: 0 });
          if (e.hp <= 0) { enemies.splice(ei, 1); score += e.pts; }
        }
      });
      if (e.y > canvas.height) { enemies.splice(ei, 1); lives--; if (lives <= 0) { gameOver = true; showResult('💀', 'GAME OVER', score, 'space-shooter'); } }
    });

    // Explosions
    explosions.forEach((ex, i) => {
      ex.t++; const alpha = 1 - ex.t / ex.max;
      ctx.strokeStyle = `rgba(245,158,11,${alpha})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(ex.x, ex.y, ex.t * 1.5, 0, Math.PI * 2); ctx.stroke();
      if (ex.t >= ex.max) explosions.splice(i, 1);
    });

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, canvas.width, 42);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Orbitron,monospace';
    ctx.textAlign = 'left'; ctx.fillText(`Score: ${score}`, 10, 27);
    ctx.textAlign = 'right'; ctx.fillText('💜'.repeat(lives), canvas.width - 10, 27);
    document.getElementById('modal-score').textContent = score;
  }
  loop();
}

// ============================================================
// 3. SNAKE
// ============================================================
function startSnake() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const SIZE = 20, COLS = 24, ROWS = 28;
  canvas.width = COLS * SIZE; canvas.height = ROWS * SIZE;
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions"><span>Arrow Keys</span> or <span>WASD</span> to move</div>`;

  let snake = [{ x: 12, y: 14 }, { x: 11, y: 14 }, { x: 10, y: 14 }];
  let dir = { x: 1, y: 0 }, nextDir = { x: 1, y: 0 };
  let food = randomFood(), score = 0, gameOver = false, frame = 0;
  const colors = ['#7c3aed', '#a78bfa', '#06b6d4', '#38bdf8'];

  function randomFood() { return { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && dir.y !== 1) nextDir = { x: 0, y: -1 };
    if (e.key === 'ArrowDown' && dir.y !== -1) nextDir = { x: 0, y: 1 };
    if (e.key === 'ArrowLeft' && dir.x !== 1) nextDir = { x: -1, y: 0 };
    if (e.key === 'ArrowRight' && dir.x !== -1) nextDir = { x: 1, y: 0 };
    if (e.key === 'w' && dir.y !== 1) nextDir = { x: 0, y: -1 };
    if (e.key === 's' && dir.y !== -1) nextDir = { x: 0, y: 1 };
    if (e.key === 'a' && dir.x !== 1) nextDir = { x: -1, y: 0 };
    if (e.key === 'd' && dir.x !== -1) nextDir = { x: 1, y: 0 };
  });

  function update() {
    if (gameOver) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver = true; saveScore('snake', score); showResult('💀', 'GAME OVER', score, 'snake'); return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { score += 10; food = randomFood(); }
    else snake.pop();
  }

  function draw() {
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Grid
    ctx.strokeStyle = 'rgba(124,58,237,0.07)'; ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * SIZE, 0); ctx.lineTo(x * SIZE, canvas.height); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * SIZE); ctx.lineTo(canvas.width, y * SIZE); ctx.stroke(); }
    // Food
    ctx.font = `${SIZE - 2}px serif`; ctx.textAlign = 'center';
    ctx.fillText('🍎', food.x * SIZE + SIZE / 2, food.y * SIZE + SIZE - 2);
    // Snake
    snake.forEach((s, i) => {
      const color = colors[i % colors.length];
      ctx.fillStyle = color;
      ctx.shadowBlur = 8; ctx.shadowColor = color;
      ctx.beginPath(); ctx.roundRect(s.x * SIZE + 1, s.y * SIZE + 1, SIZE - 2, SIZE - 2, 4); ctx.fill();
      ctx.shadowBlur = 0;
    });
    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, canvas.width, 30);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Orbitron,monospace'; ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 8, 20); ctx.textAlign = 'right'; ctx.fillText(`Length: ${snake.length}`, canvas.width - 8, 20);
    document.getElementById('modal-score').textContent = score;
  }

  let interval = setInterval(() => { update(); draw(); }, 120);
  currentGame = interval;
}

// ============================================================
// 4. SLIDING PUZZLE
// ============================================================
function startSlidingPuzzle() {
  const ui = document.getElementById('game-ui');
  ui.style.pointerEvents = 'all'; ui.style.position = 'relative';
  document.getElementById('game-canvas').style.display = 'none';
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions">Click tiles adjacent to the empty space to slide them!</div>`;

  let moves = 0, tiles, solved = false;
  const SIZE = 4;

  function init() {
    tiles = [];
    for (let i = 0; i < SIZE * SIZE; i++) tiles.push(i);
    // Shuffle
    for (let i = tiles.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[tiles[i], tiles[j]] = [tiles[j], tiles[i]]; }
    // Ensure solvable
    if (!isSolvable()) { [tiles[0], tiles[1]] = [tiles[1], tiles[0]]; }
    moves = 0; solved = false; render();
  }

  function isSolvable() {
    let inv = 0, blankRow = 0;
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i] === 0) { blankRow = Math.floor(i / SIZE); continue; }
      for (let j = i + 1; j < tiles.length; j++) { if (tiles[j] && tiles[i] > tiles[j]) inv++; }
    }
    return (SIZE % 2 === 1) ? (inv % 2 === 0) : (SIZE - blankRow) % 2 === 0 ? inv % 2 === 0 : inv % 2 === 1;
  }

  function render() {
    ui.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;padding:1rem;gap:1rem;">
        <div style="display:flex;gap:2rem;font-weight:700;font-size:1rem;color:#a78bfa;">
          <span>Moves: ${moves}</span>
          <span style="color:${solved ? '#10b981' : '#94a3b8'}">
            ${solved ? '🎉 SOLVED!' : 'Solve the Puzzle'}
          </span>
        </div>
        <div class="puzzle-grid">${tiles.map((t, i) =>
      `<div class="puzzle-tile${t === 0 ? ' empty' : ''}" onclick="slideTile(${i})" id="pt${i}">${t || ''}</div>`
    ).join('')}</div>
        <button class="btn-restart" onclick="puzzleInit()">🔀 New Puzzle</button>
      </div>`;
    document.getElementById('modal-score').textContent = moves;
  }

  window.slideTile = function (idx) {
    if (solved) return;
    const blank = tiles.indexOf(0);
    const r1 = Math.floor(idx / SIZE), c1 = idx % SIZE;
    const r2 = Math.floor(blank / SIZE), c2 = blank % SIZE;
    if ((Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2)) {
      [tiles[idx], tiles[blank]] = [tiles[blank], tiles[idx]];
      moves++;
      if (tiles.every((t, i) => t === (i + 1) % 16)) { solved = true; saveScore('sliding-puzzle', Math.max(0, 200 - moves)); }
      render();
    }
  };
  window.puzzleInit = init;
  init();
}

// ============================================================
// 5. CRICKET
// ============================================================
function startCricket() {
  const ui = document.getElementById('game-ui');
  ui.style.pointerEvents = 'all'; ui.style.position = 'relative';
  document.getElementById('game-canvas').style.display = 'none';
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions">Watch the ball and click the <span>shot buttons</span> to score runs! Avoid getting OUT!</div>`;

  let score = 0, wickets = 0, balls = 0, over = 0, target = 50 + Math.floor(Math.random() * 50);
  let ballX = 200, ballY = 30, ballActive = false, msg = '', msgColor = '#10b981';
  let gameOver = false;
  const maxWickets = 10, maxOvers = 5;
  const shots = [
    { label: '🏏 Drive', runs: [4, 6, 1, 2, 0, 3], outChance: 0.05 },
    { label: '💥 Hook', runs: [6, 4, 0, 6, 1], outChance: 0.12 },
    { label: '🎯 Flick', runs: [1, 2, 3, 4, 0], outChance: 0.08 },
    { label: '🛡️ Block', runs: [0, 1, 0, 0, 1, 0], outChance: 0.02 },
    { label: '🔥 Slog', runs: [6, 6, 0, 4, 0, 6], outChance: 0.18 },
  ];

  function playShot(shot) {
    if (gameOver || !ballActive) return;
    balls++;
    if (balls % 6 === 0) over++;
    const r = shot.runs[Math.floor(Math.random() * shot.runs.length)];
    const out = Math.random() < shot.outChance;
    ballActive = false;
    if (out) { wickets++; msg = 'OUT! 🏏'; msgColor = '#ef4444'; }
    else { score += r; msg = r === 6 ? 'SIX! 🎉' : r === 4 ? 'FOUR! 🔥' : r === 0 ? 'Dot ball' : '' + r + ' run' + (r > 1 ? 's' : ''); msgColor = r >= 4 ? '#10b981' : '#a78bfa'; }
    if (wickets >= maxWickets || over >= maxOvers || score >= target) { endGame(); return; }
    render();
    setTimeout(() => { ballActive = true; render(); }, 1200);
  }

  function endGame() {
    gameOver = true;
    const won = score >= target;
    msg = won ? `🏆 WON! ${score}/${wickets}` : `💀 LOST! ${score}/${wickets}`;
    msgColor = won ? '#10b981' : '#ef4444';
    saveScore('cricket', score);
    setTimeout(() => showResult(won ? '🏆' : '💔', won ? 'MATCH WON!' : 'ALL OUT!', score, 'cricket'), 500);
  }

  function render() {
    ui.innerHTML = `
      <div class="cricket-ui">
        <div class="cricket-scoreboard">
          <div class="cricket-score">${score}/${wickets}</div>
          <div class="cricket-info">Over ${over}.${balls % 6} | Target: ${target} | ${msg ? `<b style="color:${msgColor}">${msg}</b>` : ''}</div>
        </div>
        <div class="cricket-pitch" style="width:100%;height:180px;background:linear-gradient(180deg,#001a00,#003300);border-radius:12px;position:relative;overflow:hidden;border:1px solid rgba(0,150,0,0.4);">
          <div style="position:absolute;background:linear-gradient(135deg,#5d4037,#8d6e63);border-radius:4px;left:50%;top:50%;transform:translate(-50%,-50%);width:8px;height:100px;opacity:0.7;"></div>
          ${ballActive ? `<div style="position:absolute;width:28px;height:28px;background:radial-gradient(circle,#ff6b6b,#cc0000);border-radius:50%;box-shadow:0 0 12px #ff4444;left:${Math.random() * 70 + 10}%;top:${Math.random() * 40 + 10}%;transition:top 0.4s;"></div>` : ''}
          <div style="position:absolute;bottom:15px;left:50%;transform:translateX(-50%);width:70px;height:16px;background:linear-gradient(90deg,#8B4513,#D2691E);border-radius:8px;box-shadow:0 0 10px rgba(139,69,19,0.5);"></div>
        </div>
        <div class="shot-buttons">
          ${shots.map((s, i) => `<button class="shot-btn" onclick="window.cricketShot(${i})">${s.label}</button>`).join('')}
        </div>
      </div>`;
    document.getElementById('modal-score').textContent = score;
  }

  window.cricketShot = function (i) { if (ballActive) playShot(shots[i]); };
  render();
  setTimeout(() => { ballActive = true; render(); }, 800);
}

// ============================================================
// 6. TIC TAC TOE
// ============================================================
function startTicTacToe() {
  const ui = document.getElementById('game-ui');
  ui.style.pointerEvents = 'all'; ui.style.position = 'relative';
  document.getElementById('game-canvas').style.display = 'none';
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions">Player 1: <span>❌</span> &nbsp;|&nbsp; Player 2: <span>⭕</span> — Take turns clicking cells!</div>`;

  let board = Array(9).fill(''), current = 'X', scores = { X: 0, O: 0 }, gameActive = true;

  function checkWin(b, p) {
    const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    return wins.find(([a, b2, c]) => b[a] === p && b[b2] === p && b[c] === p) || null;
  }

  function play(i) {
    if (!gameActive || board[i]) return;
    board[i] = current;
    const win = checkWin(board, current);
    if (win) {
      gameActive = false; scores[current]++;
      render(win);
      setTimeout(() => { board = Array(9).fill(''); gameActive = true; current = 'X'; render(); }, 2000);
      return;
    }
    if (!board.includes('')) { gameActive = false; setTimeout(() => { board = Array(9).fill(''); gameActive = true; current = 'X'; render(); }, 1500); }
    else current = current === 'X' ? 'O' : 'X';
    render();
  }

  function render(winLine = null) {
    ui.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;padding:1.5rem;gap:1rem;">
        <div style="display:flex;gap:3rem;font-family:Orbitron,monospace;font-weight:900;font-size:1.1rem;">
          <span style="color:#ef4444;">❌ ${scores.X}</span>
          <span style="color:#94a3b8;">VS</span>
          <span style="color:#06b6d4;">⭕ ${scores.O}</span>
        </div>
        <div style="font-size:0.95rem;color:#a78bfa;font-weight:600;">
          ${gameActive ? `Player ${current === 'X' ? 1 : 2}'s turn (${current === 'X' ? '❌' : '⭕'})` : winLine ? `🎉 Player ${current === 'X' ? 1 : 2} Wins!` : 'Draw!'}
        </div>
        <div class="ttt-board">
          ${board.map((cell, i) => `<div class="ttt-cell ${cell.toLowerCase()}${winLine && winLine.includes(i) ? ' win-cell' : ''}" onclick="window.tttPlay(${i})">${cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}</div>`).join('')}
        </div>
      </div>`;
    document.getElementById('modal-score').textContent = `X:${scores.X} O:${scores.O}`;
  }

  window.tttPlay = function (i) { play(i); };
  render();
}

// ============================================================
// 7. PONG
// ============================================================
function startPong() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 600; canvas.height = 420;
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions">P1: <span>W/S</span> | P2: <span>↑/↓</span> | First to 10 wins!</div>`;

  const PAD_H = 80, PAD_W = 12, BALL_R = 8;
  let p1 = { x: 15, y: canvas.height / 2 - PAD_H / 2, score: 0 };
  let p2 = { x: canvas.width - 15 - PAD_W, y: canvas.height / 2 - PAD_H / 2, score: 0 };
  let ball = { x: canvas.width / 2, y: canvas.height / 2, vx: 5 * (Math.random() > 0.5 ? 1 : -1), vy: 4 * (Math.random() > 0.5 ? 1 : -1) };
  const keys = {};
  document.addEventListener('keydown', e => keys[e.key] = true);
  document.addEventListener('keyup', e => keys[e.key] = false);
  let gameOver = false;

  function loop() {
    if (gameOver) return;
    currentGame = requestAnimationFrame(loop);
    ctx.fillStyle = '#000014'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Paddles
    if (keys['w']) p1.y = Math.max(0, p1.y - 6);
    if (keys['s']) p1.y = Math.min(canvas.height - PAD_H, p1.y + 6);
    if (keys['ArrowUp']) p2.y = Math.max(0, p2.y - 6);
    if (keys['ArrowDown']) p2.y = Math.min(canvas.height - PAD_H, p2.y + 6);

    // Ball
    ball.x += ball.vx; ball.y += ball.vy;
    if (ball.y <= BALL_R || ball.y >= canvas.height - BALL_R) ball.vy *= -1;

    // Paddle collisions
    if (ball.x - BALL_R <= p1.x + PAD_W && ball.y >= p1.y && ball.y <= p1.y + PAD_H && ball.vx < 0) { ball.vx *= -1.05; ball.vy += (ball.y - (p1.y + PAD_H / 2)) * 0.1; }
    if (ball.x + BALL_R >= p2.x && ball.y >= p2.y && ball.y <= p2.y + PAD_H && ball.vx > 0) { ball.vx *= -1.05; ball.vy += (ball.y - (p2.y + PAD_H / 2)) * 0.1; }

    // Score
    if (ball.x < 0) { p2.score++; reset(); if (p2.score >= 10) { gameOver = true; showResult('🏓', 'P2 WINS!', p2.score, 'pong'); return; } }
    if (ball.x > canvas.width) { p1.score++; reset(); if (p1.score >= 10) { gameOver = true; showResult('🏓', 'P1 WINS!', p1.score, 'pong'); return; } }

    // Draw net
    ctx.setLineDash([10, 10]); ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke(); ctx.setLineDash([]);

    // Draw paddles
    [p1, p2].forEach((p, i) => {
      const c = i === 0 ? '#7c3aed' : '#ef4444';
      ctx.fillStyle = c; ctx.shadowBlur = 15; ctx.shadowColor = c;
      ctx.beginPath(); ctx.roundRect(p.x, p.y, PAD_W, PAD_H, 6); ctx.fill(); ctx.shadowBlur = 0;
    });

    // Draw ball
    ctx.fillStyle = '#fff'; ctx.shadowBlur = 20; ctx.shadowColor = '#06b6d4';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

    // Scores
    ctx.font = 'bold 40px Orbitron,monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(p1.score, canvas.width / 4, 55); ctx.fillText(p2.score, 3 * canvas.width / 4, 55);
    document.getElementById('modal-score').textContent = `${p1.score} - ${p2.score}`;
  }

  function reset() { ball = { x: canvas.width / 2, y: canvas.height / 2, vx: 5 * (Math.random() > 0.5 ? 1 : -1), vy: 4 * (Math.random() > 0.5 ? 1 : -1) }; }
  loop();
}

// ============================================================
// 8. MEMORY MATCH
// ============================================================
function startMemory() {
  const ui = document.getElementById('game-ui');
  ui.style.pointerEvents = 'all'; ui.style.position = 'relative';
  document.getElementById('game-canvas').style.display = 'none';
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions">Flip cards and find <span>matching pairs</span>! Remember their positions!</div>`;

  const emojis = ['🎮', '🏎️', '🚀', '🧩', '🏏', '👾', '🎯', '🎲'];
  let cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
  let flipped = [], moves = 0, matched = 0, lock = false;

  function flip(id) {
    if (lock || flipped.length >= 2) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;
    card.flipped = true; flipped.push(card);
    if (flipped.length === 2) {
      moves++;
      if (flipped[0].emoji === flipped[1].emoji) { flipped[0].matched = flipped[1].matched = true; matched++; flipped = []; if (matched === emojis.length) { saveScore('memory', Math.max(0, 200 - moves * 5)); showResult('🎉', 'COMPLETE!', matched * 10, 'memory'); } }
      else { lock = true; setTimeout(() => { flipped.forEach(c => c.flipped = false); flipped = []; lock = false; render(); }, 1000); }
    }
    render();
  }

  function render() {
    ui.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;padding:1rem;gap:0.8rem;">
        <div style="display:flex;gap:2rem;font-weight:700;color:#a78bfa;">
          <span>Moves: ${moves}</span><span>Pairs: ${matched}/${emojis.length}</span>
        </div>
        <div class="memory-board">
          ${cards.map(c => `
            <div class="mem-card${c.flipped || c.matched ? ' flipped' : ''}" onclick="window.memFlip(${c.id})">
              <div class="back">❓</div>
              <div class="front${c.matched ? ' matched' : ''}">${c.emoji}</div>
            </div>`).join('')}
        </div>
      </div>`;
    document.getElementById('modal-score').textContent = moves;
  }
  window.memFlip = flip; render();
}

// ============================================================
// 9. FLAPPY BIRD
// ============================================================
function startFlappy() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 360; canvas.height = 560;
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions"><span>Space</span> or <span>Click</span> to flap!</div>`;

  let bird = { x: 80, y: 280, vy: 0, r: 16 };
  let pipes = [], score = 0, frame = 0, gameOver = false, started = false;
  const GRAVITY = 0.45, FLAP = -8, GAP = 155, PIPE_W = 55, PIPE_SPEED = 2.8;
  const BG_COLORS = ['#0a0a2e', '#1a0a3e'];

  function flap() { if (!started) { started = true; } if (gameOver) { restartFlappy(); return; } bird.vy = FLAP; }
  document.addEventListener('keydown', e => { if (e.key === ' ') flap(); });
  canvas.addEventListener('click', flap);

  function spawnPipe() {
    const top = 80 + Math.random() * (canvas.height - GAP - 160);
    pipes.push({ x: canvas.width, top, bottom: top + GAP, scored: false });
  }

  function restartFlappy() {
    bird = { x: 80, y: 280, vy: 0, r: 16 }; pipes = []; score = 0; frame = 0; gameOver = false; started = false;
  }

  function loop() {
    currentGame = requestAnimationFrame(loop);
    ctx.fillStyle = '#000033'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // BG stars
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 3; i++) ctx.fillRect((frame * 0.5 + i * 130) % canvas.width, (i * 200 + 50) % canvas.height, 2, 2);

    if (!started) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 22px Orbitron,monospace'; ctx.textAlign = 'center';
      ctx.fillText('TAP TO START', canvas.width / 2, canvas.height / 2);
      ctx.font = 'serif'; ctx.font = `${bird.r * 2}px serif`; ctx.fillText('🐦', bird.x, bird.y + bird.r);
      return;
    }
    if (!gameOver) { bird.vy += GRAVITY; bird.y += bird.vy; frame++; }

    // Pipes
    if (frame % 90 === 0) spawnPipe();
    pipes.forEach((p, i) => {
      if (!gameOver) p.x -= PIPE_SPEED;
      // Top pipe
      const grad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
      grad.addColorStop(0, '#1a6600'); grad.addColorStop(1, '#22aa00');
      ctx.fillStyle = grad;
      ctx.fillRect(p.x, 0, PIPE_W, p.top);
      ctx.fillRect(p.x, p.bottom, PIPE_W, canvas.height - p.bottom);
      ctx.fillStyle = '#33cc00'; ctx.fillRect(p.x - 5, p.top - 25, PIPE_W + 10, 25); ctx.fillRect(p.x - 5, p.bottom, PIPE_W + 10, 25);

      // Score
      if (!p.scored && p.x + PIPE_W < bird.x) { p.scored = true; score++; }
      // Collision
      if (!gameOver && bird.x + bird.r > p.x && bird.x - bird.r < p.x + PIPE_W && (bird.y - bird.r < p.top || bird.y + bird.r > p.bottom)) {
        gameOver = true; saveScore('flappy', score);
      }
      if (p.x + PIPE_W < 0) pipes.splice(i, 1);
    });

    // Bird
    ctx.font = `${bird.r * 2}px serif`; ctx.textAlign = 'center';
    ctx.fillText('🐦', bird.x, bird.y + bird.r);

    // Ground collision
    if (bird.y + bird.r > canvas.height || bird.y - bird.r < 0) { gameOver = true; saveScore('flappy', score); }

    // HUD
    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Orbitron,monospace'; ctx.textAlign = 'center';
    ctx.shadowBlur = 15; ctx.shadowColor = '#7c3aed';
    ctx.fillText(score, canvas.width / 2, 45); ctx.shadowBlur = 0;
    document.getElementById('modal-score').textContent = score;

    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 28px Orbitron,monospace'; ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
      ctx.font = 'bold 18px Inter,sans-serif';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
      ctx.fillText('Tap to restart', canvas.width / 2, canvas.height / 2 + 50);
    }
  }
  loop();
}

// ============================================================
// 10. BREAKOUT
// ============================================================
function startBreakout() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 480; canvas.height = 500;
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions"><span>← →</span> or Mouse to move paddle | Break all bricks!</div>`;

  const ROWS = 5, COLS = 10, BRICK_W = 42, BRICK_H = 18, PAD_W = 80, PAD_H = 12, BALL_R = 8;
  let pad = { x: canvas.width / 2 - PAD_W / 2, y: canvas.height - 35 };
  let ball = { x: canvas.width / 2, y: canvas.height - 60, vx: 4, vy: -5 };
  let bricks = [], score = 0, lives = 3, gameOver = false, frame = 0;
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#7c3aed'];

  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
    bricks.push({ x: c * (BRICK_W + 4) + 10, y: r * (BRICK_H + 5) + 50, alive: true, color: colors[r] });

  const keys = {};
  document.addEventListener('keydown', e => keys[e.key] = true);
  document.addEventListener('keyup', e => keys[e.key] = false);
  canvas.addEventListener('mousemove', e => { const rect = canvas.getBoundingClientRect(); pad.x = e.clientX - rect.left - PAD_W / 2; });

  function loop() {
    if (gameOver) return;
    currentGame = requestAnimationFrame(loop);
    frame++;
    ctx.fillStyle = '#080818'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (keys['ArrowLeft']) pad.x = Math.max(0, pad.x - 7);
    if (keys['ArrowRight']) pad.x = Math.min(canvas.width - PAD_W, pad.x + 7);
    pad.x = Math.max(0, Math.min(canvas.width - PAD_W, pad.x));

    ball.x += ball.vx; ball.y += ball.vy;
    if (ball.x <= BALL_R || ball.x >= canvas.width - BALL_R) ball.vx *= -1;
    if (ball.y <= BALL_R) ball.vy *= -1;
    if (ball.y >= canvas.height) { lives--; if (lives <= 0) { gameOver = true; showResult('💔', 'GAME OVER', score, 'breakout'); return; } ball = { x: canvas.width / 2, y: canvas.height - 60, vx: 4, vy: -5 }; }

    // Paddle collision
    if (ball.y + BALL_R >= pad.y && ball.x >= pad.x && ball.x <= pad.x + PAD_W && ball.vy > 0) {
      ball.vy *= -1; ball.vx = (ball.x - (pad.x + PAD_W / 2)) * 0.15;
    }

    // Bricks
    bricks.filter(b => b.alive).forEach(b => {
      if (ball.x + BALL_R > b.x && ball.x - BALL_R < b.x + BRICK_W && ball.y + BALL_R > b.y && ball.y - BALL_R < b.y + BRICK_H) {
        b.alive = false; ball.vy *= -1; score += 10;
        if (!bricks.some(bk => bk.alive)) { gameOver = true; showResult('🎉', 'YOU WIN!', score, 'breakout'); }
      }
    });

    // Draw bricks
    bricks.filter(b => b.alive).forEach(b => {
      ctx.fillStyle = b.color; ctx.shadowBlur = 8; ctx.shadowColor = b.color;
      ctx.beginPath(); ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 4); ctx.fill(); ctx.shadowBlur = 0;
    });

    // Draw paddle
    const pg = ctx.createLinearGradient(pad.x, 0, pad.x + PAD_W, 0);
    pg.addColorStop(0, '#7c3aed'); pg.addColorStop(1, '#06b6d4');
    ctx.fillStyle = pg; ctx.shadowBlur = 15; ctx.shadowColor = '#7c3aed';
    ctx.beginPath(); ctx.roundRect(pad.x, pad.y, PAD_W, PAD_H, 6); ctx.fill(); ctx.shadowBlur = 0;

    // Draw ball
    ctx.fillStyle = '#fff'; ctx.shadowBlur = 15; ctx.shadowColor = '#06b6d4';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, canvas.width, 38);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Orbitron,monospace'; ctx.textAlign = 'left'; ctx.fillText(`Score: ${score}`, 10, 24);
    ctx.textAlign = 'right'; ctx.fillText(`Lives: ${'❤️'.repeat(lives)}`, canvas.width - 10, 24);
    document.getElementById('modal-score').textContent = score;
  }
  loop();
}

// ============================================================
// 11. ZOMBIE SHOOTER
// ============================================================
function startZombie() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 480; canvas.height = 500;
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions"><span>Click</span> on zombies to shoot them! Don't let them reach you!</div>`;

  let score = 0, lives = 5, wave = 1, zombies = [], bullets = [], frame = 0, gameOver = false;

  function spawnZombie() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = Math.random() * canvas.width; y = -30; }
    else if (side === 1) { x = canvas.width + 30; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 30; }
    else { x = -30; y = Math.random() * canvas.height; }
    const types = ['🧟', '👻', '💀', '🦇'];
    zombies.push({ x, y, hp: 1 + wave, maxHp: 1 + wave, speed: 0.8 + wave * 0.2, type: types[Math.floor(Math.random() * types.length)], r: 22 });
  }

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    bullets.push({ x: cx, y: cy, r: 0, maxR: 40, hit: false });
    zombies.forEach((z, i) => { if (Math.hypot(z.x - cx, z.y - cy) < z.r + 20) { z.hp--; if (z.hp <= 0) { zombies.splice(i, 1); score += 10 + wave * 5; } } });
  });

  function loop() {
    if (gameOver) return;
    currentGame = requestAnimationFrame(loop);
    frame++;
    ctx.fillStyle = '#0a0005'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (frame % (Math.max(20, 60 - wave * 5)) === 0) spawnZombie();
    if (frame % 300 === 0) wave++;

    // Ground grid
    ctx.strokeStyle = 'rgba(180,0,0,0.1)'; ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

    // Bullets
    bullets.forEach((b, i) => {
      b.r += 4; ctx.strokeStyle = `rgba(255,200,0,${1 - b.r / b.maxR})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
      if (b.r >= b.maxR) bullets.splice(i, 1);
    });

    // Zombies
    zombies.forEach((z, i) => {
      const angle = Math.atan2(canvas.height / 2 - z.y, canvas.width / 2 - z.x);
      z.x += Math.cos(angle) * z.speed; z.y += Math.sin(angle) * z.speed;
      ctx.font = `${z.r * 1.5}px serif`; ctx.textAlign = 'center'; ctx.fillText(z.type, z.x, z.y + z.r / 2);
      // HP bar
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(z.x - z.r, z.y - z.r - 8, z.r * 2, 5);
      ctx.fillStyle = '#ef4444'; ctx.fillRect(z.x - z.r, z.y - z.r - 8, z.r * 2 * (z.hp / z.maxHp), 5);

      if (Math.hypot(z.x - canvas.width / 2, z.y - canvas.height / 2) < 40) { zombies.splice(i, 1); lives--; if (lives <= 0) { gameOver = true; showResult('🧟', 'OVERRUN!', score, 'zombie'); return; } }
    });

    // Player
    ctx.font = '40px serif'; ctx.textAlign = 'center'; ctx.fillText('🔫', canvas.width / 2, canvas.height / 2 + 10);
    ctx.strokeStyle = 'rgba(255,200,0,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height / 2, 45, 0, Math.PI * 2); ctx.stroke();

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, canvas.width, 38);
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 14px Orbitron,monospace'; ctx.textAlign = 'left'; ctx.fillText(`Score: ${score}`, 10, 24);
    ctx.textAlign = 'center'; ctx.fillText(`Wave ${wave}`, canvas.width / 2, 24);
    ctx.textAlign = 'right'; ctx.fillText(`HP: ${'❤️'.repeat(Math.max(0, lives))}`, canvas.width - 10, 24);
    document.getElementById('modal-score').textContent = score;
  }
  loop();
}

// ============================================================
// 12. CONNECT FOUR
// ============================================================
function startConnect4() {
  const ui = document.getElementById('game-ui');
  ui.style.pointerEvents = 'all'; ui.style.position = 'relative';
  document.getElementById('game-canvas').style.display = 'none';
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions">Player 1: <span>🔴</span> &nbsp;|&nbsp; Player 2: <span>🟡</span> — Click a column to drop!</div>`;

  const COLS = 7, ROWS = 6;
  let board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
  let current = 1, scores = { 1: 0, 2: 0 }, gameActive = true;

  function drop(col) {
    if (!gameActive) return;
    for (let r = ROWS - 1; r >= 0; r--) { if (!board[r][col]) { board[r][col] = current; if (checkWinner(r, col)) { scores[current]++; gameActive = false; render(`🎉 Player ${current} Wins!`); saveScore('connect4', scores[current]); return; } if (!board[0].includes(0)) { gameActive = false; render('Draw!'); return; } current = current === 1 ? 2 : 1; render(); return; } }
  }

  function checkWinner(r, c) {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    return dirs.some(([dr, dc]) => {
      let count = 1;
      for (let i = 1; i < 4; i++) { const nr = r + dr * i, nc = c + dc * i; if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === current) count++; else break; }
      for (let i = 1; i < 4; i++) { const nr = r - dr * i, nc = c - dc * i; if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === current) count++; else break; }
      return count >= 4;
    });
  }

  function render(msg = '') {
    ui.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;padding:1rem;gap:0.8rem;">
        <div style="display:flex;gap:3rem;font-family:Orbitron,monospace;font-weight:900;font-size:1rem;">
          <span style="color:#ff4444;">🔴 ${scores[1]}</span>
          <span style="color:#94a3b8;">VS</span>
          <span style="color:#ffcc00;">🟡 ${scores[2]}</span>
        </div>
        <div style="font-size:0.9rem;color:#a78bfa;font-weight:600;">${msg || (gameActive ? `Player ${current}'s turn (${current === 1 ? '🔴' : '🟡'})` : '')}</div>
        <div class="connect4-board">
          ${Array(ROWS).fill(0).map((_, r) => Array(COLS).fill(0).map((_, c) => `<div class="c4-cell${board[r][c] === 1 ? ' red' : board[r][c] === 2 ? ' yellow' : ''}" onclick="window.c4Drop(${c})"></div>`).join('')).join('')}
        </div>
        ${!gameActive ? `<button class="btn-restart" onclick="window.c4Restart()">🔄 Play Again</button>` : ''}
      </div>`;
    document.getElementById('modal-score').textContent = `${scores[1]}-${scores[2]}`;
  }

  window.c4Drop = drop;
  window.c4Restart = () => { board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0)); current = 1; gameActive = true; render(); };
  render();
}

// ============================================================
// SHARED: Show result overlay
// ============================================================
function showResult(emoji, text, score, gameId) {
  saveScore(gameId, score);
  cancelGame();
  const modal = document.querySelector('.modal-container');
  const overlay = document.createElement('div');
  overlay.className = 'result-overlay';
  overlay.innerHTML = `
    <div class="result-emoji">${emoji}</div>
    <div class="result-text">${text}</div>
    <div class="result-sub">Score: ${score} pts</div>
    <button class="btn-restart" onclick="openGame('${gameId}')">🔄 Play Again</button>
    <button class="btn-restart" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);" onclick="closeGame()">🏠 Menu</button>`;
  modal.appendChild(overlay);
}

// ============================================================
// 13. WHACK-A-MOLE
// ============================================================
function startWhackaMole() {
  const ui = document.getElementById('game-ui');
  ui.style.pointerEvents = 'all'; ui.style.position = 'relative';
  document.getElementById('game-canvas').style.display = 'none';
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions"><span>Click</span> the moles before they hide! Don't miss!</div>`;

  let score = 0, misses = 0, timeLeft = 30, gameOver = false;
  const MAX_MISSES = 5;
  const holes = Array(9).fill(null).map(() => ({ active: false, timer: null }));
  let countdown = null;

  function showMole(idx) {
    if (gameOver || holes[idx].active) return;
    holes[idx].active = true;
    render();
    holes[idx].timer = setTimeout(() => {
      if (holes[idx].active) { holes[idx].active = false; misses++; render(); }
      if (misses >= MAX_MISSES) { endGame(); }
    }, 900 + Math.random() * 500);
  }

  function whack(idx) {
    if (!holes[idx].active || gameOver) return;
    clearTimeout(holes[idx].timer);
    holes[idx].active = false;
    score += 10;
    render();
  }

  function endGame() {
    gameOver = true;
    clearInterval(countdown);
    holes.forEach(h => clearTimeout(h.timer));
    showResult('🦔', 'TIME\'S UP!', score, 'whackamole');
  }

  let spawnInterval = setInterval(() => {
    if (gameOver) { clearInterval(spawnInterval); return; }
    const idx = Math.floor(Math.random() * 9);
    showMole(idx);
  }, 600);

  countdown = setInterval(() => {
    if (gameOver) { clearInterval(countdown); return; }
    timeLeft--;
    render();
    if (timeLeft <= 0) endGame();
  }, 1000);
  currentGame = spawnInterval;

  function render() {
    ui.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;padding:1.2rem;gap:1rem;">
        <div style="display:flex;gap:2rem;font-weight:700;color:#a78bfa;font-family:Orbitron,monospace;">
          <span>Score: <b style="color:#f59e0b">${score}</b></span>
          <span>Time: <b style="color:${timeLeft <= 10 ? '#ef4444' : '#10b981'}">${timeLeft}s</b></span>
          <span>Misses: <b style="color:#ef4444">${misses}/${MAX_MISSES}</b></span>
        </div>
        <div class="whack-grid">
          ${holes.map((h, i) => `
            <div class="whack-hole" onclick="window.whackMole(${i})">
              <div class="hole-ground"></div>
              ${h.active ? `<div class="mole">🦔</div>` : ''}
            </div>`).join('')}
        </div>
      </div>`;
    document.getElementById('modal-score').textContent = score;
    window.whackMole = whack;
  }
  render();
}

// ============================================================
// 14. BASKETBALL (HOOP BLASTER)
// ============================================================
function startBasketball() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 480; canvas.height = 500;
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions"><span>Click</span> or <span>Space</span> to shoot at the right moment! Score 10 baskets to win!</div>`;

  let score = 0, misses = 0, angle = 0, dir = 1, shooting = false, ballY = 0, ballX = 0;
  let power = 0.04, gameOver = false, frame = 0;
  const hoopX = 380, hoopY = 140, hoopR = 30;
  const ballBase = { x: 240, y: 420, r: 22 };

  function shoot() {
    if (shooting || gameOver) return;
    shooting = true;
    const rad = (angle - 90) * Math.PI / 180;
    const speed = 12;
    let vx = Math.cos(rad) * speed;
    let vy = Math.sin(rad) * speed;
    let bx = ballBase.x, by = ballBase.y;
    let t = 0;
    const fly = setInterval(() => {
      t++; bx += vx; by += vy; vy += 0.5;
      ballX = bx; ballY = by;
      const dist = Math.hypot(bx - hoopX, by - hoopY);
      if (dist < hoopR + 5 && vy > 0) {
        clearInterval(fly);
        score++;
        document.getElementById('modal-score').textContent = score;
        shooting = false;
        if (score >= 10) { gameOver = true; clearInterval(fly); showResult('🏀', 'SLAM DUNK!', score * 10, 'basketball'); }
      } else if (by > canvas.height + 50 || bx < 0 || bx > canvas.width) {
        clearInterval(fly);
        misses++;
        shooting = false;
        if (misses >= 8) { gameOver = true; showResult('😢', 'MISSED!', score * 10, 'basketball'); }
      }
    }, 16);
  }

  document.addEventListener('keydown', e => { if (e.key === ' ') shoot(); });
  canvas.addEventListener('click', shoot);

  function loop() {
    if (gameOver) return;
    currentGame = requestAnimationFrame(loop);
    frame++;
    if (!shooting) { angle += dir * 1.8; if (angle > 70 || angle < -70) dir *= -1; }

    ctx.fillStyle = '#0a0015'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars bg
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 5; i++) ctx.fillRect((frame + i * 100) % canvas.width, (i * 120 + 30) % 300, 2, 2);

    // Backboard
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(hoopX + 10, hoopY - 60, 50, 90);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.strokeRect(hoopX + 15, hoopY - 50, 38, 60);

    // Hoop
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 5; ctx.shadowBlur = 15; ctx.shadowColor = '#f59e0b';
    ctx.beginPath(); ctx.ellipse(hoopX, hoopY, hoopR, 8, 0, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;

    // Net
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(hoopX + i * 10, hoopY + 5); ctx.lineTo(hoopX + i * 6, hoopY + 40); ctx.stroke();
    }

    // Floor
    const floorG = ctx.createLinearGradient(0, 440, 0, 500);
    floorG.addColorStop(0, '#3d1500'); floorG.addColorStop(1, '#1a0800');
    ctx.fillStyle = floorG; ctx.fillRect(0, 440, canvas.width, 60);
    ctx.strokeStyle = 'rgba(255,165,0,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(ballBase.x, 445, 60, 12, 0, 0, Math.PI * 2); ctx.stroke();

    // Aim arrow
    if (!shooting) {
      const rad = (angle - 90) * Math.PI / 180;
      ctx.strokeStyle = 'rgba(245,158,11,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(ballBase.x, ballBase.y);
      ctx.lineTo(ballBase.x + Math.cos(rad) * 120, ballBase.y + Math.sin(rad) * 120); ctx.stroke(); ctx.setLineDash([]);
    }

    // Ball
    const bx2 = shooting ? ballX : ballBase.x, by2 = shooting ? ballY : ballBase.y;
    const ballG = ctx.createRadialGradient(bx2 - 6, by2 - 6, 3, bx2, by2, ballBase.r);
    ballG.addColorStop(0, '#ff8c00'); ballG.addColorStop(1, '#c45000');
    ctx.fillStyle = ballG; ctx.shadowBlur = 20; ctx.shadowColor = '#f59e0b';
    ctx.beginPath(); ctx.arc(bx2, by2, ballBase.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(bx2, by2 - 6, ballBase.r - 1, 0.2, Math.PI - 0.2); ctx.stroke();

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, canvas.width, 40);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Orbitron,monospace';
    ctx.textAlign = 'left'; ctx.fillText(`Baskets: ${score}/10`, 10, 26);
    ctx.textAlign = 'right'; ctx.fillText(`Misses: ${misses}/8`, canvas.width - 10, 26);
  }
  loop();
}

// ============================================================
// 15. MATH BLITZ
// ============================================================
function startMathBlitz() {
  const ui = document.getElementById('game-ui');
  ui.style.pointerEvents = 'all'; ui.style.position = 'relative';
  document.getElementById('game-canvas').style.display = 'none';
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions">Type the answer and press <span>Enter</span> or click <span>Submit</span>!</div>`;

  let score = 0, timeLeft = 45, streak = 0, gameOver = false, question = null;
  const ops = ['+', '-', '×', '÷'];

  function genQuestion() {
    const op = ops[Math.floor(Math.random() * (score < 50 ? 2 : 4))];
    let a, b, ans;
    if (op === '+') { a = Math.floor(Math.random() * 50) + 1; b = Math.floor(Math.random() * 50) + 1; ans = a + b; }
    else if (op === '-') { a = Math.floor(Math.random() * 50) + 10; b = Math.floor(Math.random() * a); ans = a - b; }
    else if (op === '×') { a = Math.floor(Math.random() * 12) + 1; b = Math.floor(Math.random() * 12) + 1; ans = a * b; }
    else { b = Math.floor(Math.random() * 10) + 1; ans = Math.floor(Math.random() * 10) + 1; a = b * ans; }
    question = { text: `${a} ${op} ${b}`, answer: ans };
  }

  let flash = '', flashColor = '';
  function submit() {
    const inp = document.getElementById('math-input');
    if (!inp) return;
    const val = parseInt(inp.value);
    if (isNaN(val)) return;
    if (val === question.answer) {
      streak++; score += 10 + streak * 2;
      flash = '✅ Correct!'; flashColor = '#10b981';
    } else {
      streak = 0; flash = `❌ Was ${question.answer}`; flashColor = '#ef4444';
    }
    genQuestion(); render(); inp && inp.focus();
    setTimeout(() => { flash = ''; render(); }, 700);
  }

  const countdown = setInterval(() => {
    if (gameOver) { clearInterval(countdown); return; }
    timeLeft--;
    render();
    if (timeLeft <= 0) { gameOver = true; clearInterval(countdown); showResult('🔢', 'TIME\'S UP!', score, 'mathblitz'); }
  }, 1000);
  currentGame = countdown;

  genQuestion();
  function render() {
    ui.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;padding:1.5rem;gap:1.2rem;max-width:420px;margin:0 auto;">
        <div style="display:flex;gap:2rem;font-weight:700;font-family:Orbitron,monospace;">
          <span style="color:#a78bfa">Score: <b style="color:#f59e0b">${score}</b></span>
          <span style="color:${timeLeft <= 10 ? '#ef4444' : '#10b981'}">⏱ ${timeLeft}s</span>
          <span style="color:#06b6d4">🔥 ${streak}</span>
        </div>
        <div style="background:rgba(124,58,237,0.15);border:2px solid rgba(124,58,237,0.4);border-radius:16px;padding:2rem 3rem;text-align:center;width:100%;">
          <div style="font-family:Orbitron,monospace;font-size:2.5rem;font-weight:900;color:#fff;">${question.text} = ?</div>
        </div>
        ${flash ? `<div style="font-size:1.2rem;font-weight:700;color:${flashColor}">${flash}</div>` : '<div style="height:1.6rem"></div>'}
        <div style="display:flex;gap:0.8rem;width:100%;">
          <input id="math-input" type="number" placeholder="Your answer..." autofocus
            style="flex:1;background:rgba(255,255,255,0.07);border:2px solid rgba(124,58,237,0.4);border-radius:12px;padding:0.8rem 1rem;color:#fff;font-size:1.3rem;font-family:Orbitron,monospace;outline:none;text-align:center;"
            onkeydown="if(event.key==='Enter')window.mathSubmit()">
          <button onclick="window.mathSubmit()"
            style="background:linear-gradient(135deg,#7c3aed,#06b6d4);border:none;border-radius:12px;padding:0.8rem 1.5rem;color:#fff;font-weight:700;font-size:1rem;cursor:pointer;">
            Submit
          </button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;width:100%;">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '←', 'OK'].map(k => `
            <button onclick="window.mathKey('${k}')"
              style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:0.7rem;color:#fff;font-size:1.1rem;font-weight:600;cursor:pointer;">
              ${k}
            </button>`).join('')}
        </div>
      </div>`;
    document.getElementById('modal-score').textContent = score;
    const inp = document.getElementById('math-input');
    if (inp) inp.focus();
    window.mathSubmit = submit;
    window.mathKey = (k) => {
      const inp = document.getElementById('math-input');
      if (!inp) return;
      if (k === '←') inp.value = inp.value.slice(0, -1);
      else if (k === 'OK') submit();
      else inp.value += k;
    };
  }
  render();
}

// ============================================================
// 16. DRIFT KING
// ============================================================
function startDrift() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 480; canvas.height = 500;
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions"><span>← →</span> Steer | <span>↑</span> Accelerate | <span>↓</span> Brake | Drift for bonus points!</div>`;

  let score = 0, driftScore = 0, combo = 1, frame = 0, gameOver = false;
  let lives = 3;
  const car = { x: 240, y: 380, angle: 0, speed: 0, vx: 0, vy: 0, drift: 0 };
  const keys = {};
  document.addEventListener('keydown', e => keys[e.key] = true);
  document.addEventListener('keyup', e => keys[e.key] = false);

  // Neon track waypoints (closed loop)
  const track = [
    { x: 240, y: 420 }, { x: 80, y: 380 }, { x: 40, y: 260 }, { x: 80, y: 120 },
    { x: 240, y: 60 }, { x: 400, y: 120 }, { x: 440, y: 260 }, { x: 400, y: 380 }
  ];

  let walls = [], cones = [];
  // Build wall pairs from track
  for (let i = 0; i < track.length; i++) {
    const a = track[i], b = track[(i + 1) % track.length];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const nx = -dy / len * 38, ny = dx / len * 38;
    walls.push({ ax: a.x + nx, ay: a.y + ny, bx: b.x + nx, by: b.y + ny });
    walls.push({ ax: a.x - nx, ay: a.y - ny, bx: b.x - nx, by: b.y - ny });
  }

  // Spawn random cones
  for (let i = 0; i < 8; i++) {
    const t = track[Math.floor(Math.random() * track.length)];
    cones.push({ x: t.x + (Math.random() - 0.5) * 50, y: t.y + (Math.random() - 0.5) * 50 });
  }

  let particles = [];

  function loop() {
    if (gameOver) return;
    currentGame = requestAnimationFrame(loop);
    frame++;

    // Controls
    const ACCEL = 0.3, BRAKE = 0.6, STEER = 0.045, FRICTION = 0.96;
    if (keys['ArrowUp'] || keys['w']) car.speed = Math.min(9, car.speed + ACCEL);
    else if (keys['ArrowDown'] || keys['s']) car.speed = Math.max(0, car.speed - BRAKE);
    else car.speed *= 0.98;

    if (keys['ArrowLeft'] || keys['a']) car.angle -= STEER * (car.speed > 1 ? 1 : 0.3);
    if (keys['ArrowRight'] || keys['d']) car.angle += STEER * (car.speed > 1 ? 1 : 0.3);

    const intendedVx = Math.sin(car.angle) * car.speed;
    const intendedVy = -Math.cos(car.angle) * car.speed;
    car.vx = car.vx * 0.75 + intendedVx * 0.25;
    car.vy = car.vy * 0.75 + intendedVy * 0.25;

    const driftMag = Math.abs(car.vx - intendedVx) + Math.abs(car.vy - intendedVy);
    car.drift = driftMag;

    if (driftMag > 1.5 && car.speed > 2) {
      driftScore += driftMag * 0.5;
      score = Math.floor(driftScore);
      combo = Math.min(8, combo + 0.02);
      // Smoke particles
      particles.push({ x: car.x, y: car.y, life: 30, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2 });
    } else { combo = Math.max(1, combo - 0.05); }

    car.x += car.vx; car.y += car.vy;

    // Boundary
    if (car.x < 15) { car.x = 15; car.vx *= -0.4; lives--; combo = 1; if (lives <= 0) { gameOver = true; showResult('💥', 'CRASHED!', score, 'drift'); return; } }
    if (car.x > canvas.width - 15) { car.x = canvas.width - 15; car.vx *= -0.4; lives--; combo = 1; if (lives <= 0) { gameOver = true; showResult('💥', 'CRASHED!', score, 'drift'); return; } }
    if (car.y < 15) { car.y = 15; car.vy *= -0.4; lives--; combo = 1; if (lives <= 0) { gameOver = true; showResult('💥', 'CRASHED!', score, 'drift'); return; } }
    if (car.y > canvas.height - 15) { car.y = canvas.height - 15; car.vy *= -0.4; lives--; combo = 1; if (lives <= 0) { gameOver = true; showResult('💥', 'CRASHED!', score, 'drift'); return; } }

    // Draw
    ctx.fillStyle = '#060612'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Track
    ctx.strokeStyle = 'rgba(124,58,237,0.3)'; ctx.lineWidth = 76; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    track.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath(); ctx.stroke();

    ctx.strokeStyle = 'rgba(6,182,212,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([15, 12]);
    ctx.beginPath();
    track.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);

    // Outer edge glow
    ctx.strokeStyle = `rgba(124,58,237,0.8)`; ctx.lineWidth = 2; ctx.setLineDash([]);
    walls.forEach(w => {
      ctx.beginPath(); ctx.moveTo(w.ax, w.ay); ctx.lineTo(w.bx, w.by); ctx.stroke();
    });

    // Cones
    cones.forEach(c => {
      ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.fillText('🔺', c.x, c.y + 8);
    });

    // Smoke
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life--;
      const a = p.life / 30;
      ctx.fillStyle = `rgba(200,200,200,${a * 0.5})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, (30 - p.life) * 0.4, 0, Math.PI * 2); ctx.fill();
    });

    // Car
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle + Math.sin(frame * 0.1) * car.drift * 0.05);
    const carColor = car.drift > 1.5 ? '#f59e0b' : '#7c3aed';
    ctx.shadowBlur = 20; ctx.shadowColor = carColor;
    ctx.fillStyle = carColor;
    ctx.beginPath(); ctx.roundRect(-14, -22, 28, 44, 6); ctx.fill();
    ctx.fillStyle = 'rgba(0,255,255,0.4)'; ctx.fillRect(-10, -18, 20, 14);
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(-18, 14, 7, 12); ctx.fillRect(11, 14, 7, 12);
    ctx.shadowBlur = 0;
    ctx.restore();

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, canvas.width, 40);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Orbitron,monospace'; ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 26);
    ctx.textAlign = 'center';
    if (car.drift > 1.5) {
      ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 13px Orbitron,monospace';
      ctx.fillText(`🔥 DRIFT x${combo.toFixed(1)}`, canvas.width / 2, 26);
    }
    ctx.textAlign = 'right'; ctx.fillStyle = '#fff';
    ctx.fillText(`❤️`.repeat(Math.max(0, lives)), canvas.width - 10, 26);
    document.getElementById('modal-score').textContent = score;
  }
  loop();
}

// ============================================================
// 17. WORD SCRAMBLE
// ============================================================
function startWordScramble() {
  const ui = document.getElementById('game-ui');
  ui.style.pointerEvents = 'all'; ui.style.position = 'relative';
  document.getElementById('game-canvas').style.display = 'none';
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions">Unscramble the word and type it! <span>Enter</span> to submit.</div>`;

  const wordList = [
    'GAMING', 'PLANET', 'ROCKET', 'DRAGON', 'PUZZLE', 'BATTLE', 'TURBO', 'SNAKE',
    'PIXEL', 'LASER', 'NINJA', 'GHOST', 'STORM', 'BLAZE', 'SWORD', 'MAGIC', 'QUEST',
    'SCORE', 'LEVEL', 'POWER', 'SPEED', 'FLAME', 'CLOUD', 'NIGHT', 'EMBER', 'FORCE'
  ];

  let score = 0, timeLeft = 60, streak = 0, hint = false;
  let current = '', scrambled = '', flash = '', flashColor = '';

  function scramble(w) {
    let arr = w.split('');
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
    if (arr.join('') === w) return scramble(w);
    return arr.join('');
  }

  function nextWord() {
    current = wordList[Math.floor(Math.random() * wordList.length)];
    scrambled = scramble(current);
    hint = false; render();
  }

  function submit() {
    const inp = document.getElementById('word-input');
    if (!inp) return;
    const val = inp.value.trim().toUpperCase();
    if (val === current) {
      streak++; score += 20 + streak * 5;
      flash = '✅ Correct!'; flashColor = '#10b981';
      nextWord();
    } else {
      streak = 0; flash = '❌ Try again!'; flashColor = '#ef4444';
      render();
    }
    setTimeout(() => { flash = ''; render(); }, 700);
  }

  const countdown = setInterval(() => {
    timeLeft--;
    render();
    if (timeLeft <= 0) { clearInterval(countdown); showResult('📝', 'TIME\'S UP!', score, 'wordscramble'); }
  }, 1000);
  currentGame = countdown;

  nextWord();
  function render() {
    ui.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;padding:1.5rem;gap:1.2rem;max-width:440px;margin:0 auto;">
        <div style="display:flex;gap:2rem;font-weight:700;font-family:Orbitron,monospace;">
          <span style="color:#a78bfa">Score: <b style="color:#f59e0b">${score}</b></span>
          <span style="color:${timeLeft <= 10 ? '#ef4444' : '#10b981'}">⏱ ${timeLeft}s</span>
          <span style="color:#06b6d4">🔥 ${streak}</span>
        </div>
        <div style="background:rgba(6,182,212,0.1);border:2px solid rgba(6,182,212,0.3);border-radius:16px;padding:2rem;text-align:center;width:100%;">
          <div style="font-size:0.85rem;color:#94a3b8;margin-bottom:0.5rem;">Unscramble this word:</div>
          <div style="font-family:Orbitron,monospace;font-size:2.2rem;font-weight:900;color:#06b6d4;letter-spacing:8px;">${scrambled}</div>
          ${hint ? `<div style="font-size:0.85rem;color:#f59e0b;margin-top:0.5rem;">Hint: ${current[0]}_ _ _</div>` : ''}
        </div>
        ${flash ? `<div style="font-size:1.1rem;font-weight:700;color:${flashColor}">${flash}</div>` : '<div style="height:1.5rem"></div>'}
        <div style="display:flex;gap:0.8rem;width:100%;">
          <input id="word-input" type="text" placeholder="Type your answer..." autofocus maxlength="12"
            style="flex:1;background:rgba(255,255,255,0.07);border:2px solid rgba(6,182,212,0.4);border-radius:12px;padding:0.8rem 1rem;color:#fff;font-size:1.3rem;font-family:Orbitron,monospace;letter-spacing:4px;outline:none;text-align:center;text-transform:uppercase;"
            onkeydown="if(event.key==='Enter')window.wordSubmit()">
          <button onclick="window.wordSubmit()"
            style="background:linear-gradient(135deg,#06b6d4,#7c3aed);border:none;border-radius:12px;padding:0.8rem 1.4rem;color:#fff;font-weight:700;cursor:pointer;">
            ✓
          </button>
        </div>
        <div style="display:flex;gap:1rem;">
          <button onclick="window.wordHint()"
            style="background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.4);border-radius:50px;padding:0.5rem 1.2rem;color:#f59e0b;font-weight:600;cursor:pointer;">
            💡 Hint (-5pts)
          </button>
          <button onclick="window.wordSkip()"
            style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);border-radius:50px;padding:0.5rem 1.2rem;color:#ef4444;font-weight:600;cursor:pointer;">
            ⏭ Skip
          </button>
        </div>
      </div>`;
    document.getElementById('modal-score').textContent = score;
    const inp = document.getElementById('word-input');
    if (inp) inp.focus();
    window.wordSubmit = submit;
    window.wordHint = () => { hint = true; score = Math.max(0, score - 5); render(); };
    window.wordSkip = () => { streak = 0; flash = `Answer: ${current}`; flashColor = '#94a3b8'; nextWord(); setTimeout(() => { flash = ''; render(); }, 1000); };
  }
}

// ============================================================
// 18. DRAGON SLAYER
// ============================================================
function startDragon() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 480; canvas.height = 500;
  document.getElementById('modal-footer').innerHTML =
    `<div class="game-instructions"><span>Mouse / Arrow Keys</span> to dodge | <span>Click / Space</span> to attack!</div>`;

  let score = 0, dragonHp = 100, playerHp = 100, frame = 0, gameOver = false;
  let fireballs = [], attacks = [], particles = [];
  const player = { x: 240, y: 420, r: 18 };
  const dragon = { x: 240, y: 100, w: 120, h: 80, angle: 0 };
  let attackCooldown = 0, iFrames = 0;
  const keys = {};
  document.addEventListener('keydown', e => keys[e.key] = true);
  document.addEventListener('keyup', e => keys[e.key] = false);
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    player.x = Math.max(20, Math.min(canvas.width - 20, e.clientX - r.left));
    player.y = Math.max(300, Math.min(canvas.height - 20, e.clientY - r.top));
  });

  function attack() {
    if (attackCooldown > 0 || gameOver) return;
    attackCooldown = 25;
    attacks.push({ x: player.x, y: player.y - 20, vy: -10, life: 40 });
    // Particles
    for (let i = 0; i < 6; i++)
      particles.push({ x: player.x, y: player.y, vx: (Math.random() - 0.5) * 5, vy: -3 - Math.random() * 4, life: 20, color: '#7c3aed' });
  }

  canvas.addEventListener('click', attack);
  document.addEventListener('keydown', e => { if (e.key === ' ') attack(); });

  function spawnFireball() {
    const spread = (Math.random() - 0.5) * 300;
    fireballs.push({ x: dragon.x + spread, y: dragon.y + dragon.h, vx: (player.x - (dragon.x + spread)) * 0.015 + (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 2 });
  }

  function loop() {
    if (gameOver) return;
    currentGame = requestAnimationFrame(loop);
    frame++;

    // Player movement with keys
    if (keys['ArrowLeft'] || keys['a']) player.x = Math.max(20, player.x - 5);
    if (keys['ArrowRight'] || keys['d']) player.x = Math.min(canvas.width - 20, player.x + 5);
    if (keys['ArrowUp'] || keys['w']) player.y = Math.max(300, player.y - 5);
    if (keys['ArrowDown'] || keys['s']) player.y = Math.min(canvas.height - 20, player.y + 5);

    if (attackCooldown > 0) attackCooldown--;
    if (iFrames > 0) iFrames--;

    // Spawn fireballs
    if (frame % Math.max(35, 80 - Math.floor(score / 50) * 5) === 0) spawnFireball();
    dragon.angle = Math.sin(frame * 0.03) * 0.15;

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#1a0000'); bg.addColorStop(1, '#0a0010');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Lava ground
    ctx.fillStyle = '#3d0000'; ctx.fillRect(0, 460, canvas.width, 40);
    for (let i = 0; i < 8; i++) {
      const lx = (frame * 1.5 + i * 70) % (canvas.width + 40) - 20;
      ctx.fillStyle = `rgba(255,${80 + i * 15},0,0.6)`;
      ctx.beginPath(); ctx.ellipse(lx, 465, 25, 8, 0, 0, Math.PI * 2); ctx.fill();
    }

    // Dragon body
    ctx.save();
    ctx.translate(dragon.x, dragon.y + dragon.h / 2);
    ctx.rotate(dragon.angle);
    ctx.font = '90px serif'; ctx.textAlign = 'center';
    ctx.fillText('🐉', 0, 30);
    ctx.restore();

    // HP bars
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(50, 15, 160, 16);
    const hpW = (dragonHp / 100) * 160;
    const hpG = ctx.createLinearGradient(50, 0, 210, 0);
    hpG.addColorStop(0, '#ef4444'); hpG.addColorStop(1, '#f59e0b');
    ctx.fillStyle = hpG; ctx.fillRect(50, 15, hpW, 16);
    ctx.strokeStyle = 'rgba(255,0,0,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(50, 15, 160, 16);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Orbitron,monospace'; ctx.textAlign = 'left';
    ctx.fillText('🐉 ' + dragonHp + '%', 52, 27);

    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(270, 15, 160, 16);
    const plW = (playerHp / 100) * 160;
    ctx.fillStyle = '#10b981'; ctx.fillRect(270, 15, plW, 16);
    ctx.strokeStyle = 'rgba(0,200,100,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(270, 15, 160, 16);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Orbitron,monospace'; ctx.textAlign = 'left';
    ctx.fillText('⚔️ ' + playerHp + '%', 272, 27);

    // Attacks (player projectiles)
    attacks = attacks.filter(a => a.life > 0);
    attacks.forEach(a => {
      a.y += a.vy; a.life--;
      ctx.fillStyle = '#a78bfa'; ctx.shadowBlur = 15; ctx.shadowColor = '#7c3aed';
      ctx.beginPath(); ctx.arc(a.x, a.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      if (a.y < dragon.y + dragon.h && a.x > dragon.x - 60 && a.x < dragon.x + 60 && a.y > dragon.y - 20) {
        dragonHp -= 8; a.life = 0; score += 15;
        for (let i = 0; i < 5; i++)
          particles.push({ x: a.x, y: a.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 18, color: '#f59e0b' });
        if (dragonHp <= 0) { gameOver = true; showResult('⚔️', 'DRAGON SLAIN!', score, 'dragon'); }
      }
    });

    // Fireballs
    fireballs = fireballs.filter(f => f.y < canvas.height + 30);
    fireballs.forEach((f, i) => {
      f.x += f.vx; f.y += f.vy;
      ctx.font = '28px serif'; ctx.textAlign = 'center';
      ctx.fillText('🔥', f.x, f.y + 10);
      if (iFrames === 0 && Math.hypot(f.x - player.x, f.y - player.y) < 28) {
        fireballs.splice(i, 1); playerHp -= 12; iFrames = 40; score = Math.max(0, score - 5);
        if (playerHp <= 0) { gameOver = true; showResult('💀', 'DEFEATED!', score, 'dragon'); }
        for (let j = 0; j < 5; j++)
          particles.push({ x: player.x, y: player.y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 20, color: '#ef4444' });
      }
    });

    // Particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life--;
      ctx.globalAlpha = p.life / 20;
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Player knight
    ctx.font = '36px serif'; ctx.textAlign = 'center';
    if (iFrames > 0 && Math.floor(frame / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }
    ctx.fillText('🧙', player.x, player.y + 12);
    ctx.globalAlpha = 1;

    // Attack indicator
    if (attackCooldown === 0) {
      ctx.fillStyle = 'rgba(167,139,250,0.4)'; ctx.shadowBlur = 10; ctx.shadowColor = '#7c3aed';
      ctx.beginPath(); ctx.arc(player.x, player.y, 22, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }

    // Score
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Orbitron,monospace'; ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, canvas.width - 10, 38);
    document.getElementById('modal-score').textContent = score;
  }
  loop();
}
