// =============================================
// 神経衰弱ゲーム — Chapter 4 まで終わった状態
// 追いつき用。script.js の中身をこれで丸ごと置き換えてください。
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

renderBoard();

// フロー図に沿って書く
function handleCardClick(card) {
  if (lockBoard) return;
  if (card.classList.contains("flipped")) return;

  card.classList.add("flipped");

  if (firstCard === null) {
    firstCard = card;
    return;
  }

  // 2 枚目がめくれたら判定する
  secondCard = card;

  const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

// 次のターンに備えて状態を戻す
function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

// 一致しなかったときは 800ms 待って伏せに戻す
function handleMismatch() {
  lockBoard = true;
  setTimeout(unflipCards, 800);
}

function unflipCards() {
  firstCard.classList.remove("flipped");
  secondCard.classList.remove("flipped");
  resetTurn();
}

// 一致したら matched クラスを付けて、次のターンへ
function handleMatch() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
  resetTurn();
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
