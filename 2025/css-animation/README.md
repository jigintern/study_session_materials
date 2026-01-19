# CSS Animation ハンズオン

実践で使える CSS アニメーションをハンズオン形式で学ぶ勉強会の資料です。

## 🎯 学習目標

このハンズオンを通じて、以下のスキルを習得できます：

- CSS の `@keyframes` を使ったアニメーションの作成
- `animation` プロパティの理解と活用
- `transition` を使ったスムーズな状態変化
- スクロール連動アニメーションの実装
- パフォーマンスを考慮したアニメーション設計
- アクセシビリティへの配慮（`prefers-reduced-motion`）

## 📋 必要な前提知識

- HTML/CSS の基本的な知識
- セレクタの理解
- CSS プロパティ（`opacity`, `transform` など）の基本

## 📁 ファイル構成

```
2025/css-animation/
├── index.html          # トップページ
├── about.html          # Aboutページ
├── archive.html        # アーカイブページ
├── article.html        # 記事詳細ページ
├── styles.css          # 基本スタイル（完成済み）
├── animations.css      # アニメーション（学習用）← これを編集します！
├── script.js           # JavaScript（完成済み）
├── articles.json       # 記事データ
├── README.md           # このファイル
└── complete/           # 完成版（参考用）
    └── ...
```

## 🚀 始め方

1. ブラウザで `index.html` を開く
2. `animations.css` を開いて、各ステップのコメントを外していく
3. ブラウザをリロードして動作を確認
4. 完成版（`complete/animations.css`）と比較して確認

## 💡 ハンズオンの進め方

`animations.css` では、各アニメーションのプロパティがコメントアウトされています。

```css
/* コメントを外す前 */
.nav {
  /* animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1); */
}

/* コメントを外した後 */
.nav {
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**コメントを外すだけ**でアニメーションが適用されます！

## 📚 学習ステップ

### Step 1: 基本的な @keyframes アニメーション

まずは `@keyframes` の中身のコメントを外して、アニメーションの基礎を理解しましょう。

#### 1-1. fadeIn アニメーション

`animations.css` の9行目付近にある `@keyframes fadeIn` のコメントを外します。

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

**ポイント:**
- `from` と `to` で開始と終了の状態を定義
- `opacity` で透明度を制御

#### 1-2. fadeInUp アニメーション

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**ポイント:**
- `transform: translateY()` で縦方向の移動
- 複数のプロパティを同時にアニメーション

#### 1-3. bounce アニメーション

```css
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

**ポイント:**
- `%` 記法で中間の状態を定義
- `0%, 100%` のように複数のタイミングをまとめて指定可能

#### 1-4. typing-reveal アニメーション

```css
@keyframes typing-reveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Step 2: ナビゲーションのアニメーション

ページを開いたときにナビゲーションがフェードインするアニメーションを追加します。

#### 2-1. ナビゲーションのフェードイン

`.nav` のコメントを外します。

```css
.nav {
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**確認方法:** ページをリロードすると、上部のナビゲーションバーがフェードインします。

#### 2-2. ナビゲーションロゴのホバー

```css
.nav-logo {
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-logo:hover {
  color: var(--color-accent);
}
```

**確認方法:** 「DesignJournal」のロゴにマウスをホバーすると色が変わります。

#### 2-3. ナビゲーションメニューリンクのホバー

```css
.nav-menu a {
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-menu a:hover,
.nav-menu a:focus,
.nav-menu a.active {
  color: var(--color-accent);
}

.nav-menu a::after {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**確認方法:** 「ホーム」「アーカイブ」「About」のリンクにマウスをホバーすると色が変わります。

#### 2-4. テーマ切替ボタンのホバー

```css
.theme-toggle {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  transform: rotate(180deg);
}

.theme-toggle:hover svg {
  stroke: white;
}

.theme-toggle svg {
  transition: stroke 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**確認方法:** 右上のテーマ切替ボタンにマウスをホバーすると回転します。

### Step 3: ヒーローセクションのアニメーション

トップページの大きなタイトルにアニメーションを追加します。

#### 3-1. タイピングアニメーション

```css
.typing-text {
  overflow: hidden;
}

.typing-text .title-line {
  display: block;
  opacity: 0;
  animation: typing-reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.typing-text .title-line:nth-child(1) {
  animation-delay: 0.2s;
}

.typing-text .title-line:nth-child(2) {
  animation-delay: 0.5s;
}

.typing-text .title-line:nth-child(3) {
  animation-delay: 0.8s;
}
```

**確認方法:** ページをリロードすると、「Create」「Beautiful」「Experiences」が順番に表示されます。

#### 3-2. スクロールインジケーター

```css
.scroll-indicator {
  animation: fadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 1.5s forwards;
  opacity: 0;
}

.scroll-arrow {
  animation: bounce 2s ease-in-out infinite;
}
```

**確認方法:** ページを開いて1.5秒後に、下向き矢印がフェードインして跳ね続けます。

### Step 4: ボタンのアニメーション

ボタンにホバーエフェクトとクリックエフェクトを追加します。

#### 4-1. ボタンの基本トランジション

```css
.btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover,
.btn-primary:focus {
  background: var(--color-accent-hover);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-secondary:hover,
.btn-secondary:focus {
  background: var(--color-accent);
  color: white;
}
```

**確認方法:** 「記事を読む」「続きを読む」ボタンにマウスをホバーすると色が変わり、影が付きます。

#### 4-2. ボタンのリップルエフェクト

```css
.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:active::before {
  width: 300px;
  height: 300px;
}
```

**確認方法:** ボタンをクリックすると、波紋が広がります。

### Step 5: カードのアニメーション

記事カードにホバーエフェクトを追加します。

#### 5-1. カードのホバー時の背景色変化

```css
.featured-card:hover {
  background: var(--color-surface);
}

.article-card:hover {
  background: var(--color-surface);
}
```

**確認方法:** 記事カードにマウスをホバーすると背景色が変わります。

### Step 6: リンクのアニメーション

テキストリンクにホバーエフェクトを追加します。

#### 6-1. 基本的なリンクのホバー

```css
a {
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

a:hover,
a:focus {
  color: var(--color-accent-hover);
}
```

#### 6-2. フッターリンクのホバー

```css
.footer-links a:hover {
  color: var(--color-accent);
}
```

**確認方法:** ページ下部のフッターリンクにマウスをホバーすると色が変わります。

#### 6-3. リンクのアンダーラインアニメーション

```css
a:not(.btn):not(.card-link-wrapper):not(.social-link):not(.social-link-large):not(.nav-logo) {
  position: relative;
}

a:not(.btn):not(.card-link-wrapper):not(.social-link):not(.social-link-large):not(.nav-logo)::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: currentColor;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

a:not(.btn):not(.card-link-wrapper):not(.social-link):not(.social-link-large):not(.nav-logo):hover::after {
  width: 100%;
}
```

**確認方法:** テキストリンクにマウスをホバーすると、下線が左から右に伸びます。

### Step 7: スクロールアニメーション

`.fade-in-on-scroll`、`.slide-in-left-on-scroll`、`.slide-in-right-on-scroll`、`.scale-in-on-scroll` クラスは、
JavaScriptと連携してスクロール時に要素を表示します。

コメントを外すと、ページをスクロールしたときに記事カードが順番にフェードインして表示されます。

### Step 8: ソーシャルリンクとアバターのアニメーション

about.html ページで確認できるアニメーションです。

#### 8-1. ソーシャルリンクのホバー

```css
.social-link,
.social-link-large {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.social-link:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
  transform: scale(1.1);
}

.social-link-large:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}
```

**確認方法:** about.html を開いて、ソーシャルリンクにマウスをホバーすると拡大します。

#### 8-2. アバター画像のホバー

```css
.avatar-large,
.author-avatar {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-large:hover {
  transform: scale(1.05) rotate(5deg);
}
```

**確認方法:** about.html のプロフィール画像にマウスをホバーすると、拡大して少し回転します。

### Step 9: スキルバーのアニメーション

about.html ページで確認できるアニメーションです。

#### 9-1. スキルバーの伸びるアニメーション

```css
.skill-progress {
  animation: skill-fill 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* animation-delay のコメントも外します */
.skill-item:nth-child(1) .skill-progress {
  animation-delay: 0.1s;
}

.skill-item:nth-child(2) .skill-progress {
  animation-delay: 0.2s;
}

.skill-item:nth-child(3) .skill-progress {
  animation-delay: 0.3s;
}

.skill-item:nth-child(4) .skill-progress {
  animation-delay: 0.4s;
}

.skill-item:nth-child(5) .skill-progress {
  animation-delay: 0.5s;
}

.skill-item:nth-child(6) .skill-progress {
  animation-delay: 0.6s;
}
```

**確認方法:** about.html を開いてスキルセクションまでスクロールすると、スキルバーが順番に伸びます。

### Step 10: タイムラインのアニメーション

about.html と archive.html ページで確認できるアニメーションです。

#### 10-1. タイムラインアイテムのアニメーション

```css
.timeline-item {
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-item.is-visible {
  opacity: 1;
  transform: translateX(0);
}

.timeline-article {
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-article.is-visible {
  opacity: 1;
  transform: translateX(0);
}
```

**確認方法:** about.html や archive.html でタイムラインまでスクロールすると、項目が左からスライドインします。

#### 10-2. タイムラインマーカーのアニメーション

```css
.timeline-marker {
  animation: scale-pulse 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.timeline-article-marker {
  animation: scale-pulse 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

**確認方法:** タイムラインの丸いマーカーが弾むように表示されます。

### Step 11: Scroll-driven Animations（モダンCSS）

最新のCSS仕様を使った高度なアニメーションです。

#### 11-1. スクロールプログレスバー

```css
@supports (animation-timeline: scroll()) {
  .scroll-progress,
  .reading-progress {
    animation: scroll-progress linear;
    animation-timeline: scroll(root);
  }
}
```

**確認方法:** ページをスクロールすると、上部に青い進捗バーが伸びます。

**注意:** このアニメーションは Chrome 115+ などの最新ブラウザでのみ動作します。

#### 11-2. パララックス効果

パララックス（視差）効果とは、**複数の要素が異なる速度で動くことで奥行きを表現する**テクニックです。
遠くの景色はゆっくり、近くの物は速く動くという現実世界の見え方を再現しています。

```css
@supports (animation-timeline: scroll()) {
  /* 背景画像：ゆっくり動く（遠くにあるように見える） */
  .parallax-image {
    animation: parallax-bg linear;
    animation-timeline: scroll(root);
    animation-range: 0 600px;
  }

  @keyframes parallax-bg {
    to {
      transform: translateY(100px);
    }
  }

  /* 装飾円1：速く動く（手前にあるように見える） */
  .parallax-circle-1 {
    animation: parallax-fast linear;
    animation-timeline: scroll(root);
    animation-range: 0 600px;
  }

  @keyframes parallax-fast {
    to {
      transform: translateY(300px);
    }
  }

  /* 装飾円2：中くらいの速度で動く */
  .parallax-circle-2 {
    animation: parallax-medium linear;
    animation-timeline: scroll(root);
    animation-range: 0 600px;
  }

  @keyframes parallax-medium {
    to {
      transform: translateY(200px);
    }
  }

  /* 装飾円3：とても速く動く（最も手前にあるように見える） */
  .parallax-circle-3 {
    animation: parallax-very-fast linear;
    animation-timeline: scroll(root);
    animation-range: 0 600px;
  }

  @keyframes parallax-very-fast {
    to {
      transform: translateY(400px);
    }
  }

  /* 四角形：回転しながら動く */
  .parallax-square {
    animation: parallax-rotate linear;
    animation-timeline: scroll(root);
    animation-range: 0 600px;
  }

  @keyframes parallax-rotate {
    to {
      transform: translateY(250px) rotate(225deg);
    }
  }
}
```

**確認方法:** article.html を開いてスクロールすると、ヒーロー画像の上に浮かぶ**白い円や四角形が異なる速度で下に移動**します。

**見どころ:**
- 背景のグラデーション画像は**ゆっくり**動く（100px）
- 白い円は**速く**動く（200px〜400px）
- 四角形は**回転しながら**動く
- これにより**奥行き感**が生まれます

**ポイント:**
- `animation-timeline: scroll(root)` でページ全体のスクロールに連動
- `animation-range: 0 600px` で最初の600pxのスクロールで完了
- 移動距離が大きいほど「手前」にあるように見える
- 移動距離が小さいほど「奥」にあるように見える

#### 11-3. ビューポート連動アニメーション

```css
@supports (animation-timeline: scroll()) {
  .fade-on-scroll {
    animation: fade-in-scroll linear;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
}
```

**確認方法:** `.fade-on-scroll` クラスを任意の要素に追加すると、画面に入ったときに自動的にフェードインします。

## 🎨 cubic-bezier() について

`cubic-bezier()` はアニメーションのイージング（加速・減速）を制御する関数です。

### よく使われる値

```css
/* スムーズな加速・減速 */
cubic-bezier(0.4, 0, 0.2, 1)

/* バウンス効果 */
cubic-bezier(0.68, -0.55, 0.265, 1.55)

/* 標準的なイージング */
ease-in-out
ease-in
ease-out
linear
```

### カスタマイズ

[cubic-bezier.com](https://cubic-bezier.com/) で視覚的に調整できます。

## ⚡ パフォーマンスのヒント

### アニメーション可能なプロパティ

パフォーマンスが良い（GPU アクセラレーション）:
- `transform`
- `opacity`

パフォーマンスが悪い（レイアウト再計算が必要）:
- `width`, `height`
- `top`, `left`
- `margin`, `padding`

### ベストプラクティス

```css
/* ❌ 避けるべき */
.element {
  transition: width 0.3s;
}

/* ✅ 推奨 */
.element {
  transition: transform 0.3s;
}
.element:hover {
  transform: scaleX(1.2);
}
```

## 🔍 デバッグのコツ

### ブラウザの開発者ツールを活用

1. **要素の検証**: 右クリック → 検証
2. **アニメーションの確認**: Styles パネルで animation プロパティを確認
3. **スロー再生**: DevTools の Animations パネルで速度調整

### よくあるエラー

#### アニメーションが動かない

```css
/* ❌ 間違い: animation-name が一致していない */
@keyframes fadeIn { ... }
.element {
  animation: fade-in 1s; /* fadeIn ではなく fade-in */
}

/* ✅ 正しい */
@keyframes fadeIn { ... }
.element {
  animation: fadeIn 1s;
}
```

#### transition が効かない

```css
/* ❌ 間違い: display は transition できない */
.element {
  display: none;
  transition: display 0.3s;
}

/* ✅ 正しい: opacity や visibility を使う */
.element {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;
}
```

## 📖 参考リンク

### 公式ドキュメント

- [MDN - CSS Animations](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_Animations)
- [MDN - CSS Transitions](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_Transitions)
- [MDN - transform](https://developer.mozilla.org/ja/docs/Web/CSS/transform)

### ツール

- [cubic-bezier.com](https://cubic-bezier.com/) - イージング関数の視覚化
- [Animista](https://animista.net/) - CSS アニメーションライブラリ
- [CSS Animation Generator](https://www.cssportal.com/css-animation-generator/)

### 学習リソース

- [CSS Tricks - Animation](https://css-tricks.com/almanac/properties/a/animation/)
- [Web.dev - Animations](https://web.dev/animations/)

## ✅ 完成確認

すべてのコメントを外したら、以下を確認しましょう：

1. ✅ ページを開いたときにナビゲーションがフェードインする
2. ✅ ヒーローセクションのタイトルが順番に表示される
3. ✅ カードにホバーすると画像が拡大する
4. ✅ スクロールすると要素が順番に表示される
5. ✅ About ページのスキルバーがアニメーションする
6. ✅ タイムラインの要素がスクロールで表示される
7. ✅ ボタンをクリックするとリップルエフェクトが発生する

## 🎓 次のステップ

このハンズオンを完了したら、以下に挑戦してみましょう：

1. **オリジナルアニメーションの作成**: 自分だけのアニメーションを追加
2. **パフォーマンス測定**: Chrome DevTools で FPS を確認
3. **他のプロジェクトへの応用**: 学んだ技術を自分のサイトに適用

## 💡 Tips

- 小さなアニメーションから始めて、徐々に複雑にしていく
- 完成版と比較しながら進める
- ブラウザをリロードして動作を確認する習慣をつける
- 分からないときは MDN のドキュメントを参照

頑張ってください！🚀
