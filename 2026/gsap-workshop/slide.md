---
marp: true
theme: academic
paginate: true
---

<!-- _class: lead -->

# GSAPから始めるWebアニメーション入門

---

## 本日のゴール

GSAP を使って Web アニメーションが作れるようになる！

最終的に、こんなページが作れるようになります👇


---

## もくじ

1. **オープニング** - GSAP とは？ (15分)
2. **GSAP 入門** - 基本的なアニメーション (35分)
3. **☕ 休憩** (10分)
4. **Timeline** - 複数アニメーションの制御 (25分)
5. **ScrollTrigger** - スクロール連動 (40分)
6. **☕ 休憩** (10分)
7. **観光PRサイト作成** - コードウォークスルー & カスタマイズ (55分)
8. **まとめ & 事例紹介** (15分)

---

<!-- _class: lead -->

# 1. オープニング

## GSAP とは？

**GreenSock Animation Platform**

- 世界で最も使われている JavaScript アニメーションライブラリ
- 高いパフォーマンス
- 直感的な API
- 豊富なプラグイン

### 使用サイト例
Nike, Google, Microsoft, Apple...

### 🎉 2025年〜 すべてのプラグインが無料に！

Webflow による買収で、ScrollTrigger・SplitText・MorphSVG など
**すべてのプラグインが無料**で使えるようになりました。

---

## なぜ GSAP を学ぶ？

| CSS アニメーション | GSAP |
|---|---|
| シンプルな動きに最適 | 複雑なアニメーションも簡単 |
| スクロール連動は難しい | ScrollTrigger で簡単 |
| 複数の動きの同期が困難 | Timeline で自在に制御 |

**業界標準として広く使われている！**

---

<!-- _class: lead -->

# 2. GSAP 入門

## 基本的なアニメーションを作ろう

---

## GSAP を使う準備

```html
<!-- CDN から読み込み -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
```

これだけで GSAP が使えるようになります！

---

## 最初のアニメーション

```javascript
gsap.to('.box', {
  x: 200,        // 右に200px移動
  duration: 1    // 1秒かけて
});
```

### 構文

- `gsap.to()` = 現在の状態から指定した状態へ
- 第1引数 = アニメーション対象（セレクタ or 要素）
- 第2引数 = アニメーションの設定

> 📁 `examples/01-gsap-intro/01-gsap-to.html` | [CodePen](https://codepen.io/mocaffy/pen/NPrwERj)

---

## よく使うプロパティ

```javascript
gsap.to('.box', {
  // 位置
  x: 100,           // 水平移動
  y: 50,            // 垂直移動

  // サイズ・回転
  scale: 1.5,       // 拡大縮小
  rotation: 360,    // 回転（度）

  // 見た目
  opacity: 0.5,     // 透明度
  autoAlpha: 0,     // opacity + visibility を同時制御
  backgroundColor: '#e74c3c',

  // 時間
  duration: 2,      // 秒数
  delay: 0.5        // 遅延
});
```

> 📁 `examples/01-gsap-intro/03-combo.html` | [CodePen](https://codepen.io/mocaffy/pen/YPWJRmQ)

---

## gsap.to vs gsap.from

```javascript
// to: 現在 → 指定した状態
gsap.to('.box', { x: 200 });

// from: 指定した状態 → 現在
gsap.from('.box', { x: -200 });

// fromTo: 開始状態 → 終了状態
gsap.fromTo('.box',
  { x: -200 },  // from
  { x: 200 }    // to
);
```

> 📁 `examples/01-gsap-intro/02-gsap-from.html` | [CodePen](https://codepen.io/mocaffy/pen/OPXOrbv)

---

## イージング（Easing）

```javascript
gsap.to('.box', {
  x: 200,
  ease: 'power2.out'  // イージング
});
```

| イージング | 動き |
|-----------|------|
| `none` / `linear` | 一定速度 |
| `power1` ~ `power4` | 加速/減速の強さ |
| `bounce.out` | バウンド |
| `elastic.out` | 弾性 |
| `back.out` | 少し戻る |

💡 [Ease Visualizer](https://greensock.com/docs/v3/Eases) で確認しよう！

> 📁 `examples/01-gsap-intro/04-easing.html` | [CodePen](https://codepen.io/mocaffy/pen/VYjEqZb)

---

## 複数の要素をアニメーション

```javascript
// stagger で順番にアニメーション
gsap.to('.box', {
  y: -30,
  stagger: 0.2,  // 0.2秒ずつずらす
  duration: 0.5
});
```

- `stagger` を使うと要素が順番にアニメーション
- 数値が大きいほど間隔が長くなる

> 📁 `examples/01-gsap-intro/05-stagger.html` | [CodePen](https://codepen.io/mocaffy/pen/raLqoNN)

---

## gsap.set() - 即座にプロパティを設定

```javascript
// アニメーションなしで即座にプロパティを設定
gsap.set('.box', {
  x: 0,
  opacity: 1,
  scale: 1
});
```

- `gsap.to()` の `duration: 0` と同じ
- 初期状態のリセットや初期配置に便利
- サンプルコードの `reset()` 関数で多用しています

```javascript
// 使用例: ボタンクリックでリセット
function reset() {
  gsap.set('#box', { x: 0, scale: 1, rotation: 0 });
}
```

---

## ハンズオン: GSAP を使ってみよう

### `examples/01-gsap-intro/` のファイルを開こう

1. `01-gsap-to.html` で様々なプロパティを試そう
2. `04-easing.html` でイージングを変えてみよう
3. `05-stagger.html` で複数の要素をアニメーションさせてみよう

---

<!-- _class: lead -->

# ☕ 休憩（10分）

---

<!-- _class: lead -->

# 3. Timeline

## 複数のアニメーションを組み合わせよう

---

## Timeline とは？

**複数のアニメーションの流れを管理**

- 順番に実行
- 同時に実行
- タイミングをずらして実行

これが簡単にできる！

---

## Timeline の基本

```javascript
// Timeline を作成
const tl = gsap.timeline();

// アニメーションを追加
tl.to('.box1', { x: 200, duration: 1 })
  .to('.box2', { x: 200, duration: 1 })
  .to('.box3', { x: 200, duration: 1 });

// → 順番に実行される
```

> 📁 `examples/02-timeline/01-timeline-basic.html` | [CodePen](https://codepen.io/mocaffy/pen/MYePZWM)

---

## タイミングの制御

```javascript
const tl = gsap.timeline();

tl.to('.box1', { x: 200 })
  .to('.box2', { x: 200 }, '<')      // 直前と同時
  .to('.box3', { x: 200 }, '<0.2')   // 直前の0.2秒後
  .to('.box4', { x: 200 }, '+=0.5'); // 直前の終了から0.5秒後
```

| 指定 | 意味 |
|------|------|
| `'<'` | 直前と同時に開始 |
| `'<0.5'` | 直前の開始から0.5秒後 |
| `'+=0.5'` | 直前の終了から0.5秒後 |
| `'-=0.5'` | 直前の終了より0.5秒前 |

> 📁 `examples/02-timeline/02-position-parameter.html` | [CodePen](https://codepen.io/mocaffy/pen/GgqYPgQ)

---

## ループアニメーション

```javascript
const tl = gsap.timeline({
  repeat: -1,        // -1 = 無限ループ
  yoyo: true,        // 往復
  repeatDelay: 0.5   // ループ間の待機時間
});

tl.to('.dot', {
  y: -20,
  stagger: 0.1
});
```

ローディングアニメーションに最適！

> 📁 `examples/02-timeline/03-loading.html` | [CodePen](https://codepen.io/mocaffy/pen/RNReEWj)

---

## Timeline のデフォルト設定

```javascript
const tl = gsap.timeline({
  defaults: {
    duration: 0.5,
    ease: 'power2.out'
  }
});

// 各アニメーションで duration を省略できる
tl.to('.box1', { x: 200 })
  .to('.box2', { x: 200 })
  .to('.box3', { x: 200 });
```

---

## コールバック - アニメーションのイベント

```javascript
gsap.to('.box', {
  x: 200,
  duration: 1,
  onStart: () => {
    console.log('アニメーション開始！');
  },
  onComplete: () => {
    console.log('アニメーション完了！');
  },
  onUpdate: () => {
    console.log('更新中...');
  }
});
```

| コールバック | タイミング |
|---|---|
| `onStart` | アニメーション開始時（1回） |
| `onComplete` | アニメーション完了時（1回） |
| `onUpdate` | 毎フレーム更新時 |

💡 Timeline にも使えます（例: ローディング完了後にメイン表示）

---

## ハンズオン: Timeline を使ってみよう

### `examples/02-timeline/` のファイルを開こう

1. `01-timeline-basic.html` で複数のボックスを順番に動かそう
2. `02-position-parameter.html` でタイミングを調整してみよう
3. `03-loading.html` でループアニメーションを作ってみよう

---

<!-- _class: lead -->

# 4. ScrollTrigger

## スクロールでアニメーションを制御しよう

---

## ScrollTrigger とは？

**スクロールでアニメーションを制御**

- 要素が画面に入ったらアニメーション開始
- スクロール量に連動してアニメーション
- パララックス効果
- スクロールピン（固定）

---

## ScrollTrigger を使う準備

```html
<!-- GSAP本体 -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>

<!-- ScrollTrigger プラグイン -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>

<script>
  // プラグインを登録（重要！）
  gsap.registerPlugin(ScrollTrigger);
</script>
```

---

## 基本的な使い方

```javascript
gsap.from('.box', {
  opacity: 0,
  y: 50,
  scrollTrigger: {
    trigger: '.box',      // トリガー要素
    start: 'top 80%',     // 開始位置
    markers: true         // デバッグ用
  }
});
```

要素が画面の80%位置に来たらアニメーション開始！

> 📁 `examples/03-scrolltrigger/01-fade-in.html` | [CodePen](https://codepen.io/mocaffy/pen/PwzyXGB)

---

## start と end の指定

```
start: 'トリガー要素の位置  画面上の位置'

例:
start: 'top center'    → 要素の上端が画面中央に来たら
start: 'top 80%'       → 要素の上端が画面の80%位置に来たら
start: 'center center' → 要素の中央が画面中央に来たら
```

使える値: `top`, `center`, `bottom`, 数値(px), 割合(%)

> 📁 `examples/03-scrolltrigger/02-slide-in.html` | [CodePen](https://codepen.io/mocaffy/pen/myEzaOx)

---

## スクロール連動アニメーション（scrub）

```javascript
gsap.to('.box', {
  x: 500,
  rotation: 360,
  scrollTrigger: {
    trigger: '.section',
    start: 'top center',
    end: 'bottom center',
    scrub: true  // スクロールに連動
  }
});
```

| scrub の値 | 動作 |
|-----------|------|
| `false` | トリガーで1回再生 |
| `true` | スクロールに完全連動 |
| `1` | 1秒かけて追従 |

> 📁 `examples/03-scrolltrigger/03-scrub.html` | [CodePen](https://codepen.io/mocaffy/pen/NPrOebo)

---

## toggleActions - スクロール方向で動作を変える

```javascript
gsap.from('.box', {
  opacity: 0,
  y: 50,
  scrollTrigger: {
    trigger: '.box',
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse'
    //              ↑    ↑    ↑    ↑
    // onEnter  onLeave  onEnterBack  onLeaveBack
  }
});
```

| 値 | 動作 |
|---|---|
| `play` | 再生 |
| `pause` | 一時停止 |
| `resume` | 再開 |
| `reverse` | 逆再生 |
| `none` | 何もしない |

💡 **よく使うパターン**: `"play none none reverse"`（画面外に出たら元に戻る）

---

## markers でデバッグしよう

```javascript
scrollTrigger: {
  trigger: '.box',
  start: 'top 80%',
  markers: true    // 開始・終了位置を画面に表示
}
```

- `markers: true` で緑（start）と赤（end）のラインが表示される
- 位置の調整に便利！
- **本番では必ず `false` にするか削除すること**

---

## pin - 要素を固定する

```javascript
gsap.to('.box', {
  rotation: 360,
  scrollTrigger: {
    trigger: '.section',
    start: 'top top',
    end: '+=200%',    // スクロール量（画面2個分）
    pin: true,        // セクションを固定！
    scrub: true
  }
});
```

- `pin: true` でトリガー要素を画面に固定
- スクロールしても要素は動かず、アニメーションだけ進む
- 横スクロールや複雑な演出の基盤になる重要な機能

> 📁 `examples/03-scrolltrigger/06-pin.html` | [CodePen](https://codepen.io/mocaffy/pen/RNReEpM)

---

## 横スクロール（pin + scrub の応用）

```javascript
const scroller = document.querySelector('.scroller');
const scrollAmount = scroller.scrollWidth - window.innerWidth;

gsap.to('.scroller', {
  x: () => -scrollAmount,   // 関数形式で値を返す
  ease: 'none',
  scrollTrigger: {
    trigger: '.container',
    start: 'top top',
    end: () => '+=' + scrollAmount,
    pin: true,               // 固定して
    scrub: 1,                // スクロールに追従
    invalidateOnRefresh: true // リサイズ時に再計算
  }
});
```

> 📁 `examples/03-scrolltrigger/07-horizontal-scroll.html` | [CodePen](https://codepen.io/mocaffy/pen/yyJRGbL)

---

## Timeline + ScrollTrigger

```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.section',
    start: 'top 60%'
  }
});

tl.from('.title', { y: 30, opacity: 0 })
  .from('.text',  { y: 20, opacity: 0 }, '-=0.4')
  .from('.box',   { scale: 0, stagger: 0.15 }, '-=0.2');
```

- Timeline のオプションに `scrollTrigger` を追加するだけ！
- スクロールで発火し、中のアニメーションが順番に実行される

> 📁 `examples/03-scrolltrigger/08-timeline-scroll.html` | [CodePen](https://codepen.io/mocaffy/pen/VYjEqbr)

---

## ハンズオン: ScrollTrigger を使ってみよう

### `examples/03-scrolltrigger/` のファイルを開こう

1. `01-fade-in.html` でスクロールでアニメーションを発火させよう
2. `03-scrub.html` で scrub を試してみよう
3. `06-pin.html` で要素の固定を体験しよう
4. `07-horizontal-scroll.html` で横スクロールを作ろう
5. `08-timeline-scroll.html` で Timeline + ScrollTrigger を組み合わせよう

---

<!-- _class: lead -->

# ☕ 休憩（10分）

---

<!-- _class: lead -->

# 5. 観光PRサイト作成

## 自分の出身地をPRしよう！

---

## 作るもの

**自分の出身地（都道府県・市区町村）のPRサイト**

`examples/04-fukui-pr/index.html` をベースに、
あなたの地元をPRするサイトを作ってみよう！

---

## サンプルサイトの構成

福井県PRサイトで使われている GSAP の技術：

| セクション | 使用技術 |
|-----------|---------|
| ローディング | Timeline + stagger |
| ヒーロー | Timeline（順番に登場） |
| イントロ | ScrollTrigger + カウントアップ |
| 観光スポット | パララックス効果（scrub） |
| グルメ | 横スクロール（pin + scrub） |
| アクセス | Timeline + ScrollTrigger |

---

## コードウォークスルー

カスタマイズの前に、サンプルコードを一緒に読み解きましょう。

`examples/04-fukui-pr/index.html` の JS は **9つの関数** に分かれています。

```
initLoader()          → ローディング画面
initHeroAnimation()   → ヒーローセクション
initProgressBar()     → プログレスバー
initIntroAnimation()  → イントロ + カウントアップ
initZoomAnimation()   → 円形ズーム演出
initSpotsAnimation()  → 観光スポット + パララックス
initGourmetAnimation() → グルメ横スクロール
initAccessAnimation() → アクセス情報
initSmoothScroll()    → スムーススクロール
```

---

## 学んだ技術との対応

| 関数 | 学んだ技術 ✅ | 新しい要素 ⭐ |
|------|-------------|-------------|
| initLoader | Timeline + stagger | onComplete コールバック |
| initHeroAnimation | Timeline + `-=` | − |
| initProgressBar | scrub | − |
| initIntroAnimation | ScrollTrigger | ⭐ カウントアップ（onUpdate） |
| initSpotsAnimation | パララックス（scrub） | ⭐ fromTo |
| initGourmetAnimation | **pin + scrub** | ⭐ 横スクロール + 関数値 |
| initAccessAnimation | **Timeline + ScrollTrigger** | − |
| initZoomAnimation | **pin + scrub** | ⭐ CSS変数アニメーション |
| initSmoothScroll | − | ⭐ ScrollToPlugin |

**9つ中6つは学んだ技術の応用です！** ⭐ の部分はそのまま使ってOK。

---

## カスタマイズの手順

### Step 1: テーマを決める

- どの地域をPRする？（都道府県 or 市区町村）
- どんな魅力を伝えたい？

### Step 2: 必要な情報を集める

- 観光スポット（3つ程度）
- 名物・グルメ
- アクセス情報
- 画像（Unsplash などで探す）

---

## カスタマイズのポイント

### 配色の変更（CSS カスタムプロパティ）

```css
:root {
  --color-primary: #1a5f4a;    /* メインカラー */
  --color-secondary: #d4a373;  /* サブカラー */
  --color-accent: #e63946;     /* アクセントカラー */
  --color-ocean: #2a6f97;      /* 特徴的な色 */
}
```

地域の特色に合わせた配色を考えよう！

---

## カスタマイズのポイント

### テキストの変更

```html
<h1 class="hero-title">
  <span class="hero-title-line">FUKUI</span>  <!-- ← 地域名 -->
</h1>
<p class="hero-description">
  自然と歴史が織りなす...  <!-- ← キャッチコピー -->
</p>
```

### 画像の変更

```html
<img src="https://images.unsplash.com/..." alt="...">
```

Unsplash で地域にちなんだ画像を探そう！

---

## 画像の探し方

### Unsplash

https://unsplash.com/

1. 検索ワードを入力（例: "Kyoto temple", "Tokyo night"）
2. 気に入った画像をクリック
3. 画像URLをコピー

⚠️ 「Unsplash+」マークが付いた画像は有料なので、マークの無い画像を選びましょう

### 画像URLの使い方

```html
<img src="https://images.unsplash.com/photo-xxxx?w=1200&h=800&fit=crop" 
     alt="説明文">
```

`w=1200&h=800` でサイズを指定できる！

---

## チャレンジ課題

### 必須チャレンジ 🎯

1. 地域名とキャッチコピーを変更
2. 配色を変更（最低3色）
3. 観光スポットを3つ変更
4. 画像を差し替え

### 追加チャレンジ ⭐

- グルメセクションの内容を変更
- アクセス情報を更新
- 新しいアニメーションを追加
- オリジナルのセクションを追加

---

## 作業時間

### 🕐 約45分（ウォークスルー除く）

- 最初の10分：テーマ決め＆情報収集
- 次の25分：コードの編集
- 最後の10分：調整＆発表準備

**困ったらスタッフに聞いてね！**

---

## 発表タイム（任意）

作ったサイトをみんなに見せよう！

- どの地域を選んだ？
- こだわりポイントは？
- 使った GSAP の技術は？

---

<!-- _class: lead -->

# 6. まとめ

---

## 今日学んだこと

### ✅ GSAP の基本
- `gsap.to` / `gsap.from` / `gsap.fromTo`
- プロパティ（x, y, scale, rotation, opacity...）
- イージング（ease）
- 複数要素のアニメーション（stagger）

### ✅ Timeline
- 複数アニメーションの制御
- タイミングの調整（`<`, `+=`, `-=`）
- ループアニメーション（repeat, yoyo）

### ✅ ScrollTrigger
- スクロール連動アニメーション
- パララックス効果（scrub）
- ピン留め（pin）と横スクロール
- Timeline + ScrollTrigger の組み合わせ

### ✅ 実践
- 観光PRサイトの作成

---

## パフォーマンスのコツ

### ✅ 推奨: transform プロパティを使う

```javascript
// GPU アクセラレーションが効く（高速）
gsap.to('.box', { x: 100, y: 50, scale: 1.5, rotation: 45 });

// autoAlpha で opacity + visibility を同時制御
gsap.to('.box', { autoAlpha: 0 });
```

### ❌ 避ける: レイアウトを変更するプロパティ

```javascript
// リフロー（再計算）が発生する（低速）
gsap.to('.box', { width: '200px', top: '100px' });
```

**`x`, `y`, `scale`, `rotation` は GPU で高速処理されます！**

---

## アクセシビリティへの配慮

ユーザーが「視覚効果を減らす」設定にしている場合への対応：

```javascript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // アニメーションを無効化
  gsap.globalTimeline.timeScale(100);
}
```

**めまいや不快感を感じるユーザーへの配慮が大切です。**

---

## gsap.utils - 便利なユーティリティ

```javascript
// ランダムな値を生成
gsap.utils.random(0, 500);           // 0〜500のランダム値
gsap.utils.random(['red', 'blue']);   // 配列からランダムに選択

// NodeList を配列に変換
const boxes = gsap.utils.toArray('.box');

// 値の範囲を制限
gsap.utils.clamp(0, 100, 150);       // → 100（0〜100に制限）
```

詳しくは [公式ドキュメント](https://greensock.com/docs/v3/GSAP/UtilityMethods) で！

---

## GSAP クイックリファレンス

```javascript
// 基本
gsap.to('.box', { x: 200, duration: 1 });
gsap.from('.box', { opacity: 0 });

// Timeline
const tl = gsap.timeline();
tl.to('.box1', { x: 200 })
  .to('.box2', { x: 200 }, '<');

// ScrollTrigger
gsap.to('.box', {
  y: 100,
  scrollTrigger: { trigger: '.box', start: 'top 80%' }
});
```

---

## さらに学びたい人へ

- [GSAP 公式ドキュメント](https://greensock.com/docs/)
- [GSAP Cheat Sheet](https://greensock.com/cheatsheet/)
- [Ease Visualizer](https://greensock.com/docs/v3/Eases)
- [CodePen で作例を見る](https://codepen.io/GreenSock)

**実際に作って試すのが一番！**

---

<!-- _class: lead -->

# 弊社の事例紹介

---

## 事例1

- **プロジェクト名**: ふわっち
- **URL**: https://whowatch.tv/s/snack/
- **使用技術**: GSAP, 〇〇プラグイン
- **課題・狙い・工夫・**: 

---

## 事例2

- **プロジェクト名**: VTuber登竜門
- **URL**: https://www.vmon.jp/
- **使用技術**: GSAP, 〇〇プラグイン
- **課題・狙い・工夫・**: 

---

<!-- _class: lead -->

# 質疑応答

技術的な質問でも
会社についての質問でも
何でもどうぞ！

