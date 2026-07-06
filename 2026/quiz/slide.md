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

JavaScriptを使って **自分だけのN拓クイズアプリ** を作ります！

- 問題と選択肢が表示される
- 選択肢をクリック → 正解/不正解がわかる
- 正解は緑、不正解は赤になる
- 「次の問題へ」で進む
- 全問終了 → スコア表示！

---

# Webページの3つの技術（おさらい）

| 技術 | 役割 | たとえると |
|------|------|----------|
| HTML | 構造（骨組み） | 家の骨組み |
| CSS | 見た目（デザイン） | 壁紙・インテリア |
| **JavaScript** | **動き（プログラム）** | **電気・水道** |

前回は HTML と CSS で「自己紹介ページ」を作りました。
今回は **JavaScript（JS）** でページに「動き」をつけます！

---

# 「N拓」ってなに？

「N拓」の **N** は「数字が自由」という意味

- **3拓**クイズ → 選択肢が3つ
- **4拓**クイズ → 選択肢が4つ
- **2拓**（○×風）も、**5拓**以上も OK!

今回作るクイズは **問題ごとに選択肢の数を自由に変えられます**！

---

# 準備

## テンプレートを開こう

1. ブラウザで LiveCodes のテンプレートを開く
   **[テンプレートURL（準備中）]**
2. 左のタブで **HTML** / **CSS** / **JS** を切り替え
3. 右側にプレビューがリアルタイム表示

> テンプレートにはクイズの **HTMLの骨組み** がすでに用意されています。
> CSS と JS の中身はほぼ空なので、これから一緒に書いていきましょう！

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

# 3-1. 「配列」と「オブジェクト」を知ろう

**配列（Array）** — データの「リスト」

```javascript
const fruits = ["りんご", "バナナ", "みかん"];
// fruits[0] → "りんご"    fruits.length → 3
```

**オブジェクト（Object）** — 名前つきデータ

```javascript
const person = { name: "太郎", age: 18 };
// person.name → "太郎"    person.age → 18
```

これらを組み合わせてクイズデータを管理します！

---

# 3-2. クイズデータを用意しよう

**JS** の `[2]` セクションに書こう

```javascript
const quizData = [
  { question: "日本で一番高い山は？",
    choices: ["富士山", "北岳", "奥穂高岳"], answer: 0 },
  { question: "HTMLの「H」は何の略？",
    choices: ["High", "Hyper", "Hybrid", "Home"], answer: 1 },
  { question: "JavaScriptで 1 + '1' の結果は？",
    choices: ["2", "11", "エラーになる"], answer: 1 },
  { question: "CSSで文字の色を変えるプロパティは？",
    choices: ["font-color", "text-color", "color"], answer: 2 },
  { question: "Webページを見るためのソフトは？",
    choices: ["コンパイラ", "ブラウザ", "エディタ", "ターミナル"], answer: 1 }
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
