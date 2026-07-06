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

# Chapter 2
ボタンをクリックしたら反応させよう
20分

---

# 2-1. まずはクリックに反応しよう

HTMLのボタンに `onclick` を書くと、クリック時にJSを実行できます

1つ目のボタンを試しにこう書き換えてみよう：

```html
<button class="choice-btn" onclick="alert('クリックされた！')">富士山</button>
```

<div class="check">

「富士山」ボタンを押すとポップアップが出ましたか？

</div>

> これが **イベント処理** — 「何かが起きたら、何かをする」という仕組み

---

# 2-2. 関数をつくろう

`<!-- Chapter 2 -->` コメントを参考に、3つのボタンを書き換えよう

```html
<button class="choice-btn" onclick="checkAnswer(0)">富士山</button>
<button class="choice-btn" onclick="checkAnswer(1)">北岳</button>
<button class="choice-btn" onclick="checkAnswer(2)">奥穂高岳</button>
```

**JS** の `[1]` セクションに関数を書こう

```javascript
function checkAnswer(selected) {
  alert("あなたは " + selected + " 番を選びました！");
}
```

---

# 2-2. 新しいJSの書き方

| 書き方 | 意味 |
|--------|------|
| `function checkAnswer(selected) { ... }` | **関数**を定義（処理に名前をつける） |
| `selected` | **引数**（ボタンごとに 0, 1, 2 が入る） |
| `alert("...")` | ポップアップでメッセージ表示 |
| `"あなたは " + selected + " 番"` | 文字列の結合（`+` でつなげる） |

<div class="tip">

プログラミングでは番号を **0 から数え始める** のが基本です！

</div>

---

# 2-3. 画面の文字を書き換えよう（DOM操作）

`alert` の代わりに **ページ上に結果を表示** しよう！
**JS** の `[1]` セクションを書き換え：

```javascript
function checkAnswer(selected) {
  const resultEl = document.getElementById("result");

  if (selected === 0) {
    resultEl.textContent = "正解！すごい！";
    resultEl.style.color = "#4caf50";
  } else {
    resultEl.textContent = "不正解... 正解は「富士山」でした";
    resultEl.style.color = "#e53935";
  }
}
```

---

# 2-3. 新しいJSの書き方

| 書き方 | 意味 |
|--------|------|
| `const resultEl = ...` | **変数**（データの箱）を作る |
| `document.getElementById("result")` | `id="result"` の要素を取得 |
| `resultEl.textContent = "..."` | 要素の文字を書き換える |
| `resultEl.style.color = "..."` | CSSスタイルを変更 |
| `if (...) { } else { }` | **条件分岐** |
| `===` | 「等しいか？」の比較（`=` は代入！） |

> `document.getElementById()` で HTML の要素を見つけて操作する
> → これを **DOM操作** と呼びます

---

<!-- _class: chapter -->

# Chapter 3
問題をたくさん出題しよう
25分

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

# 3-2. ここがN拓のポイント！

問題によって **`choices` の数が違う**！

- 1問目: `["富士山", "北岳", "奥穂高岳"]` → **3択**
- 2問目: `["High", "Hyper", "Hybrid", "Home"]` → **4択**

<div class="tip">

`const` = 変えない値の箱 ／ `let` = あとで変える値の箱
`quizData` はデータを入れ替えないので `const`、
`currentQuestion` と `score` は変わるので `let`

</div>

---

# 3-3. 問題を表示する関数

**JS** の `[3]` セクションに書こう

```javascript
function showQuestion() {
  const quiz = quizData[currentQuestion];
  document.getElementById("question-number").textContent =
    "第" + (currentQuestion + 1) + "問 / 全" + quizData.length + "問";
  document.getElementById("question").textContent = quiz.question;
  document.getElementById("result").textContent = "";

  let buttonsHTML = "";
  for (let i = 0; i < quiz.choices.length; i++) {
    buttonsHTML += '<button class="choice-btn" onclick="checkAnswer(' + i + ')">'
      + quiz.choices[i] + '</button>';
  }
  document.getElementById("choices").innerHTML = buttonsHTML;
  document.getElementById("next-btn").style.display = "none";
}
```

---

# 3-3. N拓のキモ：for ループ

| 書き方 | 意味 |
|--------|------|
| `for (let i = 0; i < ...; i++)` | **ループ** — 処理を繰り返す |
| `quiz.choices.length` | 配列の長さ |
| `buttonsHTML += "..."` | 文字列を後ろにつなげる |
| `.innerHTML = "..."` | HTML文字列で中身を書き換える |

<div class="tip">

`for` ループが `quiz.choices.length` の分だけ繰り返すので、
選択肢が **3つなら3つ**、**4つなら4つ** のボタンが **自動で** 作られます！

</div>

---

# 3-4. 正解判定をアップデート

**JS** の `[1]` セクションの `checkAnswer` を書き換えよう

```javascript
function checkAnswer(selected) {
  const quiz = quizData[currentQuestion];
  const resultEl = document.getElementById("result");
  const buttons = document.querySelectorAll(".choice-btn");
  for (let i = 0; i < buttons.length; i++) { buttons[i].disabled = true; }

  if (selected === quiz.answer) {
    resultEl.textContent = "正解！";
    resultEl.style.color = "#4caf50";
    buttons[selected].classList.add("correct");
    score++;
  } else {
    resultEl.textContent = "不正解... 正解は「" + quiz.choices[quiz.answer] + "」";
    resultEl.style.color = "#e53935";
    buttons[selected].classList.add("wrong");
    buttons[quiz.answer].classList.add("correct");
  }
  document.getElementById("next-btn").style.display = "inline-block";
}
```

---

# 3-5. HTML を修正 & 3-6. スタート

### HTML の修正
`<!-- Chapter 3 -->` コメントに従って中身を空にする：

```html
<p id="question-number"></p>
<h2 id="question"></h2>
<div id="choices"></div>
```

### JS の `[6]` セクション
コメント（`//`）を外して有効化：

```javascript
showQuestion();   // ← // を消す
```

<div class="check">

問題が表示されて、選択肢を選ぶと正解/不正解が出ますか？

</div>

---

<!-- _class: chapter -->

# Chapter 4
スコアと結果を表示しよう
15分

---

# 4-1.「次の問題へ」の処理

**HTML**: `<!-- Chapter 4 -->` に従って onclick 追加

```html
<button id="next-btn" onclick="nextQuestion()" style="display: none;">次の問題へ</button>
```

**JS** の `[4]` セクションに書こう

```javascript
function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    showQuestion();
  } else {
    showResult();
  }
}
```

> `currentQuestion++` は `currentQuestion = currentQuestion + 1` と同じ

---

# 4-2. 結果画面をつくろう

**JS** の `[5]` セクションに書こう

```javascript
function showResult() {
  document.getElementById("question-number").textContent = "結果発表！";
  document.getElementById("question").textContent =
    quizData.length + "問中 " + score + "問正解！";
  document.getElementById("choices").innerHTML = "";
  document.getElementById("next-btn").style.display = "none";

  const resultEl = document.getElementById("result");
  if (score === quizData.length) {
    resultEl.textContent = "パーフェクト！天才！";
  } else if (score >= quizData.length / 2) {
    resultEl.textContent = "なかなかやるね！";
  } else {
    resultEl.textContent = "次はもっといけるはず！";
  }
  resultEl.style.color = "#333";
}
```

---

<!-- _class: lead -->

# 完成！

## N拓クイズアプリが動きました！
おめでとうございます！

---

<!-- _class: chapter -->

# Chapter 5
自分だけのクイズを作ろう！

---

# オリジナルクイズの作り方

**JS** の `[2]` にある `quizData` を書き換えるだけ！

```javascript
{
  question: "ここに問題文を書く",
  choices: ["選択肢1", "選択肢2", "選択肢3"],
  answer: 0    // 正解の番号（0から数える）
}
```

**選択肢の数は自由！** 2択〜5択以上もOK

### クイズのアイデア
推しクイズ ／ 地元クイズ ／ 学校クイズ ／ IT雑学 ／ グルメクイズ

---

# JS豆知識

### 3問目の答え、知ってた？

```javascript
1 + '1'    // → "11"（文字列！）
```

数字の `1` と文字列の `'1'` を `+` で足すと
数字が文字列に変換されてくっつく！

こういう JavaScript のちょっと不思議な動きも
クイズのネタにすると面白いですよ！

---

# チャレンジ課題

| 難度 | 課題 | ヒント |
|------|------|--------|
| ★ | もう一度チャレンジボタン | `currentQuestion` と `score` を 0 に戻す |
| ★ | 正解数で背景色変更 | `document.body.style.background` |
| ★★ | 選択肢シャッフル | `answer` の番号も一緒に変える |
| ★★ | タイマー機能 | `setInterval` + `clearInterval` |
| ★★★ | 画像つきクイズ | `<img>` タグを動的に生成 |

---

# 今日学んだこと

| 概念 | 使った場面 |
|------|-----------|
| 変数（`const` / `let`） | クイズデータ、スコア管理 |
| 関数（`function`） | `showQuestion`, `checkAnswer` など |
| DOM操作 | `getElementById`, `textContent` |
| イベント処理（`onclick`） | ボタンクリック時の処理 |
| 条件分岐（`if / else`） | 正解判定、結果メッセージ |
| 配列・オブジェクト | クイズデータの管理 |
| for ループ | 選択肢ボタンの動的生成 |

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
