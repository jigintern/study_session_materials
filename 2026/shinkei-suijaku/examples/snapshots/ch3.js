// =============================================
// 神経衰弱ゲーム — Chapter 3 まで終わった状態
// 追いつき用。script.js の中身をこれで丸ごと置き換えてください。
// スライドの手順どおりに書き足した場合の並びになっています。
// =============================================

// カードの絵柄 (8 種類 x 2 枚 = 16 枚)
const symbols = ["🍎", "🍌", "🍇", "🍓", "🍊", "🥝", "🍑", "🍍"];

// STUDENT [1-1]: symbols を 2 回連結して 16 枚の deck を作る
const deck = symbols.concat(symbols);

// STUDENT [2-1]: めくりの状態を持つ変数を用意する
let firstCard = null;    // 1 枚目にめくったカード
let secondCard = null;   // 2 枚目にめくったカード
let lockBoard = false;   // 2 枚めくったあとに他のカードを押させないためのロック

// STUDENT [1-2]: #board を取得して boardEl に入れる
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

  // STUDENT [2-3]: この 1 行を追加
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

// STUDENT [2-2]: フロー図に沿って書く
function handleCardClick(card) {
  if (lockBoard) return;
  if (card.classList.contains("flipped")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  // STUDENT [3-1]: 2 枚目がめくれたら判定する
  secondCard = card;

  const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

// STUDENT [3-2]: 一致したら matched クラスを付けて、次のターンへ
function handleMatch() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
  resetTurn();
}

// STUDENT [3-3]: 不一致は 800ms 待って伏せに戻す
function handleMismatch() {
  lockBoard = true;
  setTimeout(unflipCards, 800);
}

function unflipCards() {
  firstCard.classList.remove("flipped");
  secondCard.classList.remove("flipped");
  resetTurn();
}

// STUDENT [3-4]: 次のターンに備えて状態を戻す
function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}
