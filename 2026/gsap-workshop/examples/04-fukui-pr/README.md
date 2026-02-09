# 04 - 福井県PRサイト（実践サンプル）

このサンプルは、これまでのGSAPワークショップで学んだ内容を総合的に活用した実践例です。

- **`index.html`** — フル版（全テクニックを使った完成形）
- **`index-simple.html`** — 簡易版（横スクロール・ズーム・カウンターを省略したシンプル版）

まずは `index-simple.html` から読み進め、慣れたら `index.html` にチャレンジしてみましょう。

## このサンプルで学べること

| 機能 | 学んだレッスン | 使用箇所 |
|------|----------------|----------|
| `gsap.timeline()` | 02-timeline | ローディング、ヒーロー、アクセスセクション |
| `gsap.from()` / `gsap.to()` | 01-gsap-intro | 全セクション |
| `stagger` | 01-gsap-intro | カードの順番表示、テキストアニメーション |
| `ease` (イージング) | 01-gsap-intro | 全アニメーション |
| `ScrollTrigger` | 03-scrolltrigger | スクロール連動アニメーション |
| `scrub` | 03-scrolltrigger | プログレスバー、パララックス効果 |

## サイト構成

```
┌─────────────────────────────────┐
│ ローディング画面                 │ ← Timeline + stagger
├─────────────────────────────────┤
│ ナビゲーション（固定）           │
├─────────────────────────────────┤
│ ヒーローセクション               │ ← Timeline で順番に登場
│ (フルスクリーン背景)             │
├─────────────────────────────────┤
│ ズームオーバーレイ               │ ← pin + CSS mask (clip-path)
├─────────────────────────────────┤
│ イントロセクション               │ ← ScrollTrigger + カウントアップ
│ (福井県について)                 │
├─────────────────────────────────┤
│ 観光スポットセクション           │ ← パララックス効果 (scrub)
│ - 恐竜博物館                     │
├─────────────────────────────────┤
│ グルメセクション（横スクロール）  │ ← ScrollTrigger + pin + scrub
│ - 越前がに、越前おろしそば       │
├─────────────────────────────────┤
│ アクセスセクション               │ ← Timeline + ScrollTrigger
├─────────────────────────────────┤
│ フッター                         │
└─────────────────────────────────┘
```

## コードの見どころ

### 1. ローディングアニメーション（Timeline + stagger）

```javascript
const loaderTl = gsap.timeline({
  onComplete: initPageAnimations  // 完了後にコールバック
});

loaderTl
  .from('.loader-text span', {
    y: 100,
    opacity: 0,
    stagger: 0.1,        // 0.1秒ずつずらす
    ease: 'back.out(1.7)'
  })
  .to('.loader', {
    yPercent: -100,
    duration: 1,
    ease: 'power4.inOut'
  });
```

### 2. パララックス効果（ScrollTrigger + scrub）

```javascript
gsap.fromTo(imageWrap, {
  y: '-30vh'
}, {
  y: '30vh',
  ease: 'none',
  scrollTrigger: {
    trigger: slide,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true  // スクロール量に完全追従
  }
});
```

### 3. カウントアップアニメーション（カスタムTween）

```javascript
const obj = { value: 0 };

gsap.to(obj, {
  value: targetNumber,
  duration: 2,
  onUpdate: () => {
    element.textContent = Math.round(obj.value);
  }
});
```

### 4. Timeline のタイミング制御

```javascript
heroTl
  .to('.hero-title-line', { y: 0, duration: 1.2 })
  .to('.hero-subtitle', { opacity: 1 }, '-=0.6')  // 前の終了0.6秒前に開始
  .to('.hero-description', { opacity: 1 }, '-=0.5');
```

### 5. ズームアニメーション（pin + CSS カスタムプロパティ）

```javascript
gsap.fromTo('.zoom-overlay', {
  '--zoom-size': '0%'
}, {
  '--zoom-size': '200%',
  ease: 'none',
  scrollTrigger: {
    trigger: '.zoom-section',
    start: 'top top',
    end: '+=150%',
    pin: true,
    scrub: 1
  }
});
```

```css
.zoom-overlay {
  clip-path: circle(var(--zoom-size) at center);
}
```

### 6. 横スクロール（ScrollTrigger + pin + scrub）

```javascript
gsap.to(container, {
  x: () => -containerWidth,
  ease: 'none',
  scrollTrigger: {
    trigger: '.gourmet-wrapper',
    start: 'top top',
    end: () => '+=' + containerWidth,
    scrub: 0.5,
    pin: '.gourmet-container',  // ピン留め
  }
});
```

## カスタマイズのアイデア

1. **他の都道府県に変更**: 画像とテキストを入れ替えるだけでOK
2. **セクションの追加**: 観光スポットやグルメカードを増やす
3. **アニメーションの追加**: マウス追従、3D効果など

## 使用しているGSAPプラグイン

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollToPlugin.min.js"></script>
```

## 画像について

画像は [Unsplash](https://unsplash.com/) から取得しています。
実際の福井県の写真ではなく、イメージに近い無料素材を使用しています。
