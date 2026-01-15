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
├── animations.css      # アニメーション（空欄版）← これを編集します！
├── script.js           # JavaScript（完成済み）
├── articles.json       # 記事データ
├── README.md           # このファイル
└── complete/           # 完成版（参考用）
    └── ...
```

## 🚀 始め方

1. ブラウザで `index.html` を開く
2. `animations.css` を開いて、TODO コメントに従ってコードを書く
3. ブラウザをリロードして動作を確認
4. 完成版（`complete/animations.css`）と比較して確認

## 📚 学習ステップ

### Step 1: 基本的な @keyframes アニメーション

まずは最も基本的なアニメーションから始めましょう。

#### 1-1. fadeIn アニメーション

要素をフェードインさせるアニメーションです。

**使用箇所:**
- `index.html`: スクロールインジケーター (`.scroll-indicator`) - **ページを開いたとき（1.5秒遅延）**
- `archive.html`: タグクラウドの各タグ (`.tag`) - **ページを開いたとき（順次表示）**

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

フェードインしながら上に移動するアニメーションです。

**使用箇所:**
- 全ページ: ナビゲーションバー (`.nav`) - **ページを開いたとき**
- 全ページ: モバイルメニュー (`.nav-menu.active`) - **ハンバーガーメニューをクリックしたとき**

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

要素を跳ねさせるアニメーションです。

**使用箇所:**
- `index.html`: スクロールインジケーターの矢印 (`.scroll-arrow`) - **ページを開いたとき（無限ループ）**

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

### Step 2: animation プロパティの適用

作成した `@keyframes` を要素に適用します。

#### 2-1. ナビゲーションのアニメーション

**使用箇所:**
- 全ページ: ナビゲーションバー (`.nav`) - **ページを開いたとき**

```css
.nav {
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**animation プロパティの構成:**
- `animation-name`: 使用する @keyframes の名前
- `animation-duration`: アニメーションの長さ（0.5s = 0.5秒）
- `animation-timing-function`: イージング関数

#### 2-2. タイピングアニメーション

**使用箇所:**
- `index.html`: ヒーローセクションのタイトル3行 (`.typing-text .title-line`) - **ページを開いたとき（0.2秒、0.5秒、0.8秒の遅延で順次表示）**

```css
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

**ポイント:**
- `animation-delay` で順番に表示
- `forwards` で最終状態を維持
- `:nth-child()` で個別に設定

#### 2-3. スクロールインジケーター

**使用箇所:**
- `index.html`: スクロールインジケーター全体 (`.scroll-indicator`) - **ページを開いたとき（1.5秒遅延）**
- `index.html`: スクロールインジケーターの矢印 (`.scroll-arrow`) - **ページを開いたとき（無限ループ）**

```css
.scroll-indicator {
  animation: fadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 1.5s forwards;
  opacity: 0;
}

.scroll-arrow {
  animation: bounce 2s ease-in-out infinite;
}
```

**ポイント:**
- `infinite` で無限ループ
- `1.5s` の遅延で最初は非表示

### Step 3: transition の基本

状態変化をスムーズにする `transition` を学びます。

#### 3-1. 基本的なリンクのホバー

**使用箇所:**
- 全ページ: 通常のリンク (`a`) - **リンクにマウスホバーしたとき**
- 全ページ: フッターリンク (`.footer-links a`) - **リンクにマウスホバーしたとき**
- `article.html`: 目次リンク (`.toc-link`) - **リンクにマウスホバーしたとき**

```css
a {
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

a:hover,
a:focus {
  color: var(--color-accent-hover);
}

.footer-links a:hover {
  color: var(--color-accent);
}

.toc-link {
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.toc-link:hover,
.toc-link.active {
  color: var(--color-accent);
}
```

**ポイント:**
- シンプルな色の変化でフィードバックを提供
- 短い duration で即座に反応

#### 3-2. カードのホバーアニメーション

**使用箇所:**
- `index.html`: 記事カード (`.article-card`) と特集記事カード (`.featured-card`) - **カードにマウスホバーしたとき**
- `article.html`: 関連記事カード (`.article-card`) - **カードにマウスホバーしたとき**
- カード内の画像 (`.card-image .image-placeholder`, `.featured-image .image-placeholder`) - **カードにマウスホバーしたとき（画像が拡大）**
- カードタイトルリンク (`.featured-title a`, `.timeline-article-title a`) - **リンクにマウスホバーしたとき**

```css
.article-card,
.featured-card {
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.featured-card:hover {
  background: var(--color-surface);
}

.article-card:hover {
  background: var(--color-surface);
}

.card-image .image-placeholder,
.featured-image .image-placeholder {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.featured-card:hover .image-placeholder,
.article-card:hover .card-image .image-placeholder {
  transform: scale(1.05);
}

.card-link-wrapper {
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-link-wrapper:hover,
.card-link-wrapper:focus {
  color: var(--color-text);
}

.featured-title a,
.timeline-article-title a {
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.featured-title a:hover,
.timeline-article-title a:hover {
  color: var(--color-accent);
}
```

**ポイント:**
- 複数のプロパティに個別の設定が可能
- カンマで区切って指定
- `:hover` で画像の拡大と背景色の変化を実装

#### 3-3. ボタンのホバーアニメーション

**使用箇所:**
- 全ページ: プライマリボタン (`.btn-primary`) - **ボタンにマウスホバーしたとき**
- 全ページ: セカンダリボタン (`.btn-secondary`) - **ボタンにマウスホバーしたとき**
- `index.html`, `archive.html`: フィルターボタン (`.filter-btn`, `.tab-btn`) - **ボタンにマウスホバーしたとき**

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

.filter-btn,
.tab-btn {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-btn:hover,
.tab-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
```

**ポイント:**
- ボタンの種類に応じて異なるホバースタイル
- box-shadowで立体感を追加

#### 3-4. ソーシャルリンクとナビゲーションのトランジション

**使用箇所:**
- `about.html`: お問い合わせセクションのソーシャルリンク (`.social-link-large`) - **リンクにマウスホバーしたとき**
- 全ページ: フッターのソーシャルリンク (`.social-link`) - **リンクにマウスホバーしたとき**
- 全ページ: ナビゲーションロゴ (`.nav-logo`) - **ロゴにマウスホバーしたとき**
- 全ページ: ナビゲーションメニューリンク (`.nav-menu a`) - **リンクにマウスホバーしたとき**
- 全ページ: テーマ切替ボタン (`.theme-toggle`) - **ボタンにマウスホバーしたとき**
- `about.html`: プロフィール画像 (`.avatar-large`) - **画像にマウスホバーしたとき**
- `archive.html`: タグクラウドのタグ (`.tag`) - **タグにマウスホバーしたとき**

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

.nav-logo {
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-logo:hover {
  color: var(--color-accent);
}

.nav-menu a {
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-menu a:hover,
.nav-menu a:focus,
.nav-menu a.active {
  color: var(--color-accent);
}

.theme-toggle {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  transform: rotate(180deg);
}

.avatar-large:hover {
  transform: scale(1.05) rotate(5deg);
}

.tag:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
  transform: translateY(-2px);
}
```

**ポイント:**
- `:hover` で状態変化を定義
- `scale()` で拡大・縮小
- `rotate()` で回転
- `translateY()` で上下移動
- 複数のプロパティを同時にアニメーション

#### 3-5. リンクのアンダーラインアニメーション

**使用箇所:**
- 全ページ: 通常のテキストリンク（ボタンやカードリンク、ソーシャルリンク、ナビロゴを除く） - **リンクにマウスホバーしたとき**

```css
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

**ポイント:**
- `::after` 疑似要素でアンダーラインを作成
- `width` の変化でアニメーション

### Step 4: スクロール連動アニメーション

JavaScript と連携してスクロールに応じたアニメーションを実装します。

#### 4-1. フェードインアニメーション

**使用箇所:**
- `index.html`: 特集記事カード (`.featured-card`) - **スクロールして要素が画面に入ったとき**
- `about.html`: プロフィールセクション全体 (`.profile-content`)、各スキル項目 (`.skill-item`) - **スクロールして要素が画面に入ったとき**
- `archive.html`: アーカイブヒーロー (`.archive-hero`) - **スクロールして要素が画面に入ったとき**
- `article.html`: 記事ヒーローコンテンツ (`.article-hero-content`)、各コンテンツセクション (`.content-section`)、関連記事カード (`.article-card`) - **スクロールして要素が画面に入ったとき**

```css
.fade-in-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-in-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

**仕組み:**
1. 初期状態は `opacity: 0` で非表示
2. JavaScript が `.is-visible` クラスを付与
3. CSS の `transition` でスムーズに表示

#### 4-2. 左右からスライドイン

**使用箇所:**
- 現在は未使用（カスタマイズ用に用意されたクラス） - **スクロールして要素が画面に入ったとき（クラスを追加すれば動作）**

```css
.slide-in-left-on-scroll {
  opacity: 0;
  transform: translateX(-50px);
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-left-on-scroll.is-visible {
  opacity: 1;
  transform: translateX(0);
}

.slide-in-right-on-scroll {
  opacity: 0;
  transform: translateX(50px);
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-right-on-scroll.is-visible {
  opacity: 1;
  transform: translateX(0);
}
```

#### 4-3. スケールアニメーション

**使用箇所:**
- 現在は未使用（カスタマイズ用に用意されたクラス） - **スクロールして要素が画面に入ったとき（クラスを追加すれば動作）**

```css
.scale-in-on-scroll {
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.scale-in-on-scroll.is-visible {
  opacity: 1;
  transform: scale(1);
}
```

### Step 5: 高度なアニメーション

より複雑なアニメーションに挑戦します。

#### 5-1. スキルバーアニメーション

**使用箇所:**
- `about.html`: スキルセクションの各スキルバー (`.skill-progress`) - **スクロールしてスキルセクションが画面に入ったとき（順次表示）**

```css
.skill-progress {
  animation: skill-fill 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes skill-fill {
  from {
    width: 0;
  }
  to {
    width: var(--progress, 0%);
  }
}

.skill-item:nth-child(1) .skill-progress {
  --progress: 95%;
  animation-delay: 0.1s;
}

.skill-item:nth-child(2) .skill-progress {
  --progress: 90%;
  animation-delay: 0.2s;
}
```

**ポイント:**
- CSS 変数 `var(--progress)` で動的な値を使用
- 各要素に異なる `animation-delay` で順次表示

#### 5-2. リップルエフェクト

**使用箇所:**
- 全ページ: すべてのボタン (`.btn`) - **ボタンをクリックしたとき**
  - `index.html`: 「記事を読む」「続きを読む」ボタン
  - `article.html`: 関連記事の「続きを読む」ボタン

```css
.btn {
  position: relative;
  overflow: hidden;
}

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

**ポイント:**
- `::before` 疑似要素で波紋を作成
- `:active` でクリック時のアニメーション

#### 5-3. シマーエフェクト

**使用箇所:**
- `index.html`: カテゴリフィルターボタン (`.filter-btn`) - **ボタンにマウスホバーしたとき**
- `archive.html`: カテゴリタブボタン (`.tab-btn`) - **ボタンにマウスホバーしたとき**

```css
.filter-btn,
.tab-btn {
  position: relative;
  overflow: hidden;
}

.filter-btn::before,
.tab-btn::before {
  content: '';
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: inset-inline-start 0.5s;
}

.filter-btn:hover::before,
.tab-btn:hover::before {
  inset-inline-start: 100%;
}
```

**ポイント:**
- `linear-gradient` で光沢効果
- 位置の変化でスライドアニメーション

#### 5-4. タイムラインアニメーション

**使用箇所:**
- `about.html`: 経歴タイムラインの各項目 (`.timeline-item`) とマーカー (`.timeline-marker`) - **スクロールして要素が画面に入ったとき**
- `archive.html`: タイムライン記事 (`.timeline-article`) とマーカー (`.timeline-article-marker`) - **スクロールして要素が画面に入ったとき**

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

.timeline-marker {
  animation: scale-pulse 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes scale-pulse {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
```

**ポイント:**
- バウンス効果のある `cubic-bezier`
- オーバーシュートで弾むような動き

### Step 6: Scroll-driven Animations（モダンCSS）

最新の CSS 仕様を使った高度なアニメーションです。

#### 6-1. スクロールプログレスバー

**使用箇所:**
- `index.html`, `about.html`, `archive.html`: ページ上部のスクロール進捗バー (`.scroll-progress`) - **ページをスクロールしたとき（スクロール量に応じて伸びる）**
- `article.html`: 記事読了進捗バー (`.reading-progress`) - **ページをスクロールしたとき（スクロール量に応じて伸びる）**

```css
@supports (animation-timeline: scroll()) {
  .scroll-progress,
  .reading-progress {
    animation: scroll-progress linear;
    animation-timeline: scroll(root);
  }

  @keyframes scroll-progress {
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  }
}
```

**ポイント:**
- `animation-timeline: scroll(root)` でスクロールに連動
- `@supports` で対応ブラウザのみ適用

#### 6-2. パララックス効果

**使用箇所:**
- `article.html`: 記事ヒーローセクションの背景画像 (`.parallax-image`) - **ページをスクロールしたとき（背景が遅れて動く）**

```css
.parallax-image {
  animation: parallax-hero linear;
  animation-timeline: scroll(root);
  animation-range: 0 500px;
}

@keyframes parallax-hero {
  to {
    transform: translateY(30%);
    opacity: 0.5;
  }
}
```

**ポイント:**
- `animation-range` でアニメーションの範囲を指定
- スクロール量に応じて自動的にアニメーション

#### 6-3. ビューポート連動アニメーション

**使用箇所:**
- 現在は未使用（カスタマイズ用に用意されたクラス） - **スクロールして要素が画面に入ったとき（クラスを追加すれば動作）**
- `.fade-on-scroll` クラスを任意の要素に追加することで使用可能

```css
.fade-on-scroll {
  animation: fade-in-scroll linear;
  animation-timeline: view();
  animation-range: entry 0% cover 30%;
}

@keyframes fade-in-scroll {
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
- `animation-timeline: view()` で要素の表示状態に連動
- `animation-range` で表示範囲を細かく制御

### Step 7: アクセシビリティ対応

アニメーションが苦手なユーザーへの配慮も重要です。

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .scroll-arrow,
  .typing-text .title-line,
  .skill-progress,
  .timeline-item,
  .timeline-article,
  .tag,
  .fade-in-on-scroll,
  .slide-in-left-on-scroll,
  .slide-in-right-on-scroll,
  .scale-in-on-scroll {
    animation: none;
  }
}
```

**ポイント:**
- `prefers-reduced-motion` でユーザーの設定を尊重
- アニメーションを無効化または最小化

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

すべての TODO を埋めたら、以下を確認しましょう：

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
