// =============================================
// 応用課題の実装例 — 状態を state にまとめて setState 経由でしか変えない
// script.js の中身をこれで丸ごと置き換えると動きます。
// 完成コードから変えたところに CHANGED を付けています。
//
// 変わるのは「状態の持ち方」だけで、遊べる内容は完成コードと同じです。
// 講座では moves++ と movesEl.textContent = moves の 2 行 1 セットを繰り返しましたが、
// ここでは setState({ moves: ... }) の 1 行で描画まで済みます。
//
// カードのめくり表示 (flipped / matched) は CSS アニメーションを活かしたいので、
// state ではなく DOM のクラスのままにしています。ここを state に寄せると
// めくるたびに盤面を作り直すことになり、アニメーションが再生されません。
// =============================================

const symbols = ["🍎", "🍌", "🍇", "🍓", "🍊", "🥝", "🍑", "🍍"];

// CHANGED: バラバラだった変数を 1 つのオブジェクトに集める
const state = {
  deck: [],
  firstCard: null,
  secondCard: null,
  lockBoard: false,
  moves: 0,
  matchedPairs: 0,
  timerId: null,
  startTime: 0,
  elapsed: 0,
  cleared: false,
};

const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");
const clearMessageEl = document.getElementById("clear-message");
const boardEl = document.getElementById("board");

// CHANGED: 状態を変える入口をここ 1 つに絞る。変えたら必ず描画も走る。
function setState(patch) {
  Object.assign(state, patch);
  render();
}

// CHANGED: 描画をここ 1 つにまとめる。state を読むだけで、state を変えない。
function render() {
  const mm = String(Math.floor(state.elapsed / 60)).padStart(2, "0");
  const ss = String(state.elapsed % 60).padStart(2, "0");

  timerEl.textContent = `${mm}:${ss}`;
  movesEl.textContent = state.moves;
  pairsEl.textContent = `${state.matchedPairs} / ${symbols.length}`;

  if (state.cleared) {
    clearMessageEl.textContent = `クリア！ ${state.moves}手 / ${mm}:${ss}`;
  } else {
    clearMessageEl.textContent = "";
  }
}

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

  for (let i = 0; i < state.deck.length; i++) {
    const card = createCard(state.deck[i]);
    boardEl.appendChild(card);
  }
}

function handleCardClick(card) {
  if (state.lockBoard) return;
  if (card.classList.contains("flipped")) return;

  card.classList.add("flipped");

  if (!state.firstCard) {
    setState({ firstCard: card });
    if (!state.timerId) startTimer();
    return;
  }

  // CHANGED: 2 枚目の記録と手数の更新が 1 回の setState で済む
  setState({ secondCard: card, moves: state.moves + 1 });

  const isMatch =
    state.firstCard.dataset.symbol === state.secondCard.dataset.symbol;

  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

function handleMatch() {
  state.firstCard.classList.add("matched");
  state.secondCard.classList.add("matched");

  const matchedPairs = state.matchedPairs + 1;
  const cleared = matchedPairs === symbols.length;

  setState({ matchedPairs, cleared });
  resetTurn();

  if (cleared) stopTimer();
}

function handleMismatch() {
  setState({ lockBoard: true });
  setTimeout(unflipCards, 800);
}

function unflipCards() {
  state.firstCard.classList.remove("flipped");
  state.secondCard.classList.remove("flipped");
  resetTurn();
}

function resetTurn() {
  setState({ firstCard: null, secondCard: null, lockBoard: false });
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
  setState({ startTime: Date.now() });
  setState({ timerId: setInterval(tickTimer, 250) });
}

// CHANGED: 表示の組み立ては render がやるので、ここは経過秒を更新するだけ
function tickTimer() {
  setState({ elapsed: Math.floor((Date.now() - state.startTime) / 1000) });
}

function stopTimer() {
  clearInterval(state.timerId);
  setState({ timerId: null });
}

// CHANGED: 初期化が 1 回の setState で済む。戻し忘れが起きにくい。
function resetGame() {
  stopTimer();

  setState({
    deck: shuffle(symbols.concat(symbols)),
    firstCard: null,
    secondCard: null,
    lockBoard: false,
    moves: 0,
    matchedPairs: 0,
    startTime: 0,
    elapsed: 0,
    cleared: false,
  });

  renderBoard();
}

const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", resetGame);

resetGame();
