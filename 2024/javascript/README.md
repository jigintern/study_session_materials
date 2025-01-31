# はじめての【JavaScript】 もう「どう書くの？」とは言わせない！

本勉強会では、JavaScript の基本を学び、Web ページを動的に操作する方法を習得します。
以下の内容を サンプルコードとともに 学んでいきます。

**勉強会の内容**

JavaScript の基本（変数、データ型、演算子、条件分岐、ループ）
DOM 操作（要素の取得・変更）
イベントリスナー（クリック、マウス操作、キーボード入力の処理）
実践的なサンプルコード を使った演習
JavaScript の基礎を 実際にコードを書きながら 進めますので、ぜひ手を動かして学んでいきましょう！ 🚀

# JavaScript の概要

## JavaScript の役割

JavaScript(以下 JS)とは一般に Web 開発やシステム開発に用いられるプログラミング言語の一つです。マウスクリックやキーボード入力、サーバーとの通信、複雑なアニメーションなど、今日の Web において広く使用されています。

## 実行環境

今回は [StackBlitz](https://stackblitz.com/edit/js-tokrudjl?file=index.html) という Web IDE を使います。

# 基本構文

## 変数

JS では `let`, `const`, `var` の 3 種類の変数の宣言方法があります。

```js
let name = "Jon"; // 再代入可能
const age = 25; // 再代入不可
var city = "Tokyo"; // 旧来の書き方（非推奨）
```

- `let`: 値を変更できる変数
- `const`: 値を変更できない定数
- `var`: 古い記述方法（現在は `let` を推奨）

## データ型

JS のデータ型には主に次のようなものがあります。

```js
let score = 100; // 数値型（整数や小数）
let message = "Hello World"; // 文字列型（テキスト）
let isActive = true; // 真偽型（true/false）
let numbers = [1, 2, 3, 4, 5]; // 配列（複数の値を格納）
let user = { name: "Bob", age: 30 }; // オブジェクト（キーと値のセット）
```

## 演算子

演算子を使うことで、値の計算や比較ができます。

### 算術演算子

```js
let a = 10;
let b = 3;
console.log(a + b); // 足し算 → 13
console.log(a - b); // 引き算 → 7
console.log(a * b); // 掛け算 → 30
console.log(a / b); // 割り算 → 3.333...
console.log(a % b); // 剰余 → 1
```

### 比較演算子

```js
console.log(10 === "10"); // false（型まで比較）
console.log(10 == "10"); // true（値だけ比較）
console.log(5 > 3); // true
console.log(5 <= 3); // false
```

### 論理演算子

```js
console.log(true && false); // false (AND)
console.log(true || false); // true  (OR)
console.log(!true); // false (NOT)
```

## 条件分岐

条件分岐は `if` や `switch` を使って、状況に応じた処理を実行します。

### if

```js
let score = 85;

if (score >= 80) {
  console.log("Excellent!");
} else if (score >= 50) {
  console.log("Pass");
} else {
  console.log("Fail");
}
```

### switch

```js
let fruit = "apple";

switch (fruit) {
  case "apple":
    console.log("This is an apple.");
    break;
  case "banana":
    console.log("This is a banana.");
    break;
  default:
    console.log("Unknown fruit.");
}
```

# ループ（繰り返し処理）

### for 文

```js
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}
```

### while 文

```js
let count = 0;
while (count < 3) {
  console.log(count);
  count++;
}
```

### for...of（配列用）

```js
let colors = ["red", "blue", "green"];

for (let color of colors) {
  console.log(color);
}
```

### for...in（オブジェクト用）

```js
let person = { name: "Alice", age: 25 };

for (let key in person) {
  console.log(key + ": " + person[key]);
}
```

# DOM 操作

## DOM とは

DOM（Document Object Model）は、Web ページ（HTML）や JS で操作するための仕組みです。
HTML の各要素は「オブジェクト」として表現され、JS を使って追加・変更・削除が可能になります。

## DOM の基本構造

まずは以下のコードをコピーして `index.html` に貼り付けてください。

```html
<!DOCTYPE html>
<html>
  <head>
    <title>DOM 操作</title>
  </head>
  <body>
    <h1 id="title">Hello, World!</h1>
    <p class="description">This is a paragraph.</p>
    <button id="btn">Click me</button>
  </body>
</html>
```

この HTML は、以下のようなツリー構造になっています。

```less
document
 ├── html
      ├── head
      ├── body
           ├── h1#title
           ├── p.description
           ├── button#btn

```

## 要素の取得

JS を使って HTML の要素を取得するには、次のメソッドを使用します。

### 　`getElementById`（ID で取得）

指定した ID を持つ HTML 要素を 1 つ取得する メソッドです。

```js
const title = document.getElementById("title");
console.log(title.textContent); // "Hello, World!"
```

### `getElementsByClassName`（クラスで取得）

指定したクラス名を持つ要素をすべて取得する メソッドです。

```js
const paragraphs = document.getElementsByClassName("description");
console.log(paragraphs[0].textContent); // "This is a paragraph."
```

## 要素の更新

取得した HTML 要素の内容や属性を変更するには、以下のメソッドやプロパティを使用します。

### `textContent`（テキストの更新）

要素の テキストのみ を変更する方法です。

```js
const title = document.getElementById("title");
title.textContent = "Hello, JavaScript!";
```

### `innerHTML` （HTML を変更）

要素の HTML を含めた内容 を変更する方法です。

```js
const paragraph = document.getElementsByClassName("description")[0];
paragraph.innerHTML = "<strong>Updated content!</strong>";
```

# イベントリスナー

JS では 「ユーザーの操作」 に応じて処理を実行できます。
例えば、「ボタンをクリックしたらテキストを変更する」などの動作を実装するには、イベントリスナー を使います。

## `addEventListener` の基本

イベントリスナーを追加するには、`addEventListener` を使用します。

```js
element.addEventListener("イベント名", 実行する関数);
```

イベントとは、ユーザーがページ上で行う クリック・キー入力・スクロール・マウス移動 などの操作のことを指します。

- `click`: クリック時
- `mouseover`: マウスが要素の上に来たとき
- `mouseout`: マウスが要素から離れたとき
- `keydown`: キーが押されたとき
- `keyup`: キーが離されたとき
- `input`: 入力フォームの値が変更されたとき

### `click` イベント

9 行目の `<button id="btn">Click me</button>` がクリックされたことを検知するコードを書いてみましょう。

```js
// index.js
"use strict";

const btn = document.getElementById("btn");
btn.addEventListener("click", function () {
  console.log("クリックされました");
});
```

ボタンをクリックするたびに `クリックされました` のログが出力されるようになりました。

### `mouseover`

7 行目の `<h1 id="title">Hello, World!</h1>` にマウスがホバーしたことを検知するコードを書いてみましょう。

```js
// index.js
"use strict";

// ...

const title = document.getElementById("title");
title.addEventListener("mouseover", function () {
  console.log("マウスがホバーされました");
});
```

# 課題：カウンターアプリを作ろう

これまで学んだことを活かしてカウンターアプリを作ってみましょう。

```html
<!DOCTYPE html>
<html lang="ja">
  <body>
    <h1>カウンターアプリ</h1>
    <p id="count">0</p>
    <button id="increase">+1</button>
    <button id="decrease">-1</button>
    <button id="reset">リセット</button>
  </body>
</html>
```

<details><summary>回答</summary>

```js
"use strict";

const countDisplay = document.getElementById("count");
let count = 0;

document.getElementById("increase").addEventListener("click", function () {
  count++;
  countDisplay.textContent = count;
});

document.getElementById("decrease").addEventListener("click", function () {
  count--;
  countDisplay.textContent = count;
});

document.getElementById("reset").addEventListener("click", function () {
  count = 0;
  countDisplay.textContent = count;
});
```

</details>

# おわりに

いかがでしたか？
JS の基本文法、DOM の取得・変更、イベントリスナーなど、Web アプリでよく使われる機能の実装方法を学びました。

さらに、非同期処理 や ライブラリ・フレームワーク を活用すれば、よりモダンなアプリケーションを作ることができます。ぜひチャレンジしてみてください！✨
