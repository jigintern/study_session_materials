// =============================================
// 応用課題の実装例 — 難易度切り替え (4×4 / 6×6 / 8×8)
// script.js の中身をこれで丸ごと置き換えると動きます。
// 完成コードから変えたところに CHANGED を付けています。
// =============================================

// CHANGED: 8×8 (32 ペア) まで足りるように絵柄を増やす
const ALL_SYMBOLS = [
  "🍎", "🍌", "🍇", "🍓", "🍊", "🥝", "🍑", "🍍",
  "🍒", "🥥", "🍐", "🍋", "🍉", "🥭", "🫐", "🍈",
  "🐕", "🐈", "🐇", "🐢", "🐠", "🦊", "🦉", "🐙",
  "🐝", "🐳", "🐧", "🐨", "🐼", "🦁", "🐸", "🦋",
];

// CHANGED: 難易度ごとの「列数」と「ペア数」をまとめて持つ
const LEVELS = {
  easy: { label: "4×4", cols: 4, pairs: 8 },
  normal: { label: "6×6", cols: 6, pairs: 18 },
  hard: { label: "8×8", cols: 8, pairs: 32 },
};

let currentLevel = "easy";

// CHANGED: 難易度で中身が変わるので const ではなく let
let symbols = ALL_SYMBOLS.slice(0, LEVELS[currentLevel].pairs);
let deck = shuffle(symbols.concat(symbols));

let firstCard = null;
let secondCard = null;
let lockBoard = false;

let moves = 0;
let matchedPairs = 0;
let timerId = null;
let startTime = 0;

// CHANGED: 応用課題「リセットの取りこぼし」の修正。難易度切り替えとは独立した直し
let unflipTimerId = null;

const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");
const clearMessageEl = document.getElementById("clear-message");
const boardEl = document.getElementById("board");

function createCard(symbol) {
  const card = document.createElement("div");
  card.className = "card";
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

  for (let i = 0; i < deck.length; i++) {
    const card = createCard(deck[i]);
    boardEl.appendChild(card);
  }
}

function handleCardClick(card) {
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
    clearMessageEl.textContent = `クリア！ ${moves}手 / ${timerEl.textContent}`;
  }
}

function handleMismatch() {
  lockBoard = true;
  unflipTimerId = setTimeout(unflipCards, 800);
}

function unflipCards() {
  firstCard.classList.remove("flipped");
  secondCard.classList.remove("flipped");
  resetTurn();
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

function startTimer() {
  startTime = Date.now();
  timerId = setInterval(renderTimer, 250);
}

function renderTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  timerEl.textContent = `${mm}:${ss}`;
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

// CHANGED: 難易度ボタンを JS 側で作って「もう一度」の隣に並べる。
// index.html も styles.css もさわらずに済ませたいので、
// 見た目だけ inline style で「もう一度」ボタンに合わせている。
function createLevelButtons() {
  const controls = document.getElementById("controls");
  controls.style.gap = "8px";

  const keys = Object.keys(LEVELS);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const btn = document.createElement("button");
    btn.textContent = LEVELS[key].label;
    btn.style.cssText =
      "background:rgba(255,255,255,0.25);color:#fff;border:none;" +
      "padding:12px 18px;border-radius:999px;font-size:15px;" +
      "font-weight:bold;cursor:pointer;";
    btn.addEventListener("click", () => selectLevel(key));
    controls.appendChild(btn);
  }
}

// CHANGED: 押された難易度に切り替えて作り直す。
// 2-3 のカードと同じで、渡したいもの (key) があるのでアロー関数で包んでいる。
function selectLevel(key) {
  currentLevel = key;
  resetGame();
}

// CHANGED: 難易度に合わせて symbols と列数を組み直してからリセットする
function resetGame() {
  stopTimer();
  clearTimeout(unflipTimerId);

  const level = LEVELS[currentLevel];
  symbols = ALL_SYMBOLS.slice(0, level.pairs);
  boardEl.style.gridTemplateColumns = `repeat(${level.cols}, 1fr)`;

  deck = shuffle(symbols.concat(symbols));
  resetTurn();
  moves = 0;
  matchedPairs = 0;
  timerEl.textContent = "00:00";
  movesEl.textContent = "0";
  pairsEl.textContent = `0 / ${symbols.length}`;
  clearMessageEl.textContent = "";
  renderBoard();
}

const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", resetGame);

createLevelButtons();
resetGame();
