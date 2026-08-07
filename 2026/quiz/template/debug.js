// =============================================
// ライブ状態パネル + 先回り診断（クイズアプリ用）
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
      text-align: left;
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
      white-space: pre-wrap;
      word-break: break-all;
      font-family: inherit;
      font-size: 11px;
    }
    #debug-panel .diag-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    #debug-panel .diag-item {
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 11px;
      white-space: pre-wrap;
      word-break: break-all;
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
  domSection.textContent = "画面 (DOM)";
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
    quizData: () => (typeof quizData !== "undefined" ? quizData : UNDEF),
    currentQuestion: () => (typeof currentQuestion !== "undefined" ? currentQuestion : UNDEF),
    score: () => (typeof score !== "undefined" ? score : UNDEF),
  };

  const safeRead = (name) => {
    try {
      const v = readers[name]();
      if (v === UNDEF) return UNDEF;
      // ブラウザは id を持つ要素を window.<id> として自動グローバル化します。
      // 参加者がまだ宣言していない段階でそれを拾わないよう、
      // 値が id 一致の Element なら未定義扱いにします。
      if (v instanceof Element && document.getElementById(name) === v) {
        return UNDEF;
      }
      return v;
    } catch (e) {
      return UNDEF;
    }
  };

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
      const s = document.createElement("span");
      if (v) s.className = "active";
      s.textContent = String(v);
      parent.appendChild(s);
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
    parent.appendChild(document.createTextNode(Object.prototype.toString.call(v)));
  };

  const renderLine = (parent, label, value, width = 16) => {
    const padded = label + " ".repeat(Math.max(0, width - label.length));
    parent.appendChild(document.createTextNode(`${padded}= `));
    appendValue(parent, value);
    parent.appendChild(document.createTextNode("\n"));
  };

  // ---- ユーザー宣言の追跡 ---------------------------------------------------
  // script.js の宣言 (let/const/var/function) を定期的に拾って、
  // ReferenceError 時に「もしかして X?」の候補として使う。
  // 宣言側が typo の場合 (未使用宣言が候補になったとき) は方向を反転して出す。
  let userDeclarations = new Set();
  let unusedDeclarations = new Set();
  let userFunctionDecls = new Set();
  let userSource = null; // fetch できない環境 (file:// など) では null のまま

  // 「一度でもデータから問題を表示できた」ことの記録。結果画面では問題文が消えていて
  // 当然なので、そのときだけこの記録で判定する。script.js が書き換わったら捨てる。
  let shownFromData = false;

  // 初心者が typo しやすいブラウザ組み込みの名前も候補に含める
  const BUILTIN_NAMES = ["alert", "prompt", "confirm", "console", "document"];

  const collectDeclarations = (src) => {
    const stripped = src
      .replace(/\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/"(?:\\.|[^"\\])*"/g, '""')
      .replace(/'(?:\\.|[^'\\])*'/g, "''")
      .replace(/`(?:\\.|[^`\\])*`/g, "``");

    const declCounts = new Map();
    const fnDecls = new Set();
    for (const m of stripped.matchAll(/\b(let|const|var|function)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g)) {
      declCounts.set(m[2], (declCounts.get(m[2]) || 0) + 1);
      if (m[1] === "function") fnDecls.add(m[2]);
    }

    const idCounts = new Map();
    for (const m of stripped.matchAll(/(^|[^.a-zA-Z0-9_$])([a-zA-Z_$][a-zA-Z0-9_$]*)/g)) {
      idCounts.set(m[2], (idCounts.get(m[2]) || 0) + 1);
    }

    const declared = new Set(declCounts.keys());
    const unused = new Set();
    for (const name of declared) {
      if ((idCounts.get(name) || 0) <= declCounts.get(name)) unused.add(name);
    }
    return { declared, unused, fnDecls };
  };

  // HTML の onclick 属性から呼び出している関数名も候補に加える
  const onclickNames = () => {
    const names = new Set();
    for (const el of document.querySelectorAll("[onclick]")) {
      const m = /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/.exec(el.getAttribute("onclick") || "");
      if (m) names.add(m[1]);
    }
    return names;
  };

  const refreshUserDeclarations = async () => {
    try {
      const res = await fetch("script.js", { cache: "no-store" });
      if (!res.ok) return;
      const raw = await res.text();
      // script.js が書き換わったら「一度は動いていた」記録を捨てる
      if (userSource !== null && raw !== userSource) shownFromData = false;
      userSource = raw;
      const { declared, unused, fnDecls } = collectDeclarations(raw);
      userDeclarations = declared;
      unusedDeclarations = unused;
      userFunctionDecls = fnDecls;
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

  // 6 文字以上なら距離 2 まで、5 文字以下は距離 1 のみ許容
  const findClosest = (name, candidates) => {
    let best = null;
    let bestD = Infinity;
    for (const c of candidates) {
      if (c === name) continue;
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
    const candidate = findClosest(missing, [
      ...userDeclarations,
      ...onclickNames(),
      ...BUILTIN_NAMES,
    ]);
    if (!candidate) return null;
    // 関数は「定義は写して呼び出しで打ちまちがえる」ことが多いので、
    // 未使用でも宣言側を疑わず、素直に候補として出す。
    if (unusedDeclarations.has(candidate) && !userFunctionDecls.has(candidate)) {
      return `宣言 "${candidate}" を "${missing}" にしたい?`;
    }
    return `もしかして "${candidate}"?`;
  };

  // ---- エラー捕捉 -----------------------------------------------------------
  const errors = [];
  const pushError = (message, file, line) => {
    const shortFile = (file || "").split("/").pop() || "?";
    const text = String(message).slice(0, 200);
    const lineNo = line || 0;
    const existingIdx = errors.findIndex((e) => e.message === text && e.file === shortFile && e.line === lineNo);
    if (existingIdx >= 0) {
      const existing = errors[existingIdx];
      existing.count++;
      errors.splice(existingIdx, 1);
      errors.push(existing);
      return;
    }
    const missing = extractMissingName(text);
    errors.push({ message: text, file: shortFile, line: lineNo, missing, hint: buildHint(missing), count: 1 });
    while (errors.length > 3) errors.shift();
  };

  // 読み込み時エラーは宣言一覧の fetch より先に起きるため、
  // ヒントは表示のたびに再計算して、見つかった時点で確定させる。
  const hintFor = (e) => {
    if (!e.hint && e.missing) e.hint = buildHint(e.missing);
    return e.hint;
  };

  // パネルが見えない環境のフォールバック。エラー時にスナップショットを Console にも流す。
  let lastAutoDump = -Infinity;
  const autoDumpSnapshot = () => {
    const now = performance.now();
    if (now - lastAutoDump < 3000) return;
    lastAutoDump = now;
    try {
      console.log("[debug] スナップショット (以下を選択してコピー、講師に貼り付け):");
      console.log(buildSnapshot());
    } catch (_) { /* 続行 */ }
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
  // getElementById を wrap し、id の typo で null が返るパターンを検出する。
  // debug.js 自身の呼び出しは無視し、script.js からの呼び出しでだけ警告する。
  const findCallerInScript = () => {
    const stack = new Error().stack || "";
    const m = stack.match(/script\.js[^\d]*(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  };

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
        console.warn(`[debug] ${msg} (script.js:${callerLine})`);
      }
    }
    return el;
  };

  const KNOWN_EVENTS = new Set([
    "click", "dblclick", "auxclick", "contextmenu",
    "mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseover", "mouseout",
    "keydown", "keyup", "keypress",
    "input", "change", "submit", "reset", "focus", "blur", "focusin", "focusout", "select",
    "load", "unload", "beforeunload", "DOMContentLoaded", "readystatechange", "pageshow", "pagehide",
    "resize", "scroll", "wheel",
    "touchstart", "touchend", "touchmove", "touchcancel",
    "pointerdown", "pointerup", "pointermove", "transitionend", "animationend",
  ]);

  // addEventListener("clik", ...) は例外にならず、ただ何も起きない。
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

  // el.textConten = "..." や el.style.dispaly = "..." のようなプロパティ名の typo は、
  // 代入が成功してしまうのでエラーにならない。存在しない名前への代入だけがオブジェクトに
  // 新しいプロパティを増やすので、まっさらな要素のプロパティ一覧と見比べれば typo を特定できる。
  // (ブラウザによって「素の状態でどこまで own property として見えるか」が違うため、
  //  固定リストではなく実物の要素から基準を作る。CSS の設定済み宣言は "0" "1" の添字で
  //  見えるので数字は除外する。)
  const ownKeys = (obj) => {
    try {
      return Object.keys(obj);
    } catch (e) {
      return [];
    }
  };
  const notIndex = (k) => !/^\d+$/.test(k);

  // 要素側のプロパティは prototype にあって baseline に現れないブラウザが多いので、
  // 「もしかして」の候補としてよく使う名前を別に持っておく。
  const DOM_PROPS = [
    "textContent", "innerHTML", "innerText", "className", "classList", "id", "value",
    "checked", "disabled", "hidden", "src", "href", "alt", "title", "style", "onclick",
    "dataset",
  ];

  const baselineCache = new Map();
  const baselineFor = (tagName) => {
    let base = baselineCache.get(tagName);
    if (!base) {
      const fresh = document.createElement(tagName);
      base = {
        el: new Set(ownKeys(fresh).filter(notIndex)),
        style: new Set(ownKeys(fresh.style).filter(notIndex)),
      };
      baselineCache.set(tagName, base);
    }
    return base;
  };

  const expandoHints = () => {
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.closest("#debug-panel")) continue;
      const where = el.id ? `#${el.id}` : el.tagName.toLowerCase();
      const base = baselineFor(el.tagName);

      const add = (key, holder, candidates) => {
        const near = findClosest(key, candidates);
        out.push(
          near
            ? `${holder} の "${key}" に書き込んでいます。もしかして "${near}"? (エラーが出ないまちがいです)`
            : `${holder} に見慣れないプロパティ "${key}" を書き込んでいます (エラーが出ないので気づきにくいまちがいかも)`
        );
      };

      for (const key of ownKeys(el)) {
        if (!notIndex(key) || base.el.has(key)) continue;
        add(key, where, [...base.el, ...DOM_PROPS]);
      }
      for (const key of ownKeys(el.style)) {
        if (!notIndex(key) || base.style.has(key)) continue;
        add(key, `${where}.style`, [...base.style]);
      }
    }
    return out;
  };

  // ---- ヒント (状況起点) -----------------------------------------------------
  const readEl = (id) => _getElementById(id);

  const quizDataProblems = () => {
    const data = safeRead("quizData");
    if (data === UNDEF || !Array.isArray(data)) return [];
    const problems = [];
    data.forEach((q, i) => {
      if (typeof q !== "object" || q === null) {
        problems.push(`quizData[${i}] がオブジェクトではありません`);
        return;
      }
      if (typeof q.question !== "string") problems.push(`quizData[${i}] に question がありません`);
      if (!Array.isArray(q.choices)) problems.push(`quizData[${i}] に choices (配列) がありません`);
      else if (typeof q.answer !== "number" || q.answer < 0 || q.answer >= q.choices.length) {
        problems.push(`quizData[${i}] の answer (${q.answer}) が choices の範囲外です (0〜${q.choices.length - 1})`);
      }
    });
    return problems;
  };

  const computeHints = () => {
    const hints = new Set();
    const hasFn = (name) => typeof window[name] === "function";

    // onclick が typo で未定義関数を呼んでいる (押すまでエラーにならない)
    for (const el of document.querySelectorAll("[onclick]")) {
      const m = /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/.exec(el.getAttribute("onclick") || "");
      if (!m) continue;
      const name = m[1];
      if (hasFn(name)) continue;
      const near = findClosest(name, [...userDeclarations].filter(hasFn));
      hints.add(
        near
          ? `onclick の "${name}" は未定義です。もしかして "${near}"?`
          : `onclick の "${name}" はまだ定義されていません (script.js に function ${name} を書くと動きます)`
      );
    }

    // quizData の形のチェック
    for (const p of quizDataProblems()) hints.add(p);

    // プロパティ名の typo (エラーにならないので画面が変わらないだけになる)
    for (const h of expandoHints()) hints.add(h);

    // 画面に undefined / NaN が出ている (プロパティ名の打ちまちがい、計算に文字列混入)
    const shown = [readEl("question-number"), readEl("question"), readEl("result"), ...choiceButtons()];
    for (const el of shown) {
      if (!el) continue;
      const text = el.textContent || "";
      if (text.includes("undefined")) {
        hints.add('画面に "undefined" が出ています。quiz.question / quiz.choices / quiz.answer のプロパティ名を打ちまちがえていませんか?');
      }
      if (text.includes("NaN")) {
        hints.add('画面に "NaN" が出ています。数値の計算に文字列が混ざっていませんか?');
      }
    }

    // 関数はあるのにボタンと繋がっていない (押しても何も起きず、エラーも出ない)
    const btns = choiceButtons();
    if (hasFn("checkAnswer") && btns.length > 0 && btns.every((b) => !b.hasAttribute("onclick"))) {
      hints.add('checkAnswer は定義済みですが、選択肢ボタンに onclick がありません (index.html に onclick="checkAnswer(0)" を書きます)');
    }
    const nextBtnEl = readEl("next-btn");
    if (hasFn("nextQuestion") && nextBtnEl && !nextBtnEl.hasAttribute("onclick")) {
      hints.add('nextQuestion は定義済みですが、次へボタンに onclick がありません (onclick="nextQuestion()")');
    }

    // onclick の番号がずれている (コピペで全部 0 のまま、など)
    const nums = btns.map((b) => {
      const m = /checkAnswer\(\s*(\d+)\s*\)/.exec(b.getAttribute("onclick") || "");
      return m ? Number(m[1]) : null;
    });
    if (nums.length >= 2 && nums.every((n) => n !== null) && !nums.every((n, i) => n === i)) {
      hints.add(`選択肢ボタンの checkAnswer(番号) が ${nums.join(", ")} になっています。上から 0, 1, 2 の順にします`);
    }

    // if の中が代入 (if (a = b) は必ず成り立ってしまい、エラーも出ない)
    if (userSource !== null && /\bif\s*\([^)=]*[^=!<>]=[^=]/.test(userSource)) {
      hints.add("if ( ) の中に = があります。比較は === です (= は代入なので、条件がいつも成り立ってしまいます)");
    }

    // showQuestion の呼び忘れ (定義済み・データありなのに初期表示のまま)
    const nextBtn = readEl("next-btn");
    const resultEl = readEl("result");
    // エラーで途中停止しているときは「呼び忘れ」ではないので出さない
    if (
      errors.length === 0 &&
      hasFn("showQuestion") &&
      safeRead("quizData") !== UNDEF &&
      nextBtn && nextBtn.style.display === "" &&
      resultEl && resultEl.textContent === ""
    ) {
      hints.add("showQuestion は定義済みですが、まだ一度も実行されていないようです。script.js のいちばん下で showQuestion() を呼びましたか?");
    }

    return [...hints];
  };

  // ---- 描画 ------------------------------------------------------------------
  const renderDiagnostics = () => {
    diagList.replaceChildren();
    const items = [];
    for (let i = errors.length - 1; i >= 0; i--) {
      const e = errors[i];
      const suffix = e.count > 1 ? ` (×${e.count})` : "";
      const base = `⚠ ${e.message}${suffix}\n   at ${e.file}:${e.line}`;
      const hint = hintFor(e);
      const text = hint ? `${base}\n   → ${hint}` : base;
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
  // 副作用の大きい関数 (showQuestion, checkAnswer など) は「呼ぶ」テストにしない。
  // 応用課題で選択肢の数が変わっても動くよう、ボタンは #choices の中から拾う。
  const choiceButtons = () => [...document.querySelectorAll("#choices button")];

  // ソースの見た目で判定するテスト。fetch できない環境では fallback の結果を返す。
  const sourceTest = (regex, fallback) => (userSource === null ? fallback() : regex.test(userSource));

  const TESTS = {
    "Chapter 1": [
      { desc: "checkAnswer 関数が定義されている", fn: () => typeof window.checkAnswer === "function" },
      { desc: "選択肢ボタンぜんぶに onclick が付いている", fn: () =>
        choiceButtons().length >= 2 && choiceButtons().every((b) => b.hasAttribute("onclick")) },
      { desc: "onclick から checkAnswer(番号) を呼んでいる", fn: () => {
        const btns = choiceButtons();
        if (btns.length < 2) return false;
        const nums = btns.map((b) => {
          const m = /checkAnswer\(\s*(\d+)\s*\)/.exec(b.getAttribute("onclick") || "");
          return m ? Number(m[1]) : null;
        });
        return nums.every((n, i) => n === i);
      } },
      { desc: "結果欄 (result) の文字を書き換えている", fn: () =>
        sourceTest(/getElementById\(\s*["']result["']\s*\)/, () => typeof window.checkAnswer === "function") },
    ],
    "Chapter 2": [
      { desc: "quizData が配列である", fn: () => Array.isArray(safeRead("quizData")) },
      { desc: "各問題に question / choices / answer がある", fn: () => {
        const d = safeRead("quizData");
        return Array.isArray(d) && d.length > 0 && quizDataProblems().length === 0;
      } },
      { desc: "currentQuestion が number", fn: () => typeof safeRead("currentQuestion") === "number" },
      { desc: "score が number", fn: () => typeof safeRead("score") === "number" },
      { desc: "showQuestion 関数が定義されている", fn: () => typeof window.showQuestion === "function" },
      { desc: "quiz.answer で正解を判定している", fn: () =>
        sourceTest(/quiz\s*\.\s*answer/, () => typeof window.checkAnswer === "function") },
      { desc: "正解したら score を増やしている", fn: () =>
        sourceTest(/score\s*=\s*score\s*\+\s*1|score\s*\+=\s*1|score\s*\+\+/, () => typeof window.checkAnswer === "function") },
      { desc: "問題が quizData から表示されている", fn: () => {
        const d = safeRead("quizData");
        if (!Array.isArray(d) || d.length === 0) return false;
        const cq = safeRead("currentQuestion");
        // 結果画面 (最後まで解き終わった状態) では問題文が出ていなくて当然なので、
        // 一度でも表示できていたなら合格のままにする。
        if (typeof cq === "number" && cq >= d.length) return shownFromData;
        const idx = typeof cq === "number" && cq >= 0 ? cq : 0;
        const q = readEl("question");
        const ok = !!q && !!d[idx] && q.textContent === d[idx].question && readEl("next-btn").style.display !== "";
        if (ok) shownFromData = true;
        return ok;
      } },
    ],
    "Chapter 3": [
      { desc: "nextQuestion 関数が定義されている", fn: () => typeof window.nextQuestion === "function" },
      { desc: "showResult 関数が定義されている", fn: () => typeof window.showResult === "function" },
      { desc: "次へボタンの onclick から nextQuestion を呼んでいる", fn: () => {
        const b = readEl("next-btn");
        return !!b && /nextQuestion\s*\(/.test(b.getAttribute("onclick") || "");
      } },
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
    if (typeof v === "boolean" || typeof v === "number") return String(v);
    if (typeof v === "string") return JSON.stringify(v);
    if (Array.isArray(v)) return `[Array length=${v.length}]`;
    return Object.prototype.toString.call(v);
  };

  const screenLine = () => {
    const qn = readEl("question-number");
    const result = readEl("result");
    const nextBtn = readEl("next-btn");
    const parts = [];
    parts.push(`問題番号=${qn ? JSON.stringify(qn.textContent) : "?"}`);
    parts.push(`結果=${result ? JSON.stringify(result.textContent) : "?"}`);
    parts.push(`次へ=${nextBtn ? (nextBtn.style.display === "none" ? "非表示" : "表示") : "?"}`);
    return parts.join(", ");
  };

  // チャットの上限に収める。長すぎたら段階的に情報を落とす。
  const MAX_LENGTH = 1000;

  const buildSnapshot = () => {
    const varLines = Object.keys(readers).map((name) => `${name}=${formatValueText(safeRead(name))}`);

    const diagFull = [];
    const diagShort = [];
    for (let i = errors.length - 1; i >= 0; i--) {
      const e = errors[i];
      const suffix = e.count > 1 ? ` (×${e.count})` : "";
      const head = `⚠ ${e.message}${suffix} @${e.file}:${e.line}`;
      const hint = hintFor(e);
      diagFull.push(hint ? `${head}\n  → ${hint}` : head);
      diagShort.push(hint ? `${head} [${hint}]` : head);
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
      parts.push("[画面] " + screenLine());
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

  // Console から呼び出せるフォールバック
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
    const qn = readEl("question-number");
    const result = readEl("result");
    const nextBtn = readEl("next-btn");
    renderLine(domPre, "問題番号", qn ? qn.textContent : UNDEF, 10);
    renderLine(domPre, "結果", result ? result.textContent : UNDEF, 10);
    renderLine(domPre, "次へ表示", nextBtn ? nextBtn.style.display !== "none" : UNDEF, 10);

    renderDiagnostics();
    renderTests();
  };

  update();
  setInterval(update, 500);
})();
