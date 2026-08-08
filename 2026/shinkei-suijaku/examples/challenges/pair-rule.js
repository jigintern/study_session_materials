// =============================================
// 応用課題の実装例 — ペアの条件を変える (英単語 ↔ 和訳)
// script.js の中身をこれで丸ごと置き換えると動きます。
// 完成コードから変えたところに CHANGED を付けています。
//
// 「同じ絵柄」ではなく「相方どうし」でペアになります。
// 表に出す文字 (label) と、ペア判定に使う印 (pairId) を別々に持たせるのがコツです。
// PAIRS の中身を差し替えれば、元素記号と元素名、都道府県と県庁所在地にもなります。
// =============================================

// CHANGED: symbols の代わりに「相方の組」を並べる
const PAIRS = [
  ["dog", "犬"],
  ["cat", "猫"],
  ["bird", "鳥"],
  ["fish", "魚"],
  ["horse", "馬"],
  ["sheep", "羊"],
  ["mouse", "ねずみ"],
  ["rabbit", "うさぎ"],
];

// CHANGED: deck の中身が文字列ではなく { label, pairId } のオブジェクトになる
function buildDeck() {
  const cards = [];
  for (let pairId = 0; pairId < PAIRS.length; pairId++) {
    const pair = PAIRS[pairId];
    cards.push({ label: pair[0], pairId: pairId });
    cards.push({ label: pair[1], pairId: pairId });
  }
  return shuffle(cards);
}

let deck = buildDeck();

let firstCard = null;
let secondCard = null;
let lockBoard = false;

let moves = 0;
let matchedPairs = 0;
let timerId = null;
let startTime = 0;

// CHANGED: 応用課題「リセットの取りこぼし」の修正。ペアの条件とは独立した直し
let unflipTimerId = null;

const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");
const clearMessageEl = document.getElementById("clear-message");
const boardEl = document.getElementById("board");

// CHANGED: 受け取るのが絵柄 1 文字ではなく { label, pairId }
function createCard(cardData) {
  const card = document.createElement("div");
  card.className = "card";
  // CHANGED: 判定に使うのは表示文字ではなく pairId
  card.dataset.pairId = cardData.pairId;

  const inner = document.createElement("div");
  inner.className = "card-inner";
  const front = document.createElement("div");
  front.className = "card-front";
  front.textContent = "?";
  const back = document.createElement("div");
  back.className = "card-back";
  // CHANGED: 絵文字より長いので、はみ出さないよう文字を小さくする
  back.style.fontSize = "16px";
  back.textContent = cardData.label;

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

  // CHANGED: 「同じ絵柄か」ではなく「同じ組の相方か」を見る
  const isMatch = firstCard.dataset.pairId === secondCard.dataset.pairId;

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
  // CHANGED: 揃えるべき数は PAIRS の長さ
  pairsEl.textContent = `${matchedPairs} / ${PAIRS.length}`;
  resetTurn();

  if (matchedPairs === PAIRS.length) {
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

function resetGame() {
  stopTimer();
  clearTimeout(unflipTimerId);
  deck = buildDeck();
  resetTurn();
  moves = 0;
  matchedPairs = 0;
  timerEl.textContent = "00:00";
  movesEl.textContent = "0";
  pairsEl.textContent = `0 / ${PAIRS.length}`;
  clearMessageEl.textContent = "";
  renderBoard();
}

const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", resetGame);

resetGame();
