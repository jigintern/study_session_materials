// =============================================
// 神経衰弱ゲーム — Chapter 2 まで終わった状態
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

  // STUDENT [2-3]: この 1 行を追加
  card.addEventListener("click", () => handleCardClick(card));

  return card;
}

function renderBoard() {
  boardEl.replaceChildren(); // 中身を全部削除

  // deck の要素を 1 つずつ取り出して繰り返す
  deck.forEach((symbol, index) => {
    const card = createCard(symbol, index);
    boardEl.appendChild(card);
  });
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

  secondCard = card;
  // Chapter 3 でここに判定処理を書きます
}
