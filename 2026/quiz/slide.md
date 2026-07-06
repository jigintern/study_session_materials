---
marp: true
theme: academic
paginate: true
backgroundColor: #f8f9fa
style: |
  /* academic テーマに無い章扉を中央寄せに */
  section.chapter {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
  blockquote {
    position: static;
    max-width: 100%;
    border-top: none;
    border-left: 4px solid #800000;
    background: #f7f2f2;
    padding: 0.5em 1em;
    font-size: 0.9em;
  }
  blockquote::before,
  blockquote::after { content: ""; }
  /* 確認・ヒント用ボックス */
  .check {
    background: #e8f5e9;
    border-left: 4px solid #4caf50;
    padding: 0.5em 1em;
    border-radius: 0 8px 8px 0;
  }
  .tip {
    background: #fff3e0;
    border-left: 4px solid #ff9800;
    padding: 0.5em 1em;
    border-radius: 0 8px 8px 0;
  }
---

<!-- _class: lead -->

# 1から学ぶ JavaScript！

## クイズアプリを作ってみよう

---

# 今日のゴール

JavaScript を使って **自分だけの3択クイズアプリ** を作ります！

- 問題と3つの選択肢が表示される
- 選択肢をクリック → 正解/不正解がわかる
- 「次の問題へ」で進む
- 全問終了 → スコア表示！

---

# Webページの3つの技術

| 技術 | 役割 | たとえると |
|------|------|----------|
| HTML | 構造（骨組み） | 家の骨組み |
| CSS | 見た目（デザイン） | 壁紙・インテリア |
| **JavaScript** | **動き（プログラム）** | **電気・水道** |

前回は HTML と CSS で「自己紹介ページ」を作りました。
今回は **JavaScript** でページに「動き」をつけます！

---

# 準備：テンプレートを開こう

## StackBlitz のテンプレートを開く

1. ブラウザで StackBlitz のテンプレートを開く
   **[テンプレートURL（準備中）]**
2. 左に **HTML / CSS / JS** のファイル、右側にプレビューが表示されます
3. 今日さわるのは **`script.js`（JS）だけ**！

> テンプレートには **1問目が決めうちで表示された状態** の
> HTML と CSS が用意されています。
> ここに JavaScript で「動き」を足していきましょう！

---

# 今日の進め方

| 章 | 内容 |
|----|------|
| JavaScript入門 | 変数・計算・条件分岐・繰り返し・配列を知る |
| Chapter 1 | クリックに反応させる |
| Chapter 2 | 問題をたくさん出題する |
| Chapter 3 | スコアと結果を表示する |
| Chapter 4 | 自分だけのクイズを作る |

少しずつ JS を書き足して、最後にクイズアプリを完成させます！

---

<!-- _class: chapter -->

# JavaScript入門

クイズを作る前に、JSの基本を知ろう

---

# JavaScript とは？

**JavaScript** は、Webページに **「動き」** をつけるためのプログラミング言語です。

- ボタンを押したら反応する
- 文字や色を書き換える
- 計算する・判定する

このあと、クイズ作りで使う **5つの基本** を順番に見ていきます。

---

# ① 変数 — データを入れる箱

`const` や `let` で、データに名前をつけて箱に入れます。

```javascript
const name = "鯖江";   // 変えない箱
let score = 0;         // あとで変える箱
```

| キーワード | 意味 |
|-----------|------|
| `const` | あとで **変えない** 値の箱 |
| `let` | あとで **変える** 値の箱 |

文字を入れるときは `"鯖江"` のように **ダブルクォーテーション** で囲みます。
囲むと「文字列」、囲まないと「数字や命令」として扱われます。

---

# ② 計算と文字列の結合

数字は計算でき、文字列は `+` でつなげられます。

```javascript
const a = 3;
const b = 2;
const sum = a + b;        // → 5（数字の計算）

const hello = "こんにちは" + "！";   // → "こんにちは！"（文字列の結合）
```

<div class="tip">

計算と結合を **1行に混ぜない** のがコツ！
まず計算して変数に入れ、それから文字列に組み込むと読みやすいです。

```javascript
const next = currentQuestion + 1;        // ① 先に計算
const label = "第" + next + "問";        // ② あとで結合
```

</div>

---

# ③ 条件分岐 — if / 比較演算子

「もし〜なら」で処理を分けます。

```javascript
const selected = 0;
if (selected === 0) {
  console.log("0番が選ばれた！");
} else {
  console.log("ほかの番号だよ");
}
```

| 比較演算子 | 意味 |
|-----------|------|
| `===` | 等しい（`=` は代入なので注意！） |
| `!==` | 等しくない |
| `>` `<` `>=` `<=` | 大小の比較 |

---

# ④ 繰り返し — for

同じ処理を何回も繰り返したいときに使います。

```javascript
for (let i = 0; i < 3; i++) {
  console.log(i);   // → 0, 1, 2 と順番に表示
}
```

| 書き方 | 意味 |
|--------|------|
| `let i = 0` | カウンター変数を 0 から始める |
| `i < 3` | この条件が成り立つ間くり返す |
| `i++` | 1回ごとに `i` を1増やす |

---

# ⑤ 配列とオブジェクト

**配列（Array）** — データの「リスト」

```javascript
const fruits = ["りんご", "バナナ", "みかん"];
// fruits[0] → "りんご"    （0から数える！）
```

**オブジェクト（Object）** — 名前つきのデータのまとまり

```javascript
const person = { name: "太郎", age: 18 };
// person.name → "太郎"    person.age → 18
```

> この2つを組み合わせて、クイズの「問題・選択肢・答え」をまとめて管理します！

---

<!-- _class: chapter -->

# Chapter 1
クリックに反応させよう

---

# 1-1. まずはクリックに反応しよう

HTMLのボタンに `onclick` を書くと、クリックしたときに JS を実行できます。

テンプレートの1つ目のボタンを、試しにこう書き換えてみよう：

```html
<button id="choice-0" onclick="alert('クリックされた！')">富士山</button>
```

<div class="check">

「富士山」ボタンを押すとポップアップが出ましたか？

</div>

> これが **イベント処理** — 「何かが起きたら、何かをする」という仕組みです。

---

# 1-2. 関数をつくろう

毎回 `alert(...)` を書くのは大変。処理に名前をつけた **関数** にまとめます。

HTMLの3つのボタンを書き換えよう：

```html
<button id="choice-0" onclick="checkAnswer(0)">富士山</button>
<button id="choice-1" onclick="checkAnswer(1)">北岳</button>
<button id="choice-2" onclick="checkAnswer(2)">奥穂高岳</button>
```

`script.js` に関数を書こう：

```javascript
function checkAnswer(selected) {
  alert("あなたは " + selected + " 番を選びました！");
}
```

---

# 1-2. 新しいJSの書き方

| 書き方 | 意味 |
|--------|------|
| `function checkAnswer(selected) { ... }` | **関数**を定義（処理に名前をつける） |
| `selected` | **引数**（ボタンごとに 0, 1, 2 が入る） |
| `alert("...")` | ポップアップでメッセージ表示 |
| `"あなたは " + selected + " 番"` | 文字列の結合（`+` でつなげる） |

<div class="tip">

プログラミングでは番号を **0 から数え始める** のが基本です！
富士山=0, 北岳=1, 奥穂高岳=2 になっています。

</div>

---

# 1-3. 画面の文字を書き換えよう（DOM操作）

`alert` の代わりに、**ページ上に結果を表示** しましょう！
`script.js` の `checkAnswer` を書き換え：

```javascript
function checkAnswer(selected) {
  const resultEl = document.getElementById("result");

  if (selected === 0) {
    resultEl.textContent = "正解！すごい！";
  } else {
    resultEl.textContent = "不正解... 正解は「富士山」でした";
  }
}
```

---

# 1-3. 新しいJSの書き方

| 書き方 | 意味 |
|--------|------|
| `const resultEl = ...` | **変数**（データの箱）を作る |
| `document.getElementById("result")` | `id="result"` の要素を取得 |
| `resultEl.textContent = "..."` | 要素の文字を書き換える |
| `if (...) { } else { }` | **条件分岐** |
| `===` | 「等しいか？」の比較（`=` は代入！） |

> `document.getElementById()` で HTML の要素を **id で** 見つけて操作する
> → これを **DOM操作** と呼びます

<div class="check">

ボタンを押すと、ページ上に正解/不正解が表示されましたか？

</div>

---

<!-- _class: chapter -->

# Chapter 2
問題をたくさん出題しよう

---

# 2-1. クイズデータを用意しよう

入門で学んだ **配列とオブジェクト** でクイズをまとめます。
`script.js` の先頭に書こう：

```javascript
const quizData = [
  { question: "日本で一番高い山は？",
    choices: ["富士山", "北岳", "奥穂高岳"], answer: 0 },
  { question: "jig.jp の本社がある福井県の市は？",
    choices: ["鯖江市", "福井市", "敦賀市"], answer: 0 },
  { question: "Webページの「動き」を担当する言語は？",
    choices: ["HTML", "CSS", "JavaScript"], answer: 2 }
];

let currentQuestion = 0;
let score = 0;
```

---

# 2-1. データの読み解き方

| 書き方 | 意味 |
|--------|------|
| `quizData` | 問題をまとめた **配列** |
| `{ question, choices, answer }` | 1問ぶんの **オブジェクト** |
| `choices` | 選択肢の配列（今回は **3つに統一**） |
| `answer` | 正解の番号（0から数える） |

<div class="tip">

`quizData` はデータを入れ替えないので `const`、
`currentQuestion`（今何問目か）と `score`（得点）は変わるので `let`。

</div>

---

# 2-2. 問題を表示する関数

`showQuestion()` を作ります。今の問題を取り出して、問題番号・問題文・選択肢をまとめて画面に表示します。

```javascript
function showQuestion() {
  const quiz = quizData[currentQuestion];   // 今の問題を取り出す

  // 問題番号（計算してから結合する）
  const number = currentQuestion + 1;
  document.getElementById("question-number").textContent =
    "第" + number + "問 / 全" + quizData.length + "問";

  // 問題文
  document.getElementById("question").textContent = quiz.question;

  // 選択肢（id の番号と choices の番号をそろえる）
  document.getElementById("choice-0").textContent = quiz.choices[0];
  document.getElementById("choice-1").textContent = quiz.choices[1];
  document.getElementById("choice-2").textContent = quiz.choices[2];

  document.getElementById("result").textContent = "";        // 前の結果を消す
  document.getElementById("next-btn").style.display = "none";
}
```

> `currentQuestion + 1` を先に `number` に入れてから結合しています（計算と結合は分ける）。

---

# 2-3. 正解判定をアップデート

`checkAnswer` を、`quizData` の `answer` で判定するように書き換えよう：

```javascript
function checkAnswer(selected) {
  const quiz = quizData[currentQuestion];
  const resultEl = document.getElementById("result");

  if (selected === quiz.answer) {
    resultEl.textContent = "正解！";
    score = score + 1;
  } else {
    const correctText = quiz.choices[quiz.answer];
    resultEl.textContent = "不正解... 正解は「" + correctText + "」";
  }

  document.getElementById("next-btn").style.display = "inline-block";
}
```

> `score = score + 1` で正解したら得点を1増やします。

---

# 2-4. 最初の問題を表示しよう

`script.js` の **いちばん下** に、1行だけ追加：

```javascript
showQuestion();   // ページを開いたら最初の問題を表示
```

<div class="check">

1問目が `quizData` から表示され、選んだら正解/不正解が出ますか？
（まだ「次の問題へ」は動かなくてOK）

</div>

> これで HTML に決めうちしていた1問目を、
> **JS のデータから表示** できるようになりました！

---

<!-- _class: chapter -->

# Chapter 3
スコアと結果を表示しよう

---

# 3-1.「次の問題へ」の処理

`script.js` に `nextQuestion` を追加しよう：

```javascript
function nextQuestion() {
  currentQuestion = currentQuestion + 1;

  if (currentQuestion < quizData.length) {
    showQuestion();   // まだ問題がある → 次を表示
  } else {
    showResult();     // 最後まで終わった → 結果へ
  }
}
```

HTMLの「次の問題へ」ボタンに `onclick` を付けよう：

```html
<button id="next-btn" onclick="nextQuestion()">次の問題へ</button>
```

---

# 3-2. 結果画面をつくろう

`script.js` に `showResult` を追加しよう：

```javascript
function showResult() {
  document.getElementById("question-number").textContent = "結果発表！";

  document.getElementById("question").textContent =
    quizData.length + "問中 " + score + "問正解！";

  document.getElementById("choices").style.display = "none";
  document.getElementById("next-btn").style.display = "none";
  document.getElementById("result").textContent = "おつかれさま！";
}
```

<div class="check">

最後の問題のあと「次の問題へ」を押すと、結果が表示されますか？

</div>

---

<!-- _class: lead -->

# 完成！

## 3択クイズアプリが動きました！
おめでとうございます！

---

<!-- _class: chapter -->

# Chapter 4
自分だけのクイズを作ろう！

---

# オリジナルクイズの作り方

`script.js` の `quizData` を書き換えるだけ！

```javascript
{
  question: "ここに問題文を書く",
  choices: ["選択肢1", "選択肢2", "選択肢3"],
  answer: 0    // 正解の番号（0から数える）
}
```

問題はいくつ増やしてもOK（`,` で区切る）。

### クイズのアイデア
推しクイズ ／ 地元クイズ ／ 学校クイズ ／ IT雑学 ／ グルメクイズ

---

# 今日学んだこと

| 概念 | 使った場面 |
|------|-----------|
| 変数（`const` / `let`） | クイズデータ、スコア管理 |
| 計算と文字列の結合 | 問題番号・結果の表示 |
| 関数（`function`） | `showQuestion`, `checkAnswer` など |
| DOM操作（`getElementById`） | id で要素を取得して書き換え |
| イベント処理（`onclick`） | ボタンクリック時の処理 |
| 条件分岐（`if / else`） | 正解判定 |
| 配列・オブジェクト | クイズデータの管理 |

---

<!-- _class: chapter -->

# 応用課題
余裕がある人はチャレンジ！

---

# 応用①：選択肢の数を自由にする（N択）

3択に固定していた選択肢を、`for` ループで自動生成すると
**2択でも4択でも5択でも** 出せるようになります。

```javascript
// showQuestion の選択肢表示を、for ループに置き換える
let buttonsHTML = "";
for (let i = 0; i < quiz.choices.length; i++) {
  buttonsHTML +=
    '<button id="choice-' + i + '" onclick="checkAnswer(' + i + ')">'
    + quiz.choices[i] + '</button>';
}
document.getElementById("choices").innerHTML = buttonsHTML;
```

> `quiz.choices.length` の数だけボタンが作られます。
> `quizData` の `choices` を4つにすれば、自動で4択になります！

---

# 応用②：結果メッセージを変える

得点に応じて、結果のメッセージを変えてみよう。
`showResult` に `if / else if / else` を足します。

```javascript
const resultEl = document.getElementById("result");
const half = quizData.length / 2;

if (score === quizData.length) {
  resultEl.textContent = "パーフェクト！天才！";
} else if (score >= half) {
  resultEl.textContent = "なかなかやるね！";
} else {
  resultEl.textContent = "次はもっといけるはず！";
}
```

> `else if` で「3つ以上の場合分け」ができます。

---

# 応用③：もっとチャレンジ

| 難度 | 課題 | ヒント |
|------|------|--------|
| ★ | もう一度チャレンジボタン | `currentQuestion` と `score` を 0 に戻す |
| ★ | 正解した選択肢を緑にする | `.style.background = "#4caf50"` |
| ★★ | 選択肢シャッフル | `answer` の番号も一緒に変える |
| ★★ | タイマー機能 | `setInterval` + `clearInterval` |
| ★★★ | 画像つきクイズ | `<img>` タグを動的に生成 |

---

# 困ったときは

### エラーの調べ方
`F12` → **Console** タブで赤いエラーメッセージを確認

### よくある間違い

| ミス | 正しい書き方 |
|------|------------|
| `=` と `===` の混同 | 比較は `===`、代入は `=` |
| カッコの閉じ忘れ | `()` `{}` `[]` は必ずペア |
| クォーテーション閉じ忘れ | `"..."` `'...'` はペア |
| スペルミス | `getElementById` の大文字小文字 |
| カンマ忘れ | 配列・オブジェクトの要素間 |

> 質問するときは **Chapter番号** を伝えてね！

---

<!-- _class: lead -->

# おつかれさまでした！

楽しいクイズができたら、ぜひ見せてください！
