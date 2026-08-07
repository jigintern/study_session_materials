// =============================================
// ライブ状態パネル + 先回り診断
// 画面右上に、いま script.js がどんな状態かをリアルタイム表示します。
// また、よくある typo やエラーを検出してヒントを出します。
// このファイルは触らなくて OK です。
// =============================================

(() => {
  // ---- スタイル -------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    #debug-panel {
      position: fixed;
      top: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.88);
      color: #e0f7fa;
      font-family: "SF Mono", Menlo, Consolas, monospace;
      font-size: 12px;
      line-height: 1.5;
      padding: 10px 14px;
      border-radius: 8px;
      z-index: 9999;
      width: 320px;
      max-height: calc(100vh - 24px);
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    #debug-panel .debug-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      cursor: pointer;
      user-select: none;
    }
    #debug-panel .debug-title {
      color: #80deea;
      font-weight: bold;
      letter-spacing: 1px;
      font-size: 11px;
    }
    #debug-panel .debug-toggle {
      color: #80deea;
      padding: 0 4px;
    }
    #debug-panel .debug-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    #debug-panel .debug-copy {
      color: #80deea;
      border: 1px solid #37474f;
      border-radius: 3px;
      padding: 1px 6px;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    #debug-panel .debug-copy:hover {
      background: rgba(128, 222, 234, 0.15);
    }
    #debug-panel .debug-copy.copied {
      color: #a5d6a7;
      border-color: #66bb6a;
    }
    #debug-panel .debug-section {
      color: #ffd54f;
      margin-top: 8px;
      font-size: 10px;
      letter-spacing: 1px;
    }
    #debug-panel pre {
      margin: 0;
      color: #e0f7fa;
      white-space: pre;
      font-family: inherit;
      font-size: 12px;
    }
    #debug-panel .diag-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    #debug-panel .diag-item {
      padding: 4px 6px;
      border-radius: 4px;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 11px;
      line-height: 1.4;
    }
    #debug-panel .diag-error {
      background: rgba(239, 83, 80, 0.18);
      color: #ffcdd2;
      border-left: 3px solid #ef5350;
    }
    #debug-panel .diag-hint {
      background: rgba(102, 187, 106, 0.18);
      color: #c8e6c9;
      border-left: 3px solid #66bb6a;
    }
    #debug-panel .diag-ok {
      color: #a5d6a7;
      font-size: 11px;
    }
    #debug-panel .test-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    #debug-panel .test-chapter {
      display: flex;
      justify-content: space-between;
      padding: 3px 6px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
    }
    #debug-panel .test-chapter-name { color: #e0f7fa; }
    #debug-panel .test-chapter-count { font-family: inherit; }
    #debug-panel .test-empty {
      background: rgba(255, 255, 255, 0.05);
      color: #90a4ae;
    }
    #debug-panel .test-partial {
      background: rgba(255, 167, 38, 0.15);
      color: #ffe0b2;
    }
    #debug-panel .test-done {
      background: rgba(102, 187, 106, 0.18);
      color: #c8e6c9;
    }
    #debug-panel .test-failed-list {
      padding: 2px 8px 4px 20px;
      font-size: 10.5px;
      color: #ffcdd2;
      line-height: 1.5;
    }
    #debug-panel .test-failed-list .fail {
      display: block;
      padding-left: 0;
    }
    #debug-panel.collapsed .debug-body {
      display: none;
    }
    #debug-panel.collapsed .debug-header {
      margin-bottom: 0;
    }
    #debug-panel .undefined {
      color: #ef9a9a;
    }
    #debug-panel .active {
      color: #a5d6a7;
    }
  `;
  document.head.appendChild(style);

  // ---- パネル構築 -----------------------------------------------------------
  const panel = document.createElement("div");
  panel.id = "debug-panel";
  panel.classList.add("collapsed");

  const header = document.createElement("div");
  header.className = "debug-header";
  const title = document.createElement("span");
  title.className = "debug-title";
  title.textContent = "デバッグ情報";
  const copyBtn = document.createElement("span");
  copyBtn.className = "debug-copy";
  copyBtn.textContent = "コピー";
  copyBtn.title = "現在のデバッグ情報をコピー (講師への共有用)";

  const toggle = document.createElement("span");
  toggle.className = "debug-toggle";
  toggle.textContent = "▶";

  const actions = document.createElement("span");
  actions.className = "debug-actions";
  actions.append(copyBtn, toggle);

  header.append(title, actions);

  const body = document.createElement("div");
  body.className = "debug-body";

  const varsSection = document.createElement("div");
  varsSection.className = "debug-section";
  varsSection.textContent = "変数など";
  const varsPre = document.createElement("pre");

  const domSection = document.createElement("div");
  domSection.className = "debug-section";
  domSection.textContent = "盤面 (DOM)";
  const domPre = document.createElement("pre");

  const diagSection = document.createElement("div");
  diagSection.className = "debug-section";
  diagSection.textContent = "診断";
  const diagList = document.createElement("div");
  diagList.className = "diag-list";

  const testSection = document.createElement("div");
  testSection.className = "debug-section";
  testSection.textContent = "章ごとのテスト";
  const testList = document.createElement("div");
  testList.className = "test-list";

  body.append(varsSection, varsPre, domSection, domPre, diagSection, diagList, testSection, testList);
  panel.append(header, body);

  const mount = () => {
    if (document.body) {
      document.body.appendChild(panel);
    } else {
      document.addEventListener("DOMContentLoaded", () => document.body.appendChild(panel));
    }
  };
  mount();

  header.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    toggle.textContent = panel.classList.contains("collapsed") ? "▶" : "▼";
  });

  // ---- 変数リーダー ---------------------------------------------------------
  const UNDEF = Symbol("undef");
  const readers = {
    deck: () => (typeof deck !== "undefined" ? deck : UNDEF),
    firstCard: () => (typeof firstCard !== "undefined" ? firstCard : UNDEF),
    secondCard: () => (typeof secondCard !== "undefined" ? secondCard : UNDEF),
    lockBoard: () => (typeof lockBoard !== "undefined" ? lockBoard : UNDEF),
    moves: () => (typeof moves !== "undefined" ? moves : UNDEF),
    matchedPairs: () => (typeof matchedPairs !== "undefined" ? matchedPairs : UNDEF),
    timerId: () => (typeof timerId !== "undefined" ? timerId : UNDEF),
  };

  const safeRead = (name) => {
    try {
      const v = readers[name]();
      if (v === UNDEF) return UNDEF;
      // ブラウザは id を持つ要素を window.<id> として自動グローバル化します。
      // 参加者がまだ `let name` を宣言していない段階では、その自動グローバルを
      // 拾ってしまうため、値が id 一致の Element なら未定義扱いにします。
      if (v instanceof Element && document.getElementById(name) === v) {
        return UNDEF;
      }
      return v;
    } catch (e) {
      return UNDEF;
    }
  };

  // 同じ絵柄のカードが 2 枚あるので、絵柄だけでは firstCard と secondCard が
  // 別の 2 枚なのか同じカードなのか区別できません。盤面での位置を添えて見分けます。
  // renderBoard は deck の順に appendChild していくだけで並べ替えないので、
  // 親の中での位置が deck のインデックスと一致します。
  const cardPosition = (el) =>
    el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : -1;

  const appendValue = (parent, v) => {
    if (v === UNDEF) {
      const s = document.createElement("span");
      s.className = "undefined";
      s.textContent = "(未定義)";
      parent.appendChild(s);
      return;
    }
    if (v === null) {
      parent.appendChild(document.createTextNode("null"));
      return;
    }
    if (v === undefined) {
      parent.appendChild(document.createTextNode("undefined"));
      return;
    }
    if (typeof v === "boolean") {
      if (v) {
        const s = document.createElement("span");
        s.className = "active";
        s.textContent = "true";
        parent.appendChild(s);
      } else {
        parent.appendChild(document.createTextNode("false"));
      }
      return;
    }
    if (typeof v === "number") {
      parent.appendChild(document.createTextNode(String(v)));
      return;
    }
    if (typeof v === "string") {
      parent.appendChild(document.createTextNode(JSON.stringify(v)));
      return;
    }
    if (Array.isArray(v)) {
      parent.appendChild(document.createTextNode(`[Array length=${v.length}]`));
      return;
    }
    if (v instanceof Element) {
      const sym = v.dataset ? v.dataset.symbol : undefined;
      const text = sym !== undefined ? `Card(${sym} @${cardPosition(v)})` : `<${v.tagName.toLowerCase()}>`;
      parent.appendChild(document.createTextNode(text));
      return;
    }
    parent.appendChild(document.createTextNode(Object.prototype.toString.call(v)));
  };

  const renderLine = (parent, label, value, width = 14) => {
    const padded = label + " ".repeat(Math.max(0, width - label.length));
    parent.appendChild(document.createTextNode(`${padded}= `));
    appendValue(parent, value);
    parent.appendChild(document.createTextNode("\n"));
  };

  // ---- ユーザー宣言の追跡 ---------------------------------------------------
  // script.js の宣言 (let/const/var/function) を定期的に拾って、
  // ReferenceError 時に「もしかして X?」の候補として使う。
  // 加えて「宣言されているが一度も使われていない名前」を検出する。
  // 宣言側が typo (const elaapsed = ..., 以降 elapsed で参照) の場合、
  // 素直に "もしかして elaapsed?" と出すと typo に誘導してしまうので、
  // 未使用の宣言が候補になったときは方向を反転して「宣言側を直す?」と出す。
  let userDeclarations = new Set();
  let unusedDeclarations = new Set();

  const collectDeclarations = (src) => {
    const stripped = src
      .replace(/\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/"(?:\\.|[^"\\])*"/g, '""')
      .replace(/'(?:\\.|[^'\\])*'/g, "''")
      .replace(/`(?:\\.|[^`\\])*`/g, "``");

    const declCounts = new Map();
    for (const m of stripped.matchAll(/\b(?:let|const|var|function)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g)) {
      declCounts.set(m[1], (declCounts.get(m[1]) || 0) + 1);
    }

    // メソッド (.foo) を除いた識別子の総出現数。宣言そのものの位置も含む。
    const idCounts = new Map();
    for (const m of stripped.matchAll(/(^|[^.a-zA-Z0-9_$])([a-zA-Z_$][a-zA-Z0-9_$]*)/g)) {
      idCounts.set(m[2], (idCounts.get(m[2]) || 0) + 1);
    }

    const declared = new Set(declCounts.keys());
    const unused = new Set();
    for (const name of declared) {
      // 総出現数が宣言回数と等しい = どこからも参照されていない
      if ((idCounts.get(name) || 0) <= declCounts.get(name)) unused.add(name);
    }
    return { declared, unused };
  };

  const refreshUserDeclarations = async () => {
    try {
      const res = await fetch("script.js", { cache: "no-store" });
      if (!res.ok) return;
      const raw = await res.text();
      const { declared, unused } = collectDeclarations(raw);
      userDeclarations = declared;
      unusedDeclarations = unused;
    } catch (e) {
      // fetch できない環境 (file:// など) では無視
    }
  };

  refreshUserDeclarations();
  setInterval(refreshUserDeclarations, 3000);

  const levenshtein = (a, b) => {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 3) return 99;
    const dp = new Array(n + 1);
    for (let j = 0; j <= n; j++) dp[j] = j;
    for (let i = 1; i <= m; i++) {
      let prev = dp[0];
      dp[0] = i;
      for (let j = 1; j <= n; j++) {
        const tmp = dp[j];
        if (a[i - 1] === b[j - 1]) dp[j] = prev;
        else dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
        prev = tmp;
      }
    }
    return dp[n];
  };

  // 6 文字以上なら距離 2 まで、5 文字以下は距離 1 のみ許容 (短い名前ほど誤検出が増えるため)
  const findClosest = (name, candidates) => {
    let best = null;
    let bestD = Infinity;
    for (const c of candidates) {
      const d = levenshtein(name.toLowerCase(), c.toLowerCase());
      const maxAllowed = Math.min(name.length, c.length) >= 6 ? 2 : 1;
      if (d >= 1 && d <= maxAllowed && d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return best;
  };

  // ReferenceError メッセージから未定義の識別子名を抽出。
  // Chrome/Firefox: "X is not defined" / Safari: "Can't find variable: X"
  const extractMissingName = (message) => {
    const m1 = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s+is not defined/.exec(message);
    if (m1) return m1[1];
    const m2 = /Can't find variable:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/.exec(message);
    if (m2) return m2[1];
    return null;
  };

  const buildHint = (missing) => {
    if (!missing) return null;
    const candidate = findClosest(missing, [...userDeclarations]);
    if (!candidate) return null;
    // 候補が宣言されただけで使われていない場合、宣言側が typo である可能性が高い
    if (unusedDeclarations.has(candidate)) {
      return `宣言 "${candidate}" を "${missing}" にしたい?`;
    }
    return `もしかして "${candidate}"?`;
  };

  // ---- エラー捕捉 -----------------------------------------------------------
  // 同一 (message, file, line) は 1 エントリにまとめて count を増やす。
  // setInterval 内のエラーで同じメッセージが積み上がってヒントが埋もれるのを防ぐ。
  const errors = [];
  const pushError = (message, file, line) => {
    const shortFile = (file || "").split("/").pop() || "?";
    const text = String(message).slice(0, 200);
    const lineNo = line || 0;
    const existingIdx = errors.findIndex((e) => e.message === text && e.file === shortFile && e.line === lineNo);
    if (existingIdx >= 0) {
      const existing = errors[existingIdx];
      existing.count++;
      // 最新の発生位置に並べ替えてヒントが常に見える位置に
      errors.splice(existingIdx, 1);
      errors.push(existing);
      return;
    }
    const hint = buildHint(extractMissingName(text));
    errors.push({ message: text, file: shortFile, line: lineNo, hint, count: 1 });
    while (errors.length > 3) errors.shift();
  };
  // パネルが見えなくなる環境 (StackBlitz のエラー UI 表示中など) のフォールバック。
  // エラー時にスナップショットを Console にも自動で流し、選択して手動コピーできるようにする。
  // 同じ発火で連発しないよう 3 秒のデバウンスを掛ける。
  // 初回発火が debounce で潰れないよう -Infinity で初期化する (0 だと直後のエラーで
  // performance.now() が数百 ms しか進んでおらず debounce が掛かってしまう)。
  let lastAutoDump = -Infinity;
  const autoDumpSnapshot = () => {
    const now = performance.now();
    if (now - lastAutoDump < 3000) return;
    lastAutoDump = now;
    try {
      console.log("[debug] スナップショット (以下を選択してコピー、講師に貼り付け):");
      console.log(buildSnapshot());
    } catch (_) { /* buildSnapshot 自身が失敗しても続行 */ }
  };

  window.addEventListener("error", (ev) => {
    pushError(ev.message || ev.error, ev.filename, ev.lineno);
    autoDumpSnapshot();
  });
  window.addEventListener("unhandledrejection", (ev) => {
    pushError(`Unhandled rejection: ${ev.reason}`, "?", 0);
    autoDumpSnapshot();
  });

  // ---- ラッパー (静かに壊れる typo の検知) ------------------------------------
  // getElementById と addEventListener を wrap し、id やイベント名の typo で
  // 静かに壊れる (エラーが出ずに動作しない) パターンを検出する。
  // debug.js 自身の呼び出しは無視し、script.js からの呼び出しでだけ警告する。

  const findCallerInScript = () => {
    const stack = new Error().stack || "";
    const m = stack.match(/script\.js[^\d]*(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  };

  // DOM3 Events + HTML5 で頻出するイベント名の集合。カスタムイベントを使わない教材前提。
  const KNOWN_EVENTS = new Set([
    "click", "dblclick", "auxclick", "contextmenu",
    "mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseover", "mouseout",
    "keydown", "keyup", "keypress",
    "input", "change", "submit", "reset", "focus", "blur", "focusin", "focusout", "select",
    "load", "unload", "beforeunload", "DOMContentLoaded", "readystatechange", "pageshow", "pagehide",
    "resize", "scroll", "wheel",
    "touchstart", "touchend", "touchmove", "touchcancel",
    "pointerdown", "pointerup", "pointermove", "pointerenter", "pointerleave", "pointerover", "pointerout", "pointercancel",
    "dragstart", "drag", "dragend", "dragenter", "dragleave", "dragover", "drop",
    "animationstart", "animationend", "animationiteration", "animationcancel",
    "transitionstart", "transitionend", "transitionrun", "transitioncancel",
    "error", "abort", "loadstart", "loadend", "progress",
    "play", "pause", "ended", "timeupdate", "volumechange", "canplay", "canplaythrough",
    "copy", "cut", "paste",
    "message", "messageerror", "storage",
    "online", "offline", "visibilitychange", "hashchange", "popstate",
  ]);

  const _getElementById = document.getElementById.bind(document);
  document.getElementById = function (id) {
    const el = _getElementById(id);
    if (!el) {
      const callerLine = findCallerInScript();
      if (callerLine > 0) {
        const knownIds = [];
        for (const n of document.querySelectorAll("[id]")) knownIds.push(n.id);
        const near = findClosest(id, knownIds);
        const msg = near
          ? `getElementById("${id}") が null。もしかして "${near}"?`
          : `getElementById("${id}") が null。HTML に該当する id がありません`;
        pushError(msg, "script.js", callerLine);
        // パネルが見えない環境 (StackBlitz のエラー UI 表示中など) のフォールバック
        console.warn(`[debug] ${msg} (script.js:${callerLine})`);
      }
    }
    return el;
  };

  const _addEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (typeof type === "string" && !KNOWN_EVENTS.has(type)) {
      const callerLine = findCallerInScript();
      if (callerLine > 0) {
        const near = findClosest(type, [...KNOWN_EVENTS]);
        if (near) {
          const msg = `addEventListener("${type}") は未知のイベント。もしかして "${near}"?`;
          pushError(msg, "script.js", callerLine);
          console.warn(`[debug] ${msg} (script.js:${callerLine})`);
        }
      }
    }
    return _addEventListener.call(this, type, listener, options);
  };

  // ---- ヒント (状況起点) -----------------------------------------------------
  const computeHints = () => {
    const hints = [];
    const hasFn = (name) => typeof window[name] === "function";
    const board = document.getElementById("board");
    const cardCount = board ? board.querySelectorAll(".card").length : 0;
    const deck = safeRead("deck");

    if (hasFn("createCard") && hasFn("renderBoard") && cardCount === 0) {
      hints.push("createCard と renderBoard は定義済みですが盤面が空です。ファイル末尾で renderBoard() (または resetGame()) を呼びましたか?");
    }
    if (deck !== UNDEF && Array.isArray(deck) && deck.length > 0 && deck.length !== 16) {
      if (deck.length === 8) {
        hints.push("deck の長さが 8 です。symbols を 2 回連結し忘れていませんか? symbols.concat(symbols)");
      } else {
        hints.push(`deck の長さが ${deck.length} です。16 になるように symbols.concat(symbols) を確認してください。`);
      }
    }
    if (hasFn("handleCardClick") && cardCount > 0 && board) {
      const anyListener = board.querySelector(".card");
      // クリックが繋がっているかは直接見れないが、firstCard/secondCard の変化で推測
      // ここでは、めくれる時に flipped が付くはずと想定
    }
    return hints;
  };

  // ---- 描画 ------------------------------------------------------------------
  const renderDiagnostics = () => {
    diagList.replaceChildren();
    const items = [];
    for (let i = errors.length - 1; i >= 0; i--) {
      const e = errors[i];
      const suffix = e.count > 1 ? ` (×${e.count})` : "";
      const base = `⚠ ${e.message}${suffix}\n   at ${e.file}:${e.line}`;
      const text = e.hint ? `${base}\n   → ${e.hint}` : base;
      items.push({ cls: "diag-error", text });
    }
    for (const h of computeHints()) {
      items.push({ cls: "diag-hint", text: `→ ${h}` });
    }
    if (items.length === 0) {
      const ok = document.createElement("div");
      ok.className = "diag-ok";
      ok.textContent = "問題なし";
      diagList.appendChild(ok);
      return;
    }
    for (const item of items) {
      const div = document.createElement("div");
      div.className = `diag-item ${item.cls}`;
      div.textContent = item.text;
      diagList.appendChild(div);
    }
  };

  // ---- Chapter tests -------------------------------------------------------
  // 各テストは boolean を返す関数。エラーは try/catch で fail 扱いにする。
  // 副作用の大きい関数 (handleCardClick, resetGame, renderBoard, startTimer など) は
  // 「呼ぶ」テストにしない。定義有無だけを見る。
  const TESTS = {
    "Chapter 1": [
      { desc: "deck が配列である", fn: () => typeof deck !== "undefined" && Array.isArray(deck) },
      { desc: "deck の長さが 16", fn: () => Array.isArray(deck) && deck.length === 16 },
      { desc: "deck に絵柄が 2 枚ずつある", fn: () => {
        if (!Array.isArray(deck) || deck.length !== 16) return false;
        const counts = new Map();
        for (const s of deck) counts.set(s, (counts.get(s) || 0) + 1);
        return counts.size === 8 && [...counts.values()].every((n) => n === 2);
      } },
      { desc: "boardEl が #board 要素", fn: () => typeof boardEl !== "undefined" && boardEl instanceof Element && boardEl.id === "board" },
      { desc: "createCard 関数が定義されている", fn: () => typeof window.createCard === "function" },
      { desc: "createCard('🍎') が Element を返す", fn: () => window.createCard("🍎") instanceof Element },
      { desc: "createCard の返り値に data-symbol が入る", fn: () => window.createCard("🍎").dataset.symbol === "🍎" },
      { desc: "createCard の返り値に card クラスが付く", fn: () => window.createCard("🍎").classList.contains("card") },
      { desc: "renderBoard 関数が定義されている", fn: () => typeof window.renderBoard === "function" },
      { desc: "盤面に 16 枚のカードが並んでいる", fn: () => document.querySelectorAll("#board .card").length === 16 },
    ],
    "Chapter 2": [
      { desc: "firstCard 変数が定義されている", fn: () => typeof firstCard !== "undefined" },
      { desc: "secondCard 変数が定義されている", fn: () => typeof secondCard !== "undefined" },
      { desc: "lockBoard 変数が boolean", fn: () => typeof lockBoard === "boolean" },
      { desc: "handleCardClick 関数が定義されている", fn: () => typeof window.handleCardClick === "function" },
    ],
    "Chapter 3": [
      { desc: "handleMatch 関数が定義されている", fn: () => typeof window.handleMatch === "function" },
      { desc: "handleMismatch 関数が定義されている", fn: () => typeof window.handleMismatch === "function" },
      { desc: "unflipCards 関数が定義されている", fn: () => typeof window.unflipCards === "function" },
      { desc: "resetTurn 関数が定義されている", fn: () => typeof window.resetTurn === "function" },
    ],
    "Chapter 4": [
      { desc: "shuffle 関数が定義されている", fn: () => typeof window.shuffle === "function" },
      { desc: "shuffle は元配列を破壊しない", fn: () => {
        const arr = [1, 2, 3, 4, 5];
        const snap = arr.slice();
        window.shuffle(arr);
        return arr.length === snap.length && arr.every((v, i) => v === snap[i]);
      } },
      { desc: "shuffle は同じ要素集合を返す", fn: () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8];
        const result = window.shuffle(arr);
        if (!Array.isArray(result) || result.length !== arr.length) return false;
        const s1 = arr.slice().sort();
        const s2 = result.slice().sort();
        return s1.every((v, i) => v === s2[i]);
      } },
      { desc: "shuffle は 20 回で少なくとも 1 回は並びを変える", fn: () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8];
        for (let i = 0; i < 20; i++) {
          const r = window.shuffle(arr);
          if (r.some((v, j) => v !== arr[j])) return true;
        }
        return false;
      } },
    ],
    "Chapter 5": [
      { desc: "moves 変数が number", fn: () => typeof moves === "number" },
      { desc: "matchedPairs 変数が number", fn: () => typeof matchedPairs === "number" },
      { desc: "timerId 変数が定義されている", fn: () => typeof timerId !== "undefined" },
      { desc: "timerEl が #timer 要素", fn: () => typeof timerEl !== "undefined" && timerEl instanceof Element && timerEl.id === "timer" },
      { desc: "movesEl が #moves 要素", fn: () => typeof movesEl !== "undefined" && movesEl instanceof Element && movesEl.id === "moves" },
      { desc: "pairsEl が #pairs 要素", fn: () => typeof pairsEl !== "undefined" && pairsEl instanceof Element && pairsEl.id === "pairs" },
      { desc: "clearMessageEl が #clear-message 要素", fn: () => typeof clearMessageEl !== "undefined" && clearMessageEl instanceof Element && clearMessageEl.id === "clear-message" },
      { desc: "startTimer 関数が定義されている", fn: () => typeof window.startTimer === "function" },
      { desc: "renderTimer 関数が定義されている", fn: () => typeof window.renderTimer === "function" },
      { desc: "stopTimer 関数が定義されている", fn: () => typeof window.stopTimer === "function" },
    ],
    "Chapter 6": [
      { desc: "resetGame 関数が定義されている", fn: () => typeof window.resetGame === "function" },
      { desc: "resetBtn 変数が定義されている", fn: () => typeof resetBtn !== "undefined" && resetBtn instanceof Element },
    ],
  };

  const runTests = () => {
    const results = {};
    for (const [chapter, tests] of Object.entries(TESTS)) {
      results[chapter] = [];
      for (const t of tests) {
        let ok = false;
        try {
          ok = !!t.fn();
        } catch (e) {
          ok = false;
        }
        results[chapter].push({ desc: t.desc, ok });
      }
    }
    return results;
  };

  const expandedChapters = new Set();

  const renderTests = () => {
    testList.replaceChildren();
    const results = runTests();
    for (const [chapter, arr] of Object.entries(results)) {
      const passed = arr.filter((r) => r.ok).length;
      const total = arr.length;
      const row = document.createElement("div");
      row.className = "test-chapter";
      if (passed === 0) row.classList.add("test-empty");
      else if (passed < total) row.classList.add("test-partial");
      else row.classList.add("test-done");

      const name = document.createElement("span");
      name.className = "test-chapter-name";
      name.textContent = chapter;

      const count = document.createElement("span");
      count.className = "test-chapter-count";
      count.textContent = passed === total ? `${passed}/${total} ✓` : `${passed}/${total}`;

      row.append(name, count);
      row.addEventListener("click", () => {
        if (expandedChapters.has(chapter)) expandedChapters.delete(chapter);
        else expandedChapters.add(chapter);
        renderTests();
      });
      testList.appendChild(row);

      // 落ちているテストは自動で展開、また参加者クリックで全展開
      const shouldExpand = expandedChapters.has(chapter) || (passed > 0 && passed < total);
      if (shouldExpand) {
        const failList = document.createElement("div");
        failList.className = "test-failed-list";
        for (const r of arr) {
          const line = document.createElement("span");
          line.className = "fail";
          line.textContent = `${r.ok ? "✓" : "✗"} ${r.desc}`;
          if (r.ok) line.style.color = "#a5d6a7";
          failList.appendChild(line);
        }
        testList.appendChild(failList);
      }
    }
  };

  // ---- 共有用スナップショット -----------------------------------------------
  const formatValueText = (v) => {
    if (v === UNDEF) return "(未定義)";
    if (v === null) return "null";
    if (v === undefined) return "undefined";
    if (typeof v === "boolean") return String(v);
    if (typeof v === "number") return String(v);
    if (typeof v === "string") return JSON.stringify(v);
    if (Array.isArray(v)) return `[Array length=${v.length}]`;
    if (v instanceof Element) {
      const sym = v.dataset ? v.dataset.symbol : undefined;
      return sym !== undefined ? `Card(${sym} @${cardPosition(v)})` : `<${v.tagName.toLowerCase()}>`;
    }
    return Object.prototype.toString.call(v);
  };

  // Zoom チャットの上限 1024 文字に収める。長すぎたら段階的に情報を落とす:
  //   1. エラーの詳細行 (at ..., → ヒント) を 1 行にまとめる
  //   2. 落ちたテストの一覧を先頭 N 件に絞る
  //   3. それでも超えたら末尾を切って "... (省略)" を付ける
  const MAX_LENGTH = 1000;

  const buildSnapshot = () => {
    const varLines = Object.keys(readers).map((name) => `${name}=${formatValueText(safeRead(name))}`);

    const board = document.getElementById("board");
    const boardLine = board
      ? `cards=${board.querySelectorAll(".card").length}, flipped=${board.querySelectorAll(".card.flipped").length}, matched=${board.querySelectorAll(".card.matched").length}`
      : "#board が見つかりません";

    const diagFull = [];
    const diagShort = [];
    for (let i = errors.length - 1; i >= 0; i--) {
      const e = errors[i];
      const suffix = e.count > 1 ? ` (×${e.count})` : "";
      const head = `⚠ ${e.message}${suffix} @${e.file}:${e.line}`;
      diagFull.push(e.hint ? `${head}\n  → ${e.hint}` : head);
      diagShort.push(e.hint ? `${head} [${e.hint}]` : head);
    }
    for (const h of computeHints()) {
      diagFull.push(`→ ${h}`);
      diagShort.push(`→ ${h}`);
    }

    const results = runTests();
    const testSummary = Object.entries(results).map(([chapter, arr]) => {
      const passed = arr.filter((r) => r.ok).length;
      const total = arr.length;
      return `${chapter.replace("Chapter ", "Ch")} ${passed}/${total}${passed === total ? "✓" : ""}`;
    });
    const failedTests = [];
    for (const [chapter, arr] of Object.entries(results)) {
      const short = chapter.replace("Chapter ", "Ch");
      for (const r of arr) {
        if (!r.ok) failedTests.push(`  ${short} ✗ ${r.desc}`);
      }
    }

    const assemble = ({ compactDiag, failLimit }) => {
      const parts = ["=== デバッグ情報 ==="];
      parts.push("[変数]", ...varLines);
      parts.push("[盤面] " + boardLine);
      parts.push("[診断]");
      const diags = compactDiag ? diagShort : diagFull;
      parts.push(diags.length === 0 ? "問題なし" : diags.join("\n"));
      parts.push("[テスト] " + testSummary.join(", "));
      const shown = failedTests.slice(0, failLimit);
      if (shown.length > 0) parts.push(shown.join("\n"));
      if (failedTests.length > shown.length) {
        parts.push(`  ... ほか ${failedTests.length - shown.length} 件`);
      }
      return parts.join("\n");
    };

    const attempts = [
      { compactDiag: false, failLimit: Infinity },
      { compactDiag: true, failLimit: Infinity },
      { compactDiag: true, failLimit: 8 },
      { compactDiag: true, failLimit: 3 },
      { compactDiag: true, failLimit: 0 },
    ];
    for (const opts of attempts) {
      const text = assemble(opts);
      if (text.length <= MAX_LENGTH) return text;
    }
    const last = assemble({ compactDiag: true, failLimit: 0 });
    return last.slice(0, MAX_LENGTH - 15) + "\n... (省略)";
  };

  copyBtn.addEventListener("click", async (ev) => {
    ev.stopPropagation();
    const text = buildSnapshot();
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "コピー済";
      copyBtn.classList.add("copied");
    } catch (e) {
      copyBtn.textContent = "失敗";
    }
    setTimeout(() => {
      copyBtn.textContent = "コピー";
      copyBtn.classList.remove("copied");
    }, 1500);
  });

  // パネルが見えない環境 (StackBlitz のエラー UI 表示中など) の on-demand フォールバック。
  // Console から呼び出せばスナップショットを再出力する。navigator.clipboard.writeText も
  // 試すが、user gesture がないと Chrome/Edge では拒否されるので、Console 出力からの
  // 手動選択コピーを主経路として案内する。
  window.copyDebugInfo = () => {
    const text = buildSnapshot();
    navigator.clipboard.writeText(text).then(
      () => console.log("[debug] クリップボードにコピーしました。講師に貼り付けてください。"),
      () => console.log("[debug] 自動コピー不可。下の出力を選択して手動コピーしてください。")
    );
    console.log(text);
    return text;
  };

  const update = () => {
    varsPre.replaceChildren();
    for (const name of Object.keys(readers)) {
      renderLine(varsPre, name, safeRead(name));
    }

    domPre.replaceChildren();
    const board = document.getElementById("board");
    if (!board) {
      const s = document.createElement("span");
      s.className = "undefined";
      s.textContent = "#board が見つかりません";
      domPre.appendChild(s);
    } else {
      const cards = board.querySelectorAll(".card");
      const flipped = board.querySelectorAll(".card.flipped").length;
      const matched = board.querySelectorAll(".card.matched").length;
      renderLine(domPre, "カード枚数", cards.length, 12);
      renderLine(domPre, "flipped", flipped, 12);
      renderLine(domPre, "matched", matched, 12);
    }

    renderDiagnostics();
    renderTests();
  };

  update();
  setInterval(update, 500);
})();
