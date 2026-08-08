// =============================================
// 神経衰弱ゲーム — 完成コード
// スライドの手順どおりに書き足した場合の並びになっています。
// =============================================

// カードの絵柄 (8 種類 x 2 枚 = 16 枚)
const symbols = ["🍎", "🍌", "🍇", "🍓", "🍊", "🥝", "🍑", "🍍"];

// deck をシャッフルする。再代入するので const ではなく let
let deck = shuffle(symbols.concat(symbols));

// めくりの状態を持つ変数を用意する
let firstCard = null;    // 1 枚目にめくったカード
let secondCard = null;   // 2 枚目にめくったカード
let lockBoard = false;   // 2 枚めくったあとに他のカードを押させないためのロック

// 手数、ペア数、タイマー用の状態を用意
let moves = 0;
let matchedPairs = 0;
let timerId = null;
let startTime = 0;

const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");
const clearMessageEl = document.getElementById("clear-message");

// 盤面を取得して boardEl に入れる
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

  // この 1 行を追加
  card.addEventListener("click", () => handleCardClick(card));

  return card;
}

function renderBoard() {
  boardEl.replaceChildren(); // 中身を全部削除

  // deck の要素を 1 つずつ取り出して繰り返す
  for (let i = 0; i < deck.length; i++) {
    const card = createCard(deck[i]);
    boardEl.appendChild(card);
  }
}

// フロー図に沿って書く
function handleCardClick(card) {
  if (lockBoard) return;
  if (card.classList.contains("flipped")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    // 1 枚目をめくった瞬間にタイマー開始 (まだ動いていなければ)
    if (!timerId) startTimer();
    return;
  }

  // 2 枚目がめくれたら判定する
  secondCard = card;

  // 状態を変えたら、その場で描画も更新する
  moves++;
  movesEl.textContent = moves;

  const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

// 3-2 の handleMatch を書き換え。ペア数の更新と、全ペア揃ったらクリア
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

// 不一致は 800ms 待って伏せに戻す
function handleMismatch() {
  lockBoard = true;
  setTimeout(unflipCards, 800);
}

function unflipCards() {
  firstCard.classList.remove("flipped");
  secondCard.classList.remove("flipped");
  resetTurn();
}

// 次のターンに備えて状態を戻す
function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

// Fisher-Yates シャッフル
function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// タイマーの開始と停止
function startTimer() {
  startTime = Date.now();
  // 1000 ms 間隔だと秒表示のズレが目立つので少し細かめに回す
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

// ゲームを初期状態に戻す
function resetGame() {
  stopTimer();
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

// もう一度ボタンで resetGame を呼ぶ
const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", resetGame);

// 初回描画も resetGame に統一 (Chapter 1 で書いた renderBoard(); は削除)
resetGame();
