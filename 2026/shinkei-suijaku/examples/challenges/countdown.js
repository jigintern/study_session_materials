// =============================================
// 応用課題の実装例 — カウントダウンモード (60 秒でクリアできなければゲームオーバー)
// script.js の中身をこれで丸ごと置き換えると動きます。
// 完成コードから変えたところに CHANGED を付けています。
// =============================================

const symbols = ["🍎", "🍌", "🍇", "🍓", "🍊", "🥝", "🍑", "🍍"];

let deck = shuffle(symbols.concat(symbols));

let firstCard = null;
let secondCard = null;
let lockBoard = false;

let moves = 0;
let matchedPairs = 0;
let timerId = null;
let startTime = 0;

// CHANGED: 制限時間と、時間切れになったかどうかの状態を足す
const TIME_LIMIT = 60;
let isGameOver = false;

const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");
const clearMessageEl = document.getElementById("clear-message");
const boardEl = document.getElementById("board");

function createCard(symbol, index) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.index = index;
  card.dataset.symbol = symbol;

  const inner = document.createElement("div");
  inner.className = "card-inner";
  const front = document.createElement("div");
  front.className = "card-front";
  front.textContent = "?";
  const back = document.createElement("div");
  back.className = "card-back";
  back.textContent = symbol;

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);

  card.addEventListener("click", () => handleCardClick(card));

  return card;
}

function renderBoard() {
  boardEl.replaceChildren();

  deck.forEach((symbol, index) => {
    const card = createCard(symbol, index);
    boardEl.appendChild(card);
  });
}

function handleCardClick(card) {
  // CHANGED: 時間切れのあとはクリックを一切受け付けない。
  // lockBoard は resetTurn で false に戻ってしまうので、別のフラグで見る。
  if (isGameOver) return;
  if (lockBoard) return;
  if (card.classList.contains("flipped")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    if (!timerId) startTimer();
    return;
  }

  secondCard = card;

  moves++;
  movesEl.textContent = moves;

  const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

function handleMatch() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
  matchedPairs++;
  pairsEl.textContent = `${matchedPairs} / ${symbols.length}`;
  resetTurn();

  if (matchedPairs === symbols.length) {
    stopTimer();
    clearMessageEl.textContent = `クリア！ ${moves}手 / 残り ${timerEl.textContent}`;
  }
}

function handleMismatch() {
  lockBoard = true;

  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetTurn();
  }, 800);
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// CHANGED: 経過時間ではなく「残り時間」を出す。0 になったらゲームオーバー。
function startTimer() {
  startTime = Date.now();
  timerId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, TIME_LIMIT - elapsed);
    const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
    const ss = String(remaining % 60).padStart(2, "0");
    timerEl.textContent = `${mm}:${ss}`;

    if (remaining === 0) gameOver();
  }, 250);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

// CHANGED: 時間切れの処理
function gameOver() {
  stopTimer();
  isGameOver = true;
  clearMessageEl.textContent = `時間切れ！ ${matchedPairs} / ${symbols.length} ペア`;
}

function resetGame() {
  stopTimer();
  deck = shuffle(symbols.concat(symbols));
  resetTurn();
  moves = 0;
  matchedPairs = 0;
  // CHANGED: 時間切れフラグを戻し、タイマー表示も制限時間から始める
  isGameOver = false;
  timerEl.textContent = `${String(Math.floor(TIME_LIMIT / 60)).padStart(2, "0")}:${String(TIME_LIMIT % 60).padStart(2, "0")}`;
  movesEl.textContent = "0";
  pairsEl.textContent = `0 / ${symbols.length}`;
  clearMessageEl.textContent = "";
  renderBoard();
}

const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", resetGame);

resetGame();
