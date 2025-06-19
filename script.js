const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const board = document.getElementById('board');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const playBotBtn = document.getElementById('playBot');
const playFriendBtn = document.getElementById('playFriend');
const difficultySelect = document.getElementById('difficulty');
const themeToggle = document.getElementById('themeToggle');

const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');
const drawSound = document.getElementById('drawSound');
const restartSound = document.getElementById('restartSound');
const bgMusic = document.getElementById('bgMusic');
bgMusic.volume = 0.3;

let currentPlayer = 'X';
let gameState = Array(9).fill('');
let gameActive = true;
let vsBot = false;
let difficulty = 'hard';

const winningCombos = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '🌙' : '🌞';
});

playBotBtn.addEventListener('click', () => startGame(true));
playFriendBtn.addEventListener('click', () => startGame(false));
restartBtn.addEventListener('click', () => {
  restartSound.play();
  homeScreen.classList.add('active');
  gameScreen.classList.remove('active');
});

difficultySelect.addEventListener('change', () => {
  difficulty = difficultySelect.value;
});

function startGame(bot) {
  vsBot = bot;
  currentPlayer = 'X';
  gameState = Array(9).fill('');
  gameActive = true;
  homeScreen.classList.remove('active');
  gameScreen.classList.add('active');
  statusText.textContent = vsBot ? 'You play (X)' : `Player ${currentPlayer}'s Turn`;
  renderBoard();
}

function renderBoard() {
  board.innerHTML = '';
  gameState.forEach((val, i) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.textContent = val;
    if (val === 'X') cell.classList.add('x');
    if (val === 'O') cell.classList.add('o');
    cell.addEventListener('click', handleClick);
    board.appendChild(cell);
  });
}

function handleClick(e) {
  const idx = e.target.dataset.index;
  if (!gameActive || gameState[idx]) return;

  clickSound.play();
  gameState[idx] = currentPlayer;
  renderBoard();

  const winner = checkWinner();
  if (winner) {
    gameActive = false;
    highlightWinner();
    statusText.textContent = vsBot && currentPlayer === 'X' ? '🎉 You Win!' : `🎉 Player ${currentPlayer} Wins!`;
    (vsBot && currentPlayer === 'X') ? winSound.play() : loseSound.play();
    return;
  }

  if (!gameState.includes("")) {
    gameActive = false;
    statusText.textContent = "🤝 It's a Draw!";
    drawSound.play();
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusText.textContent = vsBot
    ? (currentPlayer === 'O' ? 'Bot is thinking...' : 'Your Turn (X)')
    : `Player ${currentPlayer}'s Turn`;

  if (vsBot && currentPlayer === 'O') {
    setTimeout(botMove, 400);
  }
}

function checkWinner() {
  for (const [a, b, c] of winningCombos) {
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      return gameState[a];
    }
  }
  return null;
}

function highlightWinner() {
  for (const [a, b, c] of winningCombos) {
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      [a, b, c].forEach(i => board.children[i].classList.add('winning'));
    }
  }
}

function botMove() {
  const move = getBotMove();
  gameState[move] = currentPlayer;
  renderBoard();

  const winner = checkWinner();
  if (winner) {
    gameActive = false;
    highlightWinner();
    statusText.textContent = '😈 Bot Wins!';
    loseSound.play();
    return;
  }

  if (!gameState.includes("")) {
    gameActive = false;
    statusText.textContent = "🤝 It's a Draw!";
    drawSound.play();
    return;
  }

  currentPlayer = 'X';
  statusText.textContent = 'Your Turn (X)';
}

function getBotMove() {
  if (difficulty === 'easy') {
    return getRandomMove();
  }
  if (difficulty === 'medium') {
    return Math.random() < 0.5 ? getBestMove() : getRandomMove();
  }
  return getBestMove();
}

function getRandomMove() {
  const empty = gameState.map((val, i) => val === '' ? i : null).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < gameState.length; i++) {
    if (gameState[i] === '') {
      gameState[i] = 'O';
      const score = minimax(gameState, 0, false);
      gameState[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(state, depth, isMax) {
  const winner = checkWinner();
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (!state.includes("")) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (state[i] === '') {
        state[i] = 'O';
        best = Math.max(best, minimax(state, depth + 1, false));
        state[i] = '';
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (state[i] === '') {
        state[i] = 'X';
        best = Math.min(best, minimax(state, depth + 1, true));
        state[i] = '';
      }
    }
    return best;
  }
}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then(() => {
    console.log("Service Worker Registered");
  });
}
