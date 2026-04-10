---
marp: true
theme: academic
paginate: true
size: 16:9
style: |
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5em;
  }
  .big {
    font-size: 1.6em;
    font-weight: 800;
    text-align: center;
    margin: 0.5em 0;
  }
---

<!-- _class: lead -->

# Webサイト開発勉強会

## オリジナルの自己紹介サイトを作ろう！

---

## 今日のゴール

<div class="big">自分の自己紹介ページを作る</div>

完成するとこんなページができます 👉

![bg right:40% fit](imgs/step5-sns.png)

---

## もくじ

1. **Webページの仕組み** — 開発環境の準備
2. **ページの土台を作ろう** — HTMLの基本構造
3. **ヘッダーを作ろう** — 見出し・テキスト・背景色
4. **プロフィールカードを作ろう** — 画像・横並び・影
5. **好きなものリストを作ろう** — リスト・装飾
6. **スキルバッジを作ろう** — インライン要素・折り返し
7. **SNSリンクを作ろう** — リンク・ボタン風デザイン
8. **応用課題** — ダークモード & もっと
9. **発表会**

---

<!-- _class: lead -->

# Chapter 1

## Webページの仕組み

---

## ふだん見ているWebページの裏側

ブラウザで Web ページを開くと、裏側では **3種類のファイル** が読み込まれています。

```
index.html   ← ページの構造（何があるか）
styles.css   ← 見た目の設定（どう見えるか）
script.js    ← 動きの設定（どう動くか）
```

この3つを書けば、Web ページが作れます。

---

## Webページを構成する3つの言語

| 言語 | 役割 | やること |
|------|------|----------|
| **HTML** | 構造 | ページに「何を置くか」を決める |
| **CSS** | 見た目 | 「どう見えるか」を決める |
| **JavaScript** | 動き | 「どう動くか」を決める |

---

## 例え話: 家を建てる

| | 役割 | 家で言うと |
|---|---|---|
| **HTML** | 構造 | 柱・壁・窓の配置（間取り図） |
| **CSS** | 見た目 | 壁紙の色・カーテン・家具（インテリア） |
| **JavaScript** | 動き | 自動ドア・照明のスイッチ（仕掛け） |

HTMLだけだと **骨組みだけの家**。
CSSを足すと **きれいな家** になる。
JSを足すと **便利な家** になる。

---

## もう少し具体的に

<div class="columns">
<div>

### HTML（構造）

- ページのタイトル
- 写真
- 箇条書きのリスト
- リンク
- ボタン

→ **「何があるか」を定義する**

</div>
<div>

### CSS（見た目）

- 背景の色
- 文字の大きさ
- 要素の配置（横並びなど）
- 角を丸くする
- 影をつける

→ **「どう見えるか」を決める**

</div>
</div>

---

## JavaScript（動き）

- ボタンを押したら色が変わる
- クリックしたら数が増える
- 時間がたったら表示が変わる

→ **「何かが起きたら、何かをする」**

今日は HTML と CSS をメインに使い、時間があれば最後に少しだけ JavaScript を体験します

---

![bg right fit](imgs/stackblitz.png)

## 開発環境: StackBlitz

今日は **StackBlitz** というWebサービスを使います。

- ブラウザだけで動く
- 左側: コードを書く場所
- 右側: プレビュー（結果がすぐ見える）

> コードを書き換えると、自動で右側の表示が更新されます。

---

## StackBlitz を開こう

1. https://stackblitz.com/edit/web-platform-erj9nbfe をクリック
2. 画面が表示されたら準備完了

### 確認すること

- 左側にファイル一覧が見える
- `index.html`, `styles.css`, `script.js` がある
- 右側にプレビューが表示されている
- コードを変えると **自動で画面が更新される**（ホットリロード）

---

## 今日使うファイル

```
index.html    ← HTMLを書くファイル
styles.css    ← CSSを書くファイル
script.js     ← JSを書くファイル（応用課題で使う）
```

- `index.html` にページの構造を書く
- `styles.css` に見た目を書く

---

<!-- _class: lead -->

# Chapter 2

## ページの土台を作ろう

---

## HTMLの基本構造

`index.html` を開くと、こんなコードが入っています。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="styles.css" />
    <title>自己紹介ページ</title>
  </head>
  <body>
    <!-- ここにコードを記入 -->
      <script src="script.js"></script>
  </body>
</html>
```

---

## 各パーツの意味

最初は **おまじない** だと思ってOKです。
大事なのは **`<body>` の中に書く** ということ。

| コード | 意味 |
|--------|------|
| `<!DOCTYPE html>` | 「これはHTMLです」という宣言 |
| `<head>` | ページの設定 |
| `<link>` | CSSファイルを読み込む |
| `<body>` | **ページの中身**（ここに書いたものが表示される） |

---

<!-- _class: lead -->

# Chapter 3

## ヘッダーを作ろう

---

## このチャプターで作るもの

![bg right:50% fit](imgs/part-header.png)

ピンクの背景に、
白い文字で **名前** と **一言メッセージ** を表示するヘッダーを作ります。

---

## HTMLの「タグ」とは

HTMLは **タグ** という目印を使って書きます。

タグをつけることで、ブラウザに **「これは見出しだよ」「これは文章だよ」** と伝えます。

```html
<h1>田中 はなこ</h1>
```

- `<h1>` → 「ここから見出し」（開始タグ）
- `</h1>` → 「見出しここまで」（終了タグ。`/` がつく）

タグで囲まれた部分が、そのタグの種類に応じて表示される。

---

## 今回使うタグ

| タグ | 意味 | 表示 |
|------|------|------|
| `<h1>` | 見出し（一番大きい） | **太く大きい文字** |
| `<p>` | 段落（パラグラフ） | ふつうの文章 |
| `<div>` | グループ化する箱 | 見た目は何もない（CSSで変える） |

`<div>` は **他のタグをまとめるための入れ物** として使います。

> なぜまとめるの？ → まとめることで **CSSをグループ単位で適用** できる。
> 例: ヘッダー全体に背景色をつけたい → `<h1>` と `<p>` を `<div>` でまとめて、その `<div>` に背景色を指定する。

---

## ヘッダーのHTML

`index.html` の `<body>` の中に追加します。

```html
<body>
  <div class="header">
    <h1>田中 はなこ</h1>
    <p>Web開発をはじめたばかりの大学生です！</p>
  </div>
  <script src="script.js"></script>
</body>
```

---

## CSSの書き方

次に見た目を整えます。CSSは `styles.css` に書きます。

```css
セレクタ {
  プロパティ: 値;
}
```

```css
body {              ← 「body に対して」
  color: pink;      ← 「文字色を pink にする」
}
```

- **セレクタ** = どの要素に適用するか
- **プロパティ** = 何を変えるか
- **値** = どう変えるか

---

## class属性 — HTMLとCSSを紐づける

```html
<div class="header">
```

↑ この `class="header"` が **名札** の役割。

```css
.header {
  background-color: pink;
}
```

↑ CSSでは `.header` と書くと、class="header" の要素に適用される。

> **class は名札、CSSはその名札を見てスタイルを適用する。**

---

## ヘッダーのCSS

`styles.css` に追加：

```css
body {
  margin: 0;
  padding: 0;
}

.header {
  background-color: #ff9a9e;
  text-align: center;
  padding: 40px 20px;
  border-radius: 0 0 20px 20px;
}
```

---

## ヘッダーCSSの各プロパティ

| プロパティ | 意味 |
|-----------|------|
| `margin: 0; padding: 0` | ページのデフォルト余白をなくす |
| `background-color: #ff9a9e` | 背景色（ピンク） |
| `text-align: center` | 文字を中央揃え |
| `padding: 40px 20px` | 内側の余白（上下40px、左右20px） |
| `border-radius: 0 0 20px 20px` | 角を丸くする |

---

## CSSでの色の指定方法

`#ff9a9e` って何？ → **カラーコード** です。

CSSで色を指定するには **2つの方法** があります。

### 1. 色の名前（英語）

```css
background-color: pink;
color: white;
```

`red`, `blue`, `pink`, `black`, `white` など約140色が使える。
ただし約140色しかないので、使いたい色がないことが多い。

→ より自由に色を指定するために **カラーコード** を使う。

---

## カラーコード

### 2. カラーコード（`#` + 6桁の英数字）

```css
background-color: #ff9a9e;
color: #fff;
```

`#` の後に **赤(R)・緑(G)・青(B)** を2桁ずつ指定する。
より細かい色が指定できる。

---

## カラーコードの読み方

6桁は **赤・緑・青** の順で、数字が大きいほどその色が強い。

- `#ff0000` → 赤が最大、他が0 → **赤！**
- `#0000ff` → 青が最大 → **青！**
- `#000000` → 全部0 → **黒**
- `#ffffff` → 全部最大 → **白**

> カラーコードは覚えなくてOK。
> ネットで **「カラーピッカー」** と検索すると好きな色を選べます。

---

## `border-radius` の4つの値

`border-radius` に4つの値を書くと、**左上・右上・右下・左下**（時計回り）を個別に指定できる。

```
border-radius: 0    0    20px  20px;
/*             左上  右上  右下  左下  */
```

→ 上は角ばったまま、下だけ丸くなる。

---

## ヘッダーの文字のCSS

```css
.header h1 {
  margin: 0;
  color: #fff;
}

.header p {
  margin: 8px 0 0;
  color: #fff;
}
```

`.header h1` = 「header の中にある h1」という意味。
これで **ヘッダーの中の見出しだけ** にスタイルを当てられる。

---

## ここまでの結果

ブラウザのプレビューを確認してみましょう。

![bg right:50% fit](imgs/step1-header.png)

> うまく表示されない場合は、タグの閉じ忘れがないか確認してください。

---

<!-- _class: lead -->

# Chapter 4

## プロフィールカードを作ろう

---

## このチャプターで作るもの

![bg right:50% fit](imgs/part-profile.png)

丸い写真と自己紹介テキストを **横並び** で表示するカードを作ります。

ここで **Flexbox** という横並びの技術を学びます。

---

## まず、カードを置く場所を作る

ヘッダーの下にカードを並べたい。でも画面幅いっぱいに広がると見づらい。
→ **コンテナ**（入れ物）を作って、幅を制限して中央に寄せます。

`index.html` の `<body>` に追加：

```html
<body>
  <div class="header">...</div>

  <div class="container">
    <!-- ここにカードを追加していく -->
  </div>
  <script src="script.js"></script>
</body>
```

---

## コンテナのCSS

`styles.css` に追加：

```css
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
```

| プロパティ | 意味 |
|-----------|------|
| `max-width: 600px` | 横幅を最大600pxに制限 |
| `margin: 0 auto` | 左右の余白を自動 → **中央寄せ** |
| `padding: 20px` | 内側に20pxの余白 |

---

## プロフィールのHTML

`<div class="container">` の中に追加：

```html
<div class="card">
  <div class="profile">
    <img
      src="写真のURL"
      alt="プロフィール写真"
      class="profile-img"
    >
    <div class="profile-text">
      <p>こんにちは！田中はなこです。</p>
      <p>東京に住んでいて、カフェ巡りと猫が好きです。</p>
    </div>
  </div>
</div>
```

---

## 新しいタグ: `<img>`

```html
<img src="画像のURL" alt="説明テキスト">
```

| 属性 | 意味 |
|------|------|
| `src` | 画像ファイルのURL（どの画像を表示するか） |
| `alt` | 画像が読み込めなかった時に表示される代替テキスト |

> `<img>` は **終了タグがない** 特殊なタグです。

---

## HTMLの入れ子構造

```html
<div class="card">           ← カード全体
  <div class="profile">      ← プロフィールのまとまり
    <img ...>                 ← 写真
    <div class="profile-text">← テキストのまとまり
      <p>...</p>
      <p>...</p>
    </div>
  </div>
</div>
```

**タグの中にタグを入れる** ことを **入れ子（ネスト）** と言います。
インデント（字下げ）で見やすくするのが大事。

---

## カードのCSS

```css
.card {
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-top: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
```

---

## カードCSSの各プロパティ

| プロパティ | 意味 |
|-----------|------|
| `border-radius: 16px` | 角を16px分まるくする |
| `padding: 24px` | カードの中の余白 |
| `margin-top: 20px` | カードの上に20pxの外側余白 |
| `box-shadow` | 影をつける（ふわっと浮いて見える） |

---

## `box-shadow` の値の読み方

```css
box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
/*          ↑  ↑    ↑     ↑                */
/*          横  縦  ぼかし  色              */
```

| 値 | 意味 |
|----|------|
| `0` | 横方向のずれ（0 = 真下に影） |
| `2px` | 縦方向のずれ（少し下にずれる） |
| `12px` | ぼかしの大きさ（大きいほどふんわり） |
| `rgba(0, 0, 0, 0.08)` | 影の色（黒の8%透明度） |

---

### `rgba()` とは？

```css
rgba(赤, 緑, 青, 透明度)
rgba(0, 0, 0, 0.08)  /* 黒色で、8%の濃さ = ほぼ透明 */
```

`0.08` → ほぼ見えないくらい薄い影。`0.3` にすると濃くなる。

---

## CSSの単位: `px` と `%`

カードのCSSに `16px` や `24px` が出てきました。これは何？

### `px`（ピクセル）

画面上の **点の数** で指定。最もよく使う単位。

```css
padding: 24px;     /* 24ピクセル分の余白 */
width: 100px;      /* 横幅100ピクセル */
```

---

## CSSの単位: `%`

### `%`（パーセント）

**親要素に対する割合** で指定。

```css
border-radius: 50%;  /* 50%で正円になる */
```

> 他にも `em`, `rem`, `vh` などの単位がありますが、今日は `px` と `%` だけ使います。

---

## padding と margin — 余白の考え方

カードのCSSに `padding` と `margin` がありました。これがCSSで **一番混乱しやすい** ところです。

```css
.card {
  padding: 24px;      /* ← これ何？ */
  margin-top: 20px;   /* ← これ何？ */
}
```

![bg right:40% fit](imgs/boxmodel.png)

---

## padding = 内側の余白

**枠の内側** にできる余白。中身に「ゆとり」を作る。

![bg right:50% fit](imgs/padding-compare.png)

```css
.card {
  padding: 24px;
}
```

---

## margin = 外側の余白

**要素と要素の間** にできる余白。要素同士の「距離」を作る。

![bg right:50% fit](imgs/margin-compare.png)

```css
.card {
  margin-top: 20px;
}
```

---

## padding / margin の値の書き方

```css
/* 値が1つ → 上下左右すべて同じ */
padding: 24px;

/* 値が2つ → 上下 / 左右 */
padding: 40px 20px;
/*        ↑上下  ↑左右 */

/* 値が4つ → 上 / 右 / 下 / 左（時計回り）*/
margin: 10px 20px 30px 40px;
/*      ↑上  ↑右  ↑下  ↑左 */
```

> よく使うのは **1つ（全方向同じ）** と **2つ（上下/左右）** です。

---

## padding / margin を確認する方法

ブラウザの **開発者ツール** で、要素の余白を視覚的に確認できます。

![bg right:50% fit](imgs/devtools-boxmodel.png)

> **F12** でDevToolsを開く → **Elements** → 右下の **Computed** タブ
> 困ったら開発者ツールで余白を確認する癖をつけると便利です！

---

## `display` プロパティとは

CSSの `display` は、**要素の並び方を決める** プロパティです。

| 値 | 意味 | 動き |
|---|---|---|
| `block` | ブロック表示（デフォルト） | 縦に積み重なる |
| `inline` | インライン表示 | 文中に並ぶ（幅・高さ指定不可） |
| `none` | 非表示 | 画面から消える |
| **`flex`** | **フレックス表示** | **子要素を自由に並べられる** |

今回は **`display: flex`** を使って、写真とテキストを横に並べます。

---

## Flexbox とは

**Flexbox**（フレックスボックス）= CSSで **要素を横並び・縦並びに配置する** 仕組み。

親要素に `display: flex` を書くと、**その中の子要素** の並び方を制御できます。

```css
.profile {        ← 親要素（これに flex を書く）
  display: flex;
}
```

```html
<div class="profile">     ← flex をつけた親
  <img ...>               ← 子要素① → 横に並ぶ
  <div class="profile-text">  ← 子要素② → 横に並ぶ
  </div>
</div>
```

---

## Flexbox のイメージ

![bg right fit](imgs/flexbox-compare.png)

`display: flex` をつけるだけで、子要素が横に並びます。

---

## Flexbox でよく使うプロパティ

```css
.profile {
  display: flex;
  align-items: center;
  gap: 20px;
}
```

| プロパティ | 意味 |
|-----------|------|
| `display: flex` | 子要素を **横に並べる** |
| `align-items: center` | 縦方向を **真ん中に揃える** |
| `gap: 20px` | 要素同士の **間隔** |

> Flexbox は CSS で最もよく使うレイアウト手法です。
> 今後 Web 開発を続けるなら何度も使います。

---

## 写真を丸くする

```css
.profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ff9a9e;
}
```

---

## 写真CSSの各プロパティ

| プロパティ | 意味 |
|-----------|------|
| `width`, `height` | 正方形にする（丸にするための準備） |
| `border-radius: 50%` | **50%で正円になる**（よく使うテクニック） |
| `object-fit: cover` | 画像を枠に合わせてトリミング |
| `border` | ピンクの枠線（詳しくは次のスライド） |

---

## `border` の値の読み方

```css
border: 3px solid #ff9a9e;
/*      ↑    ↑      ↑     */
/*      太さ 種類    色    */
```

**3つの値をスペース区切り** で書きます（順番は自由ですが、この順が一般的）。

| 値 | 意味 |
|----|------|
| `3px` | 線の太さ |
| `solid` | 線の種類（実線） |
| `#ff9a9e` | 線の色（ピンク） |

---

### 線の種類

| 値 | 見た目 |
|----|--------|
| `solid` | ─── 実線 |
| `dashed` | - - - 破線 |
| `dotted` | ・・・ 点線 |
| `none` | 線なし |

---

## テキストのCSS

```css
.profile-text p {
  margin: 4px 0;
  font-size: 15px;
  line-height: 1.6;
}
```

`line-height: 1.6` = 行間を1.6倍にする。
文章が読みやすくなります。

---

## ここまでの結果

![bg right:40% fit](imgs/step2-profile.png)

ヘッダー + プロフィールカードが表示されていればOK！

---

<!-- _class: lead -->

# Chapter 5

## 好きなものリストを作ろう

---

## このチャプターで作るもの

![bg right:50% fit](imgs/part-favorites.png)

♡マーク付きの **箇条書きリスト** で好きなものを表示します。

CSSの `::before` で装飾をカスタマイズする方法を学びます。

---

## リストのHTML

`<div class="container">` の中に、新しいカードを追加：

```html
<div class="card">
  <h2>好きなもの</h2>
  <ul class="favorites-list">
    <li>カフェ巡り</li>
    <li>猫</li>
    <li>ラーメン</li>
    <li>音楽を聴くこと</li>
    <li>写真を撮ること</li>
  </ul>
</div>
```

---

## 新しいタグ

| タグ | 意味 | 表示 |
|------|------|------|
| `<h2>` | 小見出し（h1 の次に大きい） | **太い中サイズ文字** |
| `<ul>` | 順番なしリスト（箇条書き） | ・が付いたリスト |
| `<li>` | リストの各項目 | 1つ1つの項目 |

```html
<ul>         ← リストの開始
  <li>項目1</li>
  <li>項目2</li>
  <li>項目3</li>
</ul>        ← リストの終了
```

---

## 見出しのCSS

```css
.card h2 {
  font-size: 20px;
  margin: 0 0 12px;
  color: #ff7eb3;
}
```

`.card h2` = 「card の中にある h2」にだけ適用。
すべての h2 ではなく、**カード内の見出しだけ** をピンクにします。

---

## リストの見た目をカスタマイズ

```css
.favorites-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.favorites-list li {
  padding: 6px 0;
  font-size: 15px;
}

.favorites-list li::before {
  content: "♡ ";
  color: #ff7eb3;
}
```

---

## ポイント解説

| コード | 意味 |
|--------|------|
| `list-style: none` | デフォルトの黒丸（・）を消す |
| `li::before` | 各 li の **前に** 何かを挿入する |
| `content: "♡ "` | 挿入する中身（ハートマーク） |

`::before` は **疑似要素** と呼ばれるもの。
HTMLを変えずに、CSSだけで飾りを追加できます。

> ♡ の部分を ✨ や ★ に変えても面白いです。

---

<!-- _class: lead -->

# Chapter 6

## スキルバッジを作ろう

---

## このチャプターで作るもの

![bg right:50% fit](imgs/part-badges.png)

スキルや趣味を **バッジ（タグ）** 風に横並びで表示します。

`<span>` と `<div>` の違いを学びます。

---

## バッジのHTML

```html
<div class="card">
  <h2>できること・学んでいること</h2>
  <div class="badges">
    <span class="badge">HTML</span>
    <span class="badge">CSS</span>
    <span class="badge">JavaScript</span>
    <span class="badge">写真</span>
    <span class="badge">デザイン</span>
  </div>
</div>
```

---

## `<span>` と `<div>` の違い

| タグ | 種類 | 特徴 |
|------|------|------|
| `<div>` | **ブロック要素** | 横幅いっぱいに広がる。前後に改行が入る |
| `<span>` | **インライン要素** | 中身の幅だけ。前後に改行が入らない |

バッジは小さなラベルなので `<span>` が適切です。

---

## `<div>` と `<span>` の領域の違い

![bg right:50% fit](imgs/block-vs-inline.png)

`<div>` は横幅いっぱいに広がる（ピンク）。

`<span>` は中身の幅だけ（紫）。

同じ「HTML / CSS / JavaScript」でも、タグによって占める領域が違う。

---

## バッジのCSS

```css
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.badge {
  background-color: #fff0f3;
  color: #ff7eb3;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}
```

`flex-wrap: wrap` → 1行に収まらない場合に **折り返す**

---

<!-- _class: lead -->

# Chapter 7

## SNSリンクを作ろう

---

## このチャプターで作るもの

![bg right:50% fit](imgs/part-sns.png)

ボタン風の **SNSリンク** を横並びで表示します。

---

## リンクのHTML

```html
<div class="card">
  <h2>SNS</h2>
  <div class="sns-links">
    <a href="#" class="sns-link">Twitter</a>
    <a href="#" class="sns-link">Instagram</a>
    <a href="#" class="sns-link">GitHub</a>
  </div>
</div>
```

### `<a>` タグ = リンクを作るタグ

| 属性 | 意味 |
|------|------|
| `href` | リンク先のURL（`#` は仮のリンク） |

`href` に自分のSNSのURLを入れると、本物のリンクになります。

---

## ボタン風のデザイン

```css
.sns-links {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.sns-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #ff9a9e;
  color: #fff;
  text-decoration: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: bold;
}
```

---

`text-decoration: none` → リンクの下線を消す

> ブラウザはデフォルトで `<a>` タグに青い文字 + 下線をつけます。
> `text-decoration: none` と `color: #fff` で、それをリセットしてボタン風に見せています。

---

## ホバー効果をつける

```css
.sns-link:hover {
  background-color: #ff7eb3;
}
```

### `:hover` とは？

マウスカーソルを **要素の上に乗せた時** に適用されるスタイル。

→ ボタンの上にマウスを乗せると、色が少し濃いピンクに変わる！

---

## 基礎パート完成！

ここまでで自己紹介ページの土台ができました 🎉

![bg right:35% fit](imgs/step5-sns.png)

### 今日使った HTML タグ
`<h1>` `<h2>` `<p>` `<div>` `<img>` `<ul>` `<li>` `<span>` `<a>`

### 今日使った CSS プロパティ
`background-color` `color` `padding` `margin` `border-radius` `box-shadow` `display: flex` `text-align` `::before` `:hover`

---

<!-- _class: lead -->

# Chapter 8

## 応用課題

---

## 応用課題の進め方

1. **ダークモード切替** — ここで JavaScript を体験します
2. 好きな応用課題を選んで自分のペースで進める
3. わからないことは **メンターに聞いてOK**

---

<!-- _class: lead -->

# ダークモード切替

## JavaScript を使います

---

## ダークモードとは

![bg right:40%](imgs/adv-a-darkmode.gif)

ページの配色を **明るい ↔ 暗い** に切り替える機能。

### なぜダークモードが使われている？

- **目に優しい** — 暗い場所で画面が眩しくない
- **バッテリー節約** — 有機ELディスプレイでは黒が省電力
- **ユーザーの好みに対応** — 多くのアプリ・サイトが標準搭載

> YouTube、Twitter、LINE、GitHub… ほぼすべての有名サービスが対応しています。

---

## ダークモードの作り方

### 流れ

1. **CSS** — 暗い配色のスタイルを追加する
2. **HTML** — 切り替えボタンを追加する
3. **JS** — ボタンを押したらスタイルを切り替える

---

## Step 1: ダークモード用のCSSを追加

`styles.css` の一番下に追加：

```css
body.dark {
  background-color: #1a1a2e;
  color: #e0e0e0;
}

body.dark .header {
  background-color: #2d2d5e;
}

body.dark .card {
  background-color: #16213e;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}
```

---

## `body.dark` って何？

```css
body.dark { ... }
```

これは「body に `dark` というクラスが **ついている時だけ** 適用する」という意味。

```html
<body>           → body.dark のスタイルは適用されない
<body class="dark"> → body.dark のスタイルが適用される
```

JavaScript で **このクラスをつけたり外したり** することで、切り替えを実現します。

---

## Step 2: 切り替えボタンのHTML

`index.html` の container の中、一番下に追加：

```html
<button class="dark-mode-btn" id="darkModeBtn">
  🌙 ダークモード
</button>
```

### 新しい要素

| 要素 | 意味 |
|------|------|
| `<button>` | クリックできるボタンを作るタグ |
| `id="darkModeBtn"` | この要素に **ユニーク（唯一の名前）** をつける |

---

## `class` と `id` の違い

| | `class` | `id` |
|---|---------|------|
| 書き方 | `class="card"` | `id="darkModeBtn"` |
| CSS | `.card { }` | `#darkModeBtn { }` |
| 使える数 | 同じ名前を **何個でも** 使える | 1ページに **1つだけ** |
| 用途 | スタイル用（同じ見た目のものに） | JS で特定の要素を見つける用 |

---

## ボタンのCSS

```css
.dark-mode-btn {
  display: block;
  margin: 24px auto 40px;
  padding: 10px 24px;
  border: 2px solid #ccc;
  border-radius: 25px;
  background: none;
  font-size: 14px;
  cursor: pointer;
  color: inherit;
}
```

---

## Step 3: JavaScriptで切り替える

`script.js` に追加：

```js
const btn = document.querySelector("#darkModeBtn");

btn.addEventListener("click", function() {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    btn.textContent = "☀️ ライトモード";
  } else {
    btn.textContent = "🌙 ダークモード";
  }
});
```

---

## JavaScript を1行ずつ解説（1/3）

```js
const btn = document.querySelector("#darkModeBtn");
```

| パーツ | 意味 |
|--------|------|
| `const btn` | `btn` という名前の **変数**（データを入れる箱）を作る |
| `document.querySelector(...)` | ページの中から要素を **探す** |
| `"#darkModeBtn"` | id が `darkModeBtn` の要素を指定 |

→ 「ページから `#darkModeBtn` ボタンを見つけて、`btn` に入れておく」

---

## JavaScript を1行ずつ解説（2/3）

```js
btn.addEventListener("click", function() {
  // ここに「クリックされた時にやること」を書く
});
```

| パーツ | 意味 |
|--------|------|
| `addEventListener` | 「○○が起きたら△△する」を登録する |
| `"click"` | 「クリック」というイベント |
| `function() { ... }` | クリックされた時に実行する処理 |

→ 「`btn` がクリックされたら、この処理を実行する」

---

## JavaScript を1行ずつ解説（3/3）

```js
document.body.classList.toggle("dark");
```

| パーツ | 意味 |
|--------|------|
| `document.body` | `<body>` 要素 |
| `.classList` | その要素が持つクラスの一覧 |
| `.toggle("dark")` | `dark` クラスがなければ **つける**、あれば **外す** |

→ 「body の dark クラスを ON/OFF する」

---

## 動作確認

ボタンをクリックしてみましょう！

- 1回押す → 背景が暗くなる（ダークモード ON）
- もう1回押す → 元に戻る（ダークモード OFF）

> うまく動かない場合は、ブラウザの開発者ツール（F12）でエラーを確認

---

## その他の応用課題（自走用）

ダークモードが終わった人は好きなものに挑戦！
手順とヒントを読みながら自分のペースで進めてください。
答えは各課題の下のトグルを開くと見られます。

---


## ★ いいねボタン

![bg right:35% fit](imgs/adv-b-like.png)

**完成イメージ**: プロフィールカードに ♡ ボタン。押すたびに数字が 1 ずつ増える。

### 手順

1. HTML: プロフィールカード内に `<button id="likeBtn">♡ 0 いいね</button>` を追加
2. CSS: ボタンにピンクの枠線・角丸のスタイルを作る
3. JS: `let count = 0` で数を記録。クリックで +1 して表示を更新

---

### ヒント

- ダークモードで学んだ `querySelector` + `addEventListener` がそのまま使える
- `btn.textContent = "♡ " + count + " いいね"` で表示を書き換え

---


## ★ いいねボタン — 答え

<details><summary>完成コード（クリックで開く）</summary>

```html
<button class="like-btn" id="likeBtn">♡ 0 いいね</button>
```
```js
let count = 0;
const likeBtn = document.querySelector("#likeBtn");
likeBtn.addEventListener("click", function() {
  count = count + 1;
  likeBtn.textContent = "♡ " + count + " いいね";
});
```

</details>

---


## ★ ページ訪問回数

**完成イメージ**: ヘッダーに「このページは N 回目の訪問です」と表示。ブラウザを閉じても回数が残る。

### 手順

1. HTML: ヘッダー内に `<div id="visitCount"></div>` を追加
2. JS: `localStorage.getItem("visitCount")` で前回の値を取得
3. +1 して `localStorage.setItem()` で保存し、画面に表示

### ヒント

- `localStorage` はブラウザにデータを保存する仕組み（閉じても消えない）
- 初回は値がないので `null` が返る → `0` からスタート
- `Number()` で文字列を数値に変換する

---

## ★ ページ訪問回数 — 答え

<details><summary>完成コード（クリックで開く）</summary>

```js
let visits = localStorage.getItem("visitCount");
if (visits === null) { visits = 0; }
visits = Number(visits) + 1;
localStorage.setItem("visitCount", visits);
document.querySelector("#visitCount").textContent = "このページは " + visits + " 回目の訪問です";
```

</details>

---


## ★ 現在時刻の表示

![bg right:35% fit](imgs/adv-c-clock.png)

**完成イメージ**: ヘッダーに「🕐 14:32:05」のように現在時刻が表示され、毎秒更新される。

### 手順

1. HTML: ヘッダー内に `<div id="clock"></div>` を追加
2. JS: `new Date()` で現在時刻を取得する関数を作る
3. JS: `setInterval(関数, 1000)` で1秒ごとに関数を呼び出す

---

### ヒント

- `now.getHours()`, `now.getMinutes()`, `now.getSeconds()` で時・分・秒が取れる
- `String(9).padStart(2, "0")` → `"09"` のように0埋めできる

---


## ★ 現在時刻の表示 — 答え

<details><summary>完成コード（クリックで開く）</summary>

```js
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  document.querySelector("#clock").textContent = "🕐 " + h + ":" + m + ":" + s;
}
updateClock();
setInterval(updateClock, 1000);
```

</details>

---


## ★★ タブ切り替え

![bg right:35% fit](imgs/adv-d-tabs.gif)

**完成イメージ**: 「好きなもの」カードに2つのタブ。クリックで「好きなもの」と「苦手なもの」の表示が切り替わる。

### 手順

1. HTML: タブボタン2つ + 中身の div を2つ用意（片方は非表示）
2. CSS: `.tab-content { display: none }` + `.tab-content.active { display: block }`
3. JS: タブクリックで全タブを非アクティブにしてから、押されたタブだけアクティブに

---

### ヒント

- ボタンに `data-tab="likes"` のようにデータ属性をつけると、どのタブが押されたか判定できる
- `this.getAttribute("data-tab")` でクリックされたタブの値を取得
- `#tab-likes`, `#tab-dislikes` のように id で中身を切り替える

---


## ★★ タブ切り替え — 答え

<details><summary>完成コード（クリックで開く）</summary>

```html
<div class="tab-header">
  <button class="tab-btn active" data-tab="likes">好きなもの</button>
  <button class="tab-btn" data-tab="dislikes">苦手なもの</button>
</div>
<div class="tab-content active" id="tab-likes">
  <ul class="favorites-list"><li>カフェ巡り</li><li>猫</li><li>ラーメン</li></ul>
</div>
<div class="tab-content" id="tab-dislikes">
  <ul class="favorites-list"><li>早起き</li><li>虫</li><li>満員電車</li></ul>
</div>
```
```js
const tabBtns = document.querySelectorAll(".tab-btn");
for (let i = 0; i < tabBtns.length; i++) {
  tabBtns[i].addEventListener("click", function() {
    for (let j = 0; j < tabBtns.length; j++) tabBtns[j].classList.remove("active");
    const allTabs = document.querySelectorAll(".tab-content");
    for (let j = 0; j < allTabs.length; j++) allTabs[j].classList.remove("active");
    this.classList.add("active");
    document.querySelector("#tab-" + this.getAttribute("data-tab")).classList.add("active");
  });
}
```

</details>

---


## ★★ 画像スライドショー

![bg right:35% fit](imgs/adv-e-slideshow.gif)

**完成イメージ**: フォトギャラリーに画像1枚 + ← → ボタン。ボタンで画像が切り替わり「1 / 3」と表示。最後の次は最初に戻る。

### 手順

1. HTML: 新しいカードに `<img id="slideshowImg">` + 前へ/次へボタン + カウンター
2. JS: 画像URLを配列で管理。`let currentPhoto = 0` で今何枚目か記録
3. JS: ボタンクリックでインデックスを変更し、画像の `src` とカウンターを更新

---

### ヒント

- 配列: `const photos = ["url1", "url2", "url3"]`
- `photos[currentPhoto]` で現在の画像URLを取得
- 最後→最初に戻す: `currentPhoto = (currentPhoto + 1) % photos.length`

---


## ★★ 画像スライドショー — 答え

<details><summary>完成コード（クリックで開く）</summary>

```js
const photos = ["画像URL1", "画像URL2", "画像URL3"];
let currentPhoto = 0;
const img = document.querySelector("#slideshowImg");
const counter = document.querySelector("#slideshowCounter");

function updateSlideshow() {
  img.src = photos[currentPhoto];
  counter.textContent = (currentPhoto + 1) + " / " + photos.length;
}
document.querySelector("#prevBtn").addEventListener("click", function() {
  currentPhoto = (currentPhoto - 1 + photos.length) % photos.length;
  updateSlideshow();
});
document.querySelector("#nextBtn").addEventListener("click", function() {
  currentPhoto = (currentPhoto + 1) % photos.length;
  updateSlideshow();
});
```

</details>

---


## ★★ カスタムカーソル

![bg right:35% fit](imgs/adv-i-cursor.png)

**完成イメージ**: マウスカーソルがピンクの丸に変わる。動かすとキラキラしたパーティクルが軌跡に残って消える。

### 手順

1. HTML: `<div id="customCursor"></div>` を追加
2. CSS: 丸いスタイル + `position: fixed` + `pointer-events: none`
3. JS: `mousemove` イベントでカーソル位置を更新。一定間隔でパーティクルを生成→自動削除

---

### ヒント

- `e.clientX`, `e.clientY` でマウス位置が取れる
- パーティクルは `document.createElement("div")` で動的に作り `document.body.appendChild()` で追加
- `setTimeout(function() { p.remove(); }, 600)` で自動削除
- `@keyframes` でフェードアウトアニメーションを定義

---


## ★★ カスタムカーソル — 答え

<details><summary>完成コード（クリックで開く）</summary>

```css
.custom-cursor {
  position: fixed; width: 20px; height: 20px; border-radius: 50%;
  background-color: #ff7eb3; pointer-events: none; z-index: 9999;
  transform: translate(-50%, -50%); mix-blend-mode: difference;
}
.cursor-particle {
  position: fixed; width: 8px; height: 8px; border-radius: 50%;
  background-color: #ff9a9e; pointer-events: none; z-index: 9998;
  animation: particle-fade 0.6s ease-out forwards;
}
@keyframes particle-fade {
  0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
}
```
```js
const cursor = document.querySelector("#customCursor");
let pc = 0;
document.addEventListener("mousemove", function(e) {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
  pc++;
  if (pc % 3 !== 0) return;
  const p = document.createElement("div");
  p.className = "cursor-particle";
  p.style.left = e.clientX + "px";
  p.style.top = e.clientY + "px";
  document.body.appendChild(p);
  setTimeout(function() { p.remove(); }, 600);
});
```

</details>

---


## ★★★ モーダル（ポップアップ）

![bg right:35% fit](imgs/adv-f-modal.gif)

**完成イメージ**: プロフィール写真をクリック → 画面全体が暗くなり写真が拡大表示。暗い部分 or × ボタンで閉じる。

### 手順

1. HTML: オーバーレイ div（暗い背景 + 拡大画像 + 閉じるボタン）を追加
2. CSS: `position: fixed` で画面全体を覆い、`display: none` で初期非表示
3. JS: 写真クリック → `.show` 追加。×クリック or 背景クリック → `.show` 削除

---

### ヒント

- `position: fixed; top: 0; left: 0; width: 100%; height: 100%` で全画面
- 背景は `rgba(0, 0, 0, 0.7)` で半透明の黒
- 背景自体のクリック判定: `if (e.target === modal)` で区別

---


## ★★★ モーダル — 答え

<details><summary>完成コード（クリックで開く）</summary>

```html
<div class="modal-overlay" id="modal">
  <div class="modal-content">
    <button class="modal-close" id="modalClose">✕</button>
    <img src="画像URL" class="modal-img">
  </div>
</div>
```
```css
.modal-overlay {
  display: none; position: fixed; top: 0; left: 0;
  width: 100%; height: 100%; background: rgba(0,0,0,0.7);
  z-index: 1000; justify-content: center; align-items: center;
}
.modal-overlay.show { display: flex; }
```
```js
const modal = document.querySelector("#modal");
document.querySelector("#profileImg").addEventListener("click", function() {
  modal.classList.add("show");
});
document.querySelector("#modalClose").addEventListener("click", function() {
  modal.classList.remove("show");
});
modal.addEventListener("click", function(e) {
  if (e.target === modal) modal.classList.remove("show");
});
```

</details>

---

## ★★★ ドラッグで並び替え

![bg right:35% fit](imgs/adv-g-drag.gif)

**完成イメージ**: 好きなものリストの項目をドラッグ&ドロップで順番変更。ドラッグ中は半透明、ドロップ先はハイライト。

### 手順

1. HTML: 各 `<li>` に `draggable="true"` を追加
2. CSS: `.dragging`（半透明）`.drag-over`（ハイライト）を定義
3. JS: `dragstart` / `dragend` / `dragover` / `drop` の4イベントを処理

---

### ヒント

- `e.preventDefault()` を `dragover` と `drop` で呼ぶ（必須）
- `insertBefore()` で DOM 上の順番を入れ替える
- ドラッグ元とドロップ先のインデックスを比較して前後を判定

---

## ★★★ ドラッグで並び替え — 答え

<details><summary>完成コード（クリックで開く）</summary>

```js
const list = document.querySelector("#likesList");
let dragItem = null;
list.addEventListener("dragstart", function(e) {
  dragItem = e.target; e.target.classList.add("dragging");
});
list.addEventListener("dragend", function(e) {
  e.target.classList.remove("dragging");
  const items = list.querySelectorAll("li");
  for (let i = 0; i < items.length; i++) items[i].classList.remove("drag-over");
});
list.addEventListener("dragover", function(e) {
  e.preventDefault();
  if (e.target.tagName === "LI" && e.target !== dragItem) {
    const items = list.querySelectorAll("li");
    for (let i = 0; i < items.length; i++) items[i].classList.remove("drag-over");
    e.target.classList.add("drag-over");
  }
});
list.addEventListener("drop", function(e) {
  e.preventDefault();
  if (e.target.tagName === "LI" && e.target !== dragItem) {
    const all = Array.prototype.slice.call(list.querySelectorAll("li"));
    if (all.indexOf(dragItem) < all.indexOf(e.target))
      list.insertBefore(dragItem, e.target.nextSibling);
    else list.insertBefore(dragItem, e.target);
  }
});
```

</details>

---

## ★★★ ミニクイズゲーム

![bg right:35% fit](imgs/adv-h-quiz.png)

**完成イメージ**: 「私の好きな食べ物は？」などの3択クイズ。正解は緑、不正解は赤。全3問、スコア表示付き。

### 手順

1. HTML: クイズ用カード（質問・選択肢エリア・結果・次へボタン・スコア）を追加
2. JS: クイズデータを配列で定義 `[{ question, options, answer }, ...]`
3. JS: `showQuiz()` でボタンを動的生成。クリックで正解判定→スタイル変更→スコア更新

---

### ヒント

- `document.createElement("button")` でボタンを動的に作れる
- `setAttribute("data-index", i)` でどの選択肢かを記録
- 二重クリック防止に `let answered = false` フラグを使う

---

## ★★★ ミニクイズゲーム — 答え

<details><summary>完成コード（クリックで開く）</summary>

```js
const quizData = [
  { question: "私の好きな食べ物は？", options: ["ラーメン","寿司","カレー"], answer: 0 },
  { question: "私が住んでいるのは？", options: ["大阪","東京","福岡"], answer: 1 },
  { question: "私の好きな動物は？", options: ["犬","うさぎ","猫"], answer: 2 }
];
let current = 0, score = 0, answered = false;
function showQuiz() {
  const q = quizData[current];
  document.querySelector("#quizQuestion").textContent =
    "Q" + (current+1) + ". " + q.question;
  const div = document.querySelector("#quizOptions");
  div.innerHTML = ""; answered = false;
  for (let i = 0; i < q.options.length; i++) {
    const btn = document.createElement("button");
    btn.className = "quiz-btn"; btn.textContent = q.options[i];
    btn.setAttribute("data-index", i);
    btn.addEventListener("click", function() {
      if (answered) return; answered = true;
      const sel = Number(this.getAttribute("data-index"));
      if (sel === quizData[current].answer) {
        this.classList.add("correct"); score++;
      } else {
        this.classList.add("wrong");
        div.querySelectorAll(".quiz-btn")[quizData[current].answer]
          .classList.add("correct");
      }
      if (current < quizData.length - 1)
        document.querySelector("#quizNext").style.display = "inline-block";
    });
    div.appendChild(btn);
  }
  document.querySelector("#quizNext").style.display = "none";
}
document.querySelector("#quizNext").addEventListener("click",
  function() { current++; showQuiz(); });
showQuiz();
```

</details>

---

## デザインのモダン化（上級チャレンジ）

**完成イメージ**: 同じ内容を、モダンなページに変身させる。

![bg right:30% fit](imgs/modern-demo.png)

### やること

1. ヒーローセクション — `height: 100vh` + 背景画像 + グラデーションオーバーレイ
2. ダークテーマ — 背景 `#0a0a0a`、文字 `#f5f5f5`
3. Google Fonts — `Inter` フォントの読み込み
4. カード廃止 → セクション + 区切り線レイアウト
5. スクロールアニメーション — `IntersectionObserver` + CSS `transition`

---

### ヒント

- `background: url(...) center/cover no-repeat` で背景画像
- `linear-gradient` を重ねて画像の上にオーバーレイ
- `transform: translateX(-60px)` → `translateX(0)` で横からスライドイン

> 完成版は `advanced/modern.html` を参照

---

<!-- _class: lead -->

# Chapter 9

## 発表会

---

## 発表会

今回作成したWebサイトを使用して自己紹介をしてみましょう！

### 発表の内容
- 自分のページを画面に映す
- ページを使って **自己紹介**
- 応用課題をやった人はそれも見せてください

---

<!-- _class: lead -->

# Chapter 10

## まとめ

---

## 今日やったこと

![bg right:40% fit](imgs/step5-sns.png)

### HTML
`h1` `h2` `p` `div` `img`
`ul` `li` `span` `a`

### CSS
背景色・文字色・配置・角丸
影・Flexbox・ホバー効果

---

## 次に学ぶとよいこと

| トピック | 内容 |
|----------|------|
| **レスポンシブ** | スマホ対応のデザイン（`@media`） |
| **JavaScript** | もっと色々な動きをつける |
| **Git & GitHub** | コードの履歴管理・共同開発 |
| **フレームワーク** | React, Vue などの開発ツール |
| **デザイン** | UI/UX デザインの考え方 |