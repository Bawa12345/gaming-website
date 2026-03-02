// ============================================================
// NEXUSPLAY — Main Site Logic
// ============================================================

// Particle background
function createParticles() {
    const container = document.getElementById('particles');
    const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 4 + 2;
        p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${8 + Math.random() * 14}s;
      animation-delay:${Math.random() * 10}s;
      border-radius:50%;
    `;
        container.appendChild(p);
    }
}
createParticles();

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    nav.style.background = window.scrollY > 60
        ? 'rgba(2,2,9,0.97)'
        : 'rgba(2,2,9,0.85)';
});

// Game data map
const GAME_MAP = {
    'car-racing': { title: '🏎️ Turbo Dash', fn: startCarRacing },
    'space-shooter': { title: '🚀 Galactic Blaster', fn: startSpaceShooter },
    'snake': { title: '🐍 Neon Snake', fn: startSnake },
    'sliding-puzzle': { title: '🧩 Slide Master', fn: startSlidingPuzzle },
    'cricket': { title: '🏏 Cricket Smash', fn: startCricket },
    'tictactoe': { title: '❌ Tic Tac Toe', fn: startTicTacToe },
    'pong': { title: '🏓 Neon Pong', fn: startPong },
    'memory': { title: '🃏 Memory Matrix', fn: startMemory },
    'flappy': { title: '🐦 Flappy Neon', fn: startFlappy },
    'breakout': { title: '🧱 Brick Breaker', fn: startBreakout },
    'zombie': { title: '🧟 Zombie Strike', fn: startZombie },
    'connect4': { title: '🔴 Connect Four', fn: startConnect4 },
    'whackamole': { title: '🦔 Whack-a-Mole', fn: startWhackaMole },
    'basketball': { title: '🏀 Hoop Blaster', fn: startBasketball },
    'mathblitz': { title: '🔢 Math Blitz', fn: startMathBlitz },
    'drift': { title: '🚗 Drift King', fn: startDrift },
    'wordscramble': { title: '📝 Word Scramble', fn: startWordScramble },
    'dragon': { title: '🐉 Dragon Slayer', fn: startDragon },
};

// Open a game
function openGame(id) {
    const game = GAME_MAP[id];
    if (!game) return;

    // Clean up previous
    cancelGame();

    const modal = document.getElementById('game-modal');
    modal.classList.add('open');
    document.getElementById('modal-title').textContent = game.title;
    document.getElementById('modal-score').textContent = '0';
    document.getElementById('modal-footer').innerHTML = '';
    document.getElementById('modal-title').dataset.gameId = id;

    // Reset canvas
    const canvas = document.getElementById('game-canvas');
    canvas.style.display = 'block';
    const ui = document.getElementById('game-ui');
    ui.innerHTML = '';
    ui.style.pointerEvents = 'none';

    // Remove any result overlays
    document.querySelectorAll('.result-overlay').forEach(el => el.remove());

    // Launch game
    setTimeout(() => game.fn(), 50);
}

// Close modal
function closeGame() {
    cancelGame();
    const modal = document.getElementById('game-modal');
    modal.classList.remove('open');
    document.getElementById('game-ui').innerHTML = '';
    document.getElementById('modal-footer').innerHTML = '';
    document.querySelectorAll('.result-overlay').forEach(el => el.remove());
}

// Cancel running game loop
function cancelGame() {
    if (typeof currentGame === 'number') {
        cancelAnimationFrame(currentGame);
        clearInterval(currentGame);
    } else if (currentGame) {
        clearInterval(currentGame);
    }
    currentGame = null;
}

// Filter games by category
function filterGames(cat) {
    document.querySelectorAll('.game-card').forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.classList.toggle('hidden', !show);
    });
    document.querySelectorAll('.cat-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.cat === cat);
    });
}

// Update leaderboard
function updateLeaderboard() {
    const grid = document.getElementById('leaderboard-grid');
    const scores = JSON.parse(localStorage.getItem('nexus_scores') || '{}');
    const icons = {
        'car-racing': '🏎️', 'space-shooter': '🚀', 'snake': '🐍', 'sliding-puzzle': '🧩',
        'cricket': '🏏', 'tictactoe': '❌', 'pong': '🏓', 'memory': '🃏',
        'flappy': '🐦', 'breakout': '🧱', 'zombie': '🧟', 'connect4': '🔴',
        'whackamole': '🦔', 'basketball': '🏀', 'mathblitz': '🔢',
        'drift': '🚗', 'wordscramble': '📝', 'dragon': '🐉'
    };
    const names = {
        'car-racing': 'Turbo Dash', 'space-shooter': 'Galactic Blaster', 'snake': 'Neon Snake',
        'sliding-puzzle': 'Slide Master', 'cricket': 'Cricket Smash', 'tictactoe': 'Tic Tac Toe',
        'pong': 'Neon Pong', 'memory': 'Memory Matrix', 'flappy': 'Flappy Neon',
        'breakout': 'Brick Breaker', 'zombie': 'Zombie Strike', 'connect4': 'Connect Four',
        'whackamole': 'Whack-a-Mole', 'basketball': 'Hoop Blaster', 'mathblitz': 'Math Blitz',
        'drift': 'Drift King', 'wordscramble': 'Word Scramble', 'dragon': 'Dragon Slayer'
    };

    if (!Object.keys(scores).length) {
        grid.innerHTML = '<div class="lb-empty">Play games to see your scores here!</div>';
        return;
    }

    grid.innerHTML = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .map(([id, score]) => `
      <div class="lb-card">
        <div class="lb-icon">${icons[id] || '🎮'}</div>
        <div class="lb-info">
          <div class="lb-game">${names[id] || id}</div>
          <div class="lb-score">${score} pts</div>
        </div>
      </div>`)
        .join('');

    // Update total
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    document.getElementById('total-score').textContent = total;
}

// Keyboard ESC to close modal
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeGame();
});

// Init
updateLeaderboard();

// Animate game cards on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, i * 80);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.game-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease';
    observer.observe(card);
});
