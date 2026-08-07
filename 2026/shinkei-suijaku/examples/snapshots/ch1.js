// =============================================
// 神経衰弱ゲーム — Chapter 1 まで終わった状態
// 追いつき用。script.js の中身をこれで丸ごと置き換えてください。
// スライドの手順どおりに書き足した場合の並びになっています。
// =============================================

// カードの絵柄 (8 種類 x 2 枚 = 16 枚)
const symbols = ["🍎", "🍌", "🍇", "🍓", "🍊", "🥝", "🍑", "🍍"];

// STUDENT [1-1]: symbols を 2 回連結して 16 枚の deck を作る
const deck = symbols.concat(symbols);

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
