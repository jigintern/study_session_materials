---
marp: true
theme: academic
paginate: true
size: 16:9
title: みんなで書き込める掲示板を作ってみよう！
style: |
  :root {
    --primary: #2a5c8a;
  }
  section h1, section h2, section h3 {
    color: #333;
  }
  section strong {
    color: var(--primary);
  }
  section a {
    color: var(--primary);
  }
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5em;
  }
  section.record::before {
    content: "記述";
    position: absolute;
    border: 3px solid var(--primary);
    color: var(--primary);
    top: 42px;
    right: 42px;
    padding: 4px 14px;
    font-size: 1.2em;
    font-weight: 700;
    letter-spacing: 0.1em;
    z-index: 10;
  }
  .mock {
    border: 3px solid var(--primary);
    border-radius: 14px;
    padding: 10px 18px;
    width: 100%;
  }
  .mock .part {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 2px dashed #aaa;
    border-radius: 8px;
    padding: 6px 14px;
    margin: 10px 0;
    font-size: 0.85em;
  }
  .mock .label {
    color: var(--primary);
    font-weight: 700;
    font-size: 0.9em;
    margin-left: 1em;
    white-space: nowrap;
  }
  .mock .btn {
    display: inline-block;
    border: 2px solid #888;
    border-radius: 8px;
    padding: 2px 16px;
    margin-right: 10px;
  }
  .mock .row {
    display: flex;
    align-items: center;
  }
  .mock .empty {
    color: #999;
  }
  .flow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6em;
    margin: 0.8em 0;
  }
  .flow .box {
    border: 3px solid var(--primary);
    border-radius: 12px;
    padding: 12px 20px;
    font-weight: 700;
    text-align: center;
  }
  .flow .arrow {
    color: var(--primary);
    font-size: 1.6em;
    font-weight: 700;
  }
  .flow .note {
    font-size: 0.75em;
    font-weight: 400;
    color: #666;
    display: block;
  }
  section.compact pre {
    font-size: 0.65em;
  }
  section.compact table {
    font-size: 0.8em;
  }
  section mark {
    background: #ffe066;
    color: inherit;
    padding: 0 0.15em;
    border-radius: 4px;
  }
  .timer-box {
    position: absolute; top: 44px; right: 190px;
    display: flex; align-items: center; gap: 8px;
    user-select: none;
    z-index: 10;
  }
  .timer {
    font-size: 40px; font-weight: bold;
    font-variant-numeric: tabular-nums;
    color: #888;
    cursor: pointer;
    padding: 2px 12px; border-radius: 8px;
    background: rgba(0,0,0,0.04);
    line-height: 1.2;
  }
  .timer.running { color: #e33; }
  .timer.warn    { color: #f80; }
  .timer.done    {
    color: #fff; background: #e33;
    animation: timer-done-flash 0.8s step-end infinite;
  }
  .timer-btn {
    font-size: 18px; font-weight: bold;
    width: 32px; height: 32px; border-radius: 50%;
    border: 2px solid #888; background: white; color: #888;
    cursor: pointer; line-height: 1; padding: 0;
  }
  .timer-btn:hover { background: #eee; }
  @keyframes timer-done-flash {
    50% { color: #e33; background: rgba(0,0,0,0.04); }
  }
---

<!-- _class: lead -->

# みんなで書き込める**掲示板**を作ってみよう！

## JavaScript ではじめる Web アプリ開発

---

## 今日のゴール：**書いた文字が、他の人の画面にも出る**

![bg right:40% fit](screenshots/completed.png)

- 名前とメッセージを書いて、投稿ボタンを押す
- 投稿が一覧に並ぶ
- 「更新」を押すと、**他の人が書いた投稿も出てくる**
- ブラウザを閉じても投稿は消えない

自分のパソコンの中だけで完結しない、はじめての Web アプリです。

---

## Webページは **3つの技術** でできている

| 技術 | 役割 |
|------|------|
| HTML | 構造 |
| CSS | 見た目 |
| **JavaScript** | **動き** |

HTML と CSS は用意ずみです。今日書くのは **JavaScript** だけ。

そして今日は、そこに**サーバー**が加わります。

---

## 準備

![bg right:38% fit](screenshots/template-initial.png)

1. ブラウザで StackBlitz のテンプレートを開く
2. 左に HTML / CSS / JS のファイル、右にプレビュー
3. さわるのは **`script.js` だけ**
4. `index.html` `styles.css` は用意ずみ。開かなくて大丈夫です

テンプレートは「入力欄とボタンだけが並んだ、まだ何も動かない状態」から始まります。

---

## 今日の進め方

1. 書いた文字を画面に出す
2. サーバーってなに？
3. みんなの投稿を読みこむ
4. 自分の投稿をサーバーに送る
5. 仕上げ

前半で「自分の画面の中だけで動く掲示板」を作り、後半でそれを**サーバーにつなぎ替え**ます。

---

<!-- _class: record -->

## スライドの見かた

### 右上に「記述」バッジ → 手を動かしてコードを書くスライド

**ハイライトあり** — その部分だけ書き足す

```javascript
function addPost() {
  const name = document.getElementById('name-input').value;
  @@const text = document.getElementById('text-input').value;@@
}
```

**ハイライトなし** — コードをそのまま写す

```javascript
document.getElementById('post-btn').addEventListener('click', addPost);
```

---

## 画面は **5つの部品** でできている

<div class="mock">
  <div class="part"><span>みんなの掲示板</span><span class="label">見出し</span></div>
  <div class="part"><span class="empty">名前</span><span class="label">① 名前の入力欄</span></div>
  <div class="part"><span class="empty">メッセージ</span><span class="label">② メッセージの入力欄</span></div>
  <div class="part"><span class="row"><span class="btn">投稿する</span><span class="btn">更新する</span></span><span class="label">③ 投稿ボタン　④ 更新ボタン</span></div>
  <div class="part"><span class="empty">（まだ何もありません）</span><span class="label">⑤ 投稿の一覧</span></div>
</div>

この5つに JavaScript から命令していきます。

---

## HTML（`index.html`）との対応

JavaScript から部品を呼ぶために、HTML には `id` が付いています。

| id | 部品 |
|----|------|
| `name-input` | ① 名前の入力欄 |
| `text-input` | ② メッセージの入力欄 |
| `post-btn` | ③ 投稿ボタン |
| `reload-btn` | ④ 更新ボタン |
| `posts` | ⑤ 投稿の一覧（`<ul>`） |

`id` = 部品につけた名札。JavaScript はこの名札を頼りに部品を探します。

---

<!-- _class: lead -->

# Chapter 1

## 書いた文字を画面に出そう

---

## この章のゴール

### 自分の画面の中だけで動く掲示板を作る

- 投稿ボタンを押す → 書いた文字が一覧に並ぶ
- 何件でも増えていく

まだサーバーは使いません。ページを再読みこみすると消えます。

そこを Chapter 2 以降で解決していきます。

---

<!-- _class: record -->

## 1-1. ボタンを押したら反応させよう

<div class="timer-box" data-seconds="180">
  <button class="timer-btn" data-delta="-60">−</button>
  <div class="timer"></div>
  <button class="timer-btn" data-delta="60">＋</button>
</div>

### まず「押したら何か起きる」を確かめる

**書く場所** — `script.js` のいちばん下

```javascript
function addPost() {
  alert('投稿ボタンが押されました！');
}

document.getElementById('post-btn').addEventListener('click', addPost);
```

**成功** — 「投稿する」を押すとメッセージが出る

---

## 1-1. いま書いた3つのこと

**関数** = 処理に名前をつけてまとめたもの

```javascript
function addPost() { ... }
```

**`document.getElementById('post-btn')`** = HTML から名札で部品を探す

**`addEventListener('click', addPost)`** = その部品がクリックされたら `addPost` を実行する

「押されたら呼んでね」と登録しておくだけで、押すのは利用者です。

---

<!-- _class: record -->

## 1-2. 入力欄の文字を取り出そう

<div class="timer-box" data-seconds="240">
  <button class="timer-btn" data-delta="-60">−</button>
  <div class="timer"></div>
  <button class="timer-btn" data-delta="60">＋</button>
</div>

### 決めうちのメッセージではなく、入力された文字を使う

**書く場所** — `addPost` の中を丸ごと置き換え

```javascript
function addPost() {
  const name = document.getElementById('name-input').value;
  const text = document.getElementById('text-input').value;

  alert(`${name} さん: ${text}`);
}
```

**成功** — 名前とメッセージを入力して押すと、その中身が出る

---

## 1-2. 新しく出てきた書き方

**`.value`** = 入力欄に書かれている文字

部品そのものではなく「中身」を取り出すときに使います。

**バッククォート `` ` `` の文字列** = `${ }` の中に変数を差しこめる

```javascript
const name = 'たろう';

`${name} さん`   // → 'たろう さん'
'name さん'      // → 'name さん'（差しこまれない）
```

差しこみが要らないときは、ふつうの `'` で書きます。

---

<!-- _class: record -->

## 1-3. 画面に1件だけ出してみよう

<div class="timer-box" data-seconds="360">
  <button class="timer-btn" data-delta="-60">−</button>
  <div class="timer"></div>
  <button class="timer-btn" data-delta="60">＋</button>
</div>

### `alert` をやめて、一覧に並べる

**書く場所** — `addPost` の中を丸ごと置き換え

```javascript
function addPost() {
  const name = document.getElementById('name-input').value;
  const text = document.getElementById('text-input').value;

  const item = document.createElement('li');
  item.textContent = `${name}: ${text}`;
  document.getElementById('posts').appendChild(item);
}
```

**成功** — 投稿するたびに、下の一覧に行が増えていく

---

## 1-3. 画面に部品を足す3ステップ

| やること | 書き方 |
|---|---|
| ① 部品を作る | `document.createElement('li')` |
| ② 中身の文字を入れる | `item.textContent = '...'` |
| ③ 画面にくっつける | `親.appendChild(item)` |

作っただけでは画面に出ません。③ で「どこにくっつけるか」を指定して、はじめて表示されます。

---

## 1-3. なぜ `textContent` なのか

### 他の人が書いた文字を、そのまま画面に出すから

似たものに `innerHTML` があります。違いは、**書かれた文字を HTML として解釈するかどうか**です。

| 書き方 | `<b>あ</b>` と投稿されたら |
|---|---|
| `textContent` | `<b>あ</b>` と、そのまま表示される |
| `innerHTML` | **あ** と太字になる（HTML として実行される） |

今日は他の人の投稿が自分の画面に流れてきます。`innerHTML` だと、他人の書いた文字に自分のページを勝手に書き換えられてしまいます。

**掲示板やコメント欄では `textContent`** を使います。

---

<!-- _class: record -->

## 1-4. 投稿をためて表示しよう

<div class="timer-box" data-seconds="840">
  <button class="timer-btn" data-delta="-60">−</button>
  <div class="timer"></div>
  <button class="timer-btn" data-delta="60">＋</button>
</div>

### 「ためる」と「表示する」を分ける

**書く場所** — `script.js` を丸ごと置き換え（前のものは消す）

```javascript
const posts = [];

function showPosts() {
  const list = document.getElementById('posts');
  list.textContent = '';

  for (const post of posts) {
    const item = document.createElement('li');
    item.textContent = `${post.name}: ${post.text}`;
    list.appendChild(item);
  }
}
```

次のスライドに続きます。

---

<!-- _class: record -->

## 1-4. 続き

**書く場所** — さきほどの続き（`script.js` のいちばん下）

```javascript
function addPost() {
  const name = document.getElementById('name-input').value;
  const text = document.getElementById('text-input').value;

  posts.push({ name: name, text: text });

  document.getElementById('text-input').value = '';
  showPosts();
}

document.getElementById('post-btn').addEventListener('click', addPost);
```

**成功** — 投稿すると一覧が増え、メッセージ欄が空になる

---

## 1-4. なぜ2つの関数に分けたのか

### あとで**この2つの中身だけ**を差し替えるからです

| 関数 | やること |
|---|---|
| `addPost()` | 投稿を1件**ふやす** |
| `showPosts()` | 投稿を**ぜんぶ表示する** |

いまは「ふやす先」が `posts` という配列です。

Chapter 3 以降で、この行き先を**サーバー**に変えます。やることは同じで、置き場所だけが変わります。

---

## 1-4. 出てきた書き方のまとめ

**配列** = データを順番に並べたリスト

```javascript
const posts = [];              // 空のリスト
posts.push({ name: 'たろう', text: 'やっほー' });   // 末尾に足す
```

**オブジェクト** `{ name: ..., text: ... }` = 名前つきのデータのまとまり

**`for...of`** = リストの中身を1つずつ取り出して繰り返す

**`list.textContent = ''`** = 中身を空にする。表示のたびに全部消してから並べ直しています

---

## 動作チェック

![bg right:38% fit](screenshots/chapter1-local.png)

### 3つとも当てはまれば Chapter 1 は完了です

1. 名前とメッセージを入れて「投稿する」を押すと、一覧に1行増える
2. もう一度投稿すると、2行になる（前の行が消えない）
3. 投稿するとメッセージ欄が空になる

### ページを再読みこみしてみてください

投稿が**全部消えます**。ここが次の章の出発点です。

---

<!-- _class: lead -->

# Chapter 2

## サーバーってなに？

---

## いまの掲示板の困りごと

### 投稿が「自分のブラウザの中」にしかない

- ページを再読みこみすると消える
- 自分の画面にしか出ない。隣の人からは見えない

`posts` という配列は、開いているページの中にだけあります。ページを閉じれば一緒に消えます。

---

## サーバー = **データを置いておける場所**

<div class="flow">
  <div class="box">あなたの<br>ブラウザ</div>
  <div class="arrow">⇄</div>
  <div class="box">サーバー<span class="note">投稿はここに置く</span></div>
  <div class="arrow">⇄</div>
  <div class="box">ほかの人の<br>ブラウザ</div>
</div>

投稿をサーバーに置くと、2つのことが同時に解決します。

- ブラウザを閉じても**残る**
- 他の人も同じ場所を見にいけるので、**見える**

---

## サーバーとのやりとりは **2種類だけ**

| やること | 呼び方 |
|---|---|
| 置いてあるデータを**取ってくる** | **GET** |
| 新しいデータを**送る** | **POST** |

今日の掲示板でいうと、

- 投稿の一覧を読みこむ → **GET**
- 自分の投稿を書きこむ → **POST**

この2つしか使いません。

---

## やりとりの中身は **JSON** という形

JSON = データを文字列で表すための、共通の書き方です。

```json
[
  { "name": "たろう", "text": "はじめまして" },
  { "name": "はなこ", "text": "こんにちは" }
]
```

JavaScript の配列とオブジェクトによく似ています。

サーバーとブラウザは違う場所で動いているので、そのままではデータを渡せません。いったんこの形の**文字列**にしてやりとりします。

---

## `fetch` — サーバーに話しかける命令

```javascript
const res = await fetch('https://.../posts?room=sample');
const posts = await res.json();
```

| 行 | やっていること |
|---|---|
| `fetch(...)` | この住所（URL）に GET でとりにいく |
| `res` | 返ってきた**返事そのもの** |
| `res.json()` | 返事の中身を JSON として取り出す |

`res` はまだ封筒の状態です。`res.json()` で中を開けて、はじめて配列として使えます。

---

## `await` — **待つ印**

### サーバーとのやりとりには時間がかかる

サーバーは別の場所にあります。頼んでから返事が届くまでの時間は、ページの中だけで済む処理とは桁が違います。「返事が届くまで待つ」と書かないと、届く前に次の行へ進んでしまいます。

**ルールは2つだけ**

1. `fetch` と `res.json()` には `await` を付ける
2. `await` を使う関数には `async` を付ける

```javascript
async function showPosts() {
  const res = await fetch('...');
}
```

---

## `await` を忘れるとどうなるか

```javascript
const posts = res.json();          // await なし
console.log(posts);
```

```
Promise { <pending> }
```

中身の代わりに「まだ準備中です」という札が返ってきます。

この表示を見たら、`await` の付け忘れを疑ってください。今日いちばん出やすいエラーです。

---

<!-- _class: lead -->

# Chapter 3

## みんなの投稿を読みこもう

---

## 部屋（room）について

### 掲示板は開催回ごとに分かれています

`script.js` の1行目に、つなぎ先が用意されています。

```javascript
const API = 'https://...';   // さわらなくて大丈夫です
const ROOM = '...';          // 今日の部屋。講師が伝えます
```

`ROOM` を書き換えると別の掲示板につながります。今日は伝えられた値のままにしてください。

---

<!-- _class: record -->

## 3-1. `showPosts()` を書き換えよう

<div class="timer-box" data-seconds="480">
  <button class="timer-btn" data-delta="-60">−</button>
  <div class="timer"></div>
  <button class="timer-btn" data-delta="60">＋</button>
</div>

### 配列 `posts` を見にいくのをやめて、サーバーに取りにいく

**書く場所** — `showPosts` を丸ごと置き換え（前のものは消す）

```javascript
async function showPosts() {
  const res = await fetch(`${API}/posts?room=${ROOM}`);
  const posts = await res.json();

  const list = document.getElementById('posts');
  list.textContent = '';

  for (const post of posts) {
    const item = document.createElement('li');
    item.textContent = `${post.name}: ${post.text}`;
    list.appendChild(item);
  }
}
```

---

## 3-1. 変わったのは最初の3行だけ

```javascript
async function showPosts() {
  @@const res = await fetch(`${API}/posts?room=${ROOM}`);@@
  @@const posts = await res.json();@@

  const list = document.getElementById('posts');
  ...
```

- 関数の頭に `async` が付いた
- `posts` の作り方が「配列を見る」から「サーバーから取ってくる」に変わった

**表示する部分（`for` 以下）は1文字も変えていません。** やることが同じだからです。

この時点では画面はまだ変わりません。次で読みこむきっかけを作ります。

---

<!-- _class: record -->

## 3-2. 読みこむきっかけを作ろう

<div class="timer-box" data-seconds="180">
  <button class="timer-btn" data-delta="-60">−</button>
  <div class="timer"></div>
  <button class="timer-btn" data-delta="60">＋</button>
</div>

### 読みこむきっかけを2つ作る

**書く場所** — `script.js` のいちばん下

```javascript
document.getElementById('reload-btn').addEventListener('click', showPosts);

showPosts();
```

**成功** — ページを開いた時点で、すでに誰かの投稿が並んでいる

いちばん下の `showPosts()` は、ページを開いた瞬間に1回だけ実行するためのものです。

---

## 3-2. まだ投稿はできません

### いま動くのは「読む」だけです

「投稿する」を押しても、サーバーには何も届きません。配列 `posts` に足しているだけで、その配列はもう表示に使われていないからです。

**ここでは投稿が増えなくて正常です。** 次の章で送る側を作ります。

---

## 動作チェック

![bg right:38% fit](screenshots/chapter3-readonly.png)

### 2つとも当てはまれば Chapter 3 は完了です

1. ページを再読みこみしても、一覧が消えない
2. 「更新する」を押すと、**自分が書いていない投稿**が出てくる

### 2番が出たら

それは他の参加者が書いたものです。同じサーバーの、同じ部屋を見ています。

---

<!-- _class: lead -->

# Chapter 4

## 自分の投稿をサーバーに送ろう

---

## 送るときは、取るときより少し長い

### 「どこへ」だけでなく「何を」「どうやって」を伝える

```javascript
await fetch(URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: name, text: text }),
});
```

| 書くもの | 意味 |
|---|---|
| `method: 'POST'` | 取りにいくのではなく、送る |
| `headers` | 送るデータの種類は JSON です、という申告 |
| `body` | 送る中身そのもの |

---

## `JSON.stringify` — オブジェクトを文字列にする

サーバーとやりとりできるのは文字列だけです。オブジェクトのままでは送れません。

```javascript
const data = { name: 'たろう', text: 'やっほー' };

JSON.stringify(data);
// → '{"name":"たろう","text":"やっほー"}'
```

送るとき（`JSON.stringify`）と、受け取るとき（`res.json()`）で、ちょうど逆のことをしています。

---

<!-- _class: record -->

## 4-1. `addPost()` を書き換えよう

<div class="timer-box" data-seconds="480">
  <button class="timer-btn" data-delta="-60">−</button>
  <div class="timer"></div>
  <button class="timer-btn" data-delta="60">＋</button>
</div>

### 配列に足すのをやめて、サーバーに送る

**書く場所** — `addPost` を丸ごと置き換え（前のものは消す）

```javascript
async function addPost() {
  const name = document.getElementById('name-input').value;
  const text = document.getElementById('text-input').value;

  await fetch(`${API}/posts?room=${ROOM}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, text: text }),
  });

  document.getElementById('text-input').value = '';
  await showPosts();
}
```

---

## 4-1. ここも、変わったのは真ん中だけ

| 行 | Chapter 1 | いま |
|---|---|---|
| 入力欄から取る | 同じ | 同じ |
| 保存する | `posts.push(...)` | **`await fetch(..., POST)`** |
| 入力欄を空にする | 同じ | 同じ |
| 表示し直す | `showPosts()` | `await showPosts()` |

置き場所が配列からサーバーに変わっただけで、流れは Chapter 1 とまったく同じです。

最後の `await showPosts()` で、送ったあとに一覧を読み直しています。

---

<!-- _class: record -->

## 4-2. 使わなくなった配列を消そう

<div class="timer-box" data-seconds="120">
  <button class="timer-btn" data-delta="-60">−</button>
  <div class="timer"></div>
  <button class="timer-btn" data-delta="60">＋</button>
</div>

### `posts` はもう誰も見ていません

**書く場所** — `script.js` のいちばん上

```javascript
const posts = [];   // ← この行を削除する
```

サーバーが投稿を持つようになったので、手元の配列は役目を終えました。

残っていても動きますが、あとで読み返したときに「どっちが本物か」で迷います。

---

## 動作チェック

### 掲示板の完成です

1. 投稿すると、一覧に自分の投稿が出る
2. ページを再読みこみしても消えない
3. 隣の人に投稿してもらい、「更新する」を押すと**その投稿が出てくる**
4. 自分の投稿も、他の人の画面に出ている

3番と4番が確認できたら、あなたの書いたコードが**インターネットの向こう側とやりとりしている**ということです。

---

<!-- _class: lead -->

# 完成！

## みんなで書き込める掲示板ができました

---

<!-- _class: lead -->

# Chapter 5

## 仕上げをしよう

---

<!-- _class: record -->

## 5-1. 投稿の時刻を表示しよう

<div class="timer-box" data-seconds="180">
  <button class="timer-btn" data-delta="-60">−</button>
  <div class="timer"></div>
  <button class="timer-btn" data-delta="60">＋</button>
</div>

### サーバーは投稿された時刻も返しています

**書く場所** — `showPosts` の `for` の中、2行を書き換え

```javascript
  for (const post of posts) {
    const item = document.createElement('li');
    @@const time = new Date(post.createdAt).toLocaleTimeString();@@
    @@item.textContent = `${post.name}: ${post.text} (${time})`;@@
    list.appendChild(item);
  }
```

**成功** — 各投稿のうしろに `14:23:05` のような時刻が付く

---

## 5-1. サーバーが返している時刻の形

```json
{ "name": "たろう", "text": "やっほー", "createdAt": "2026-09-10T05:23:00.000Z" }
```

これは世界中どこでも同じ意味になるように決められた書き方で、人が読むには向いていません。

| 書き方 | 結果 |
|---|---|
| `new Date('2026-09-10T05:23:00.000Z')` | 日付として扱えるようにする |
| `.toLocaleTimeString()` | その人の国の形式に直す → `14:23:00` |

日付ごと出したいときは `.toLocaleString()` を使います。

---

## 5-2. 名前を変えて投稿してみよう

### 動くようになったら、遊んでみてください

- 名前を変えて投稿する
- 絵文字を入れてみる
- 長い文章を投稿してみる（一定の長さで切られます）
- 空のまま投稿してみる（送られません）

サーバー側には「1つの部屋に置ける投稿は200件まで」という制限があります。古いものから順に消えていきます。

---

<!-- _class: lead -->

# 発展課題

## 余裕がある人はチャレンジ！

---

<!-- _class: record -->

## 発展①：自動で更新されるようにする

### 「更新する」を押さなくても、新しい投稿が流れてくる

**書く場所** — `script.js` のいちばん下

```javascript
setInterval(showPosts, 3000);
```

`setInterval(関数, ミリ秒)` = 決まった間隔で、関数を何度も実行する

3000 ミリ秒 = 3秒ごとに `showPosts()` が呼ばれます。

**成功** — 何も押さなくても、他の人の投稿が出てくる

---

## 発展①：この書き方の弱点

### 新しい投稿がなくても、3秒ごとに聞きにいっている

<div class="flow">
  <div class="box">ブラウザ<span class="note">新着ある？</span></div>
  <div class="arrow">→</div>
  <div class="box">サーバー<span class="note">ないよ</span></div>
</div>

これを**ポーリング**といいます。間隔を短くするほど無駄な通信が増えます。

逆に、サーバーの側から「来たよ」と教えてくるやり方もあります。

- **SSE** — サーバーからの一方通行のお知らせ
- **WebSocket** — つなぎっぱなしにして双方向にやりとりする

今日は書きません。名前だけ覚えておいてください。

---

## 発展②：投稿を新しい順に並べる

### いまは古い順に並んでいます

`showPosts` の `for` の前に、1行足すと逆順になります。

```javascript
posts.reverse();
```

`reverse()` = 配列の並びをひっくり返す

SNS のタイムラインはたいてい新しい順です。どちらが読みやすいか、実際に切り替えて比べてみてください。

---

## 困ったときは

### 投稿しても何も起きない

- `Console` に `Promise { <pending> }` が出ていないか → `await` の付け忘れ
- 関数の頭に `async` は付いているか

### 一覧が空のまま

- `ROOM` の値が伝えられたものと同じか
- `showPosts()` を `script.js` のいちばん下に書いたか

### 何を試してもだめなとき

エラーの内容と、書いたコードをそのままチャットに貼ってください。

---

## 今日学んだこと

| やったこと | 使ったもの |
|---|---|
| 部品を探して、中身を取り出す | `getElementById` / `.value` |
| ボタンが押されたら動かす | `addEventListener` |
| 画面に部品を足す | `createElement` / `textContent` / `appendChild` |
| サーバーからデータを取る | `fetch` / `res.json()` / **GET** |
| サーバーにデータを送る | `fetch` / `JSON.stringify` / **POST** |
| 返事を待つ | `async` / `await` |

---

<!-- _class: lead -->

# おつかれさまでした！

## 自分の書いたコードが、他の人の画面を動かしました

<script>
document.querySelectorAll('.timer-box').forEach(box => {
  const el = box.querySelector('.timer');
  const initial = Number(box.dataset.seconds);
  let remain = initial;
  let id = null;

  const render = () => {
    const r = Math.max(remain, 0);
    const m = String(Math.floor(r / 60)).padStart(2, '0');
    const s = String(r % 60).padStart(2, '0');
    el.textContent = `${m}:${s}`;
    el.classList.toggle('warn', remain <= 60 && remain > 0);
    el.classList.toggle('done', remain <= 0);
  };
  const stop = () => { clearInterval(id); id = null; el.classList.remove('running'); };
  const start = () => {
    if (remain <= 0) return;
    el.classList.add('running');
    id = setInterval(() => {
      remain--;
      render();
      if (remain <= 0) stop();
    }, 1000);
  };

  el.addEventListener('click', () => {
    if (remain <= 0) { el.classList.remove('done'); return; }
    id ? stop() : start();
  });
  el.addEventListener('contextmenu', e => {
    e.preventDefault();
    stop();
    remain = initial;
    render();
  });
  box.querySelectorAll('.timer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      remain = Math.max(0, remain + Number(btn.dataset.delta));
      render();
    });
  });
  render();
});
</script>
