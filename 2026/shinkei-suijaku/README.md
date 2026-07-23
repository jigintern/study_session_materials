# 神経衰弱ゲームを作ろう — JavaScript 中級講座

> この資料は、2026年に行う JavaScript 中級コースに向けて作成されたものです。
> 所要時間目安: 180 分 (3 時間)

## 目的

JavaScript で 4×4 の神経衰弱ゲームを作ります。
ゲームを作る過程で、Webアプリを支える 3 つの考え方 (状態、イベント、時間) を体験することを目的とします。

## 対象

何らかの言語で変数・if・関数・配列を書いたことがあれば OK です。JavaScript は初めてでも構いません。HTML と CSS は配布コードに含まれているので、ロジック (`script.js`) に集中します。

## Chapter 一覧

- Chapter 1: JS で画面を組み立てる (23 分) — カードを盤面に並べる
- Chapter 2: イベントと状態 (27 分) — クリックでカードをめくる
- Chapter 3: 状態遷移と非同期 (28 分) — 一致判定と待ち時間
- 休憩 (10 分)
- Chapter 4: カードをシャッフル (10 分) — 毎回ちがう並びで遊べるようにする
- Chapter 5: 時間で動く画面 (28 分) — タイマー、手数、クリア判定
- Chapter 6: 状態を初期化する (15 分) — リセット機能

章の合計が 131 分、導入とまとめが 22.5 分で、休憩を含めて 163.5 分の見込みです。
応用課題の 4 枚 (8 分) を全部話すと 171.5 分になります。末尾の付録 7 枚は当日飛ばす前提です。
残った時間で応用課題に個別に伴走します。

## 準備

- ブラウザのみ (StackBlitz を使用)
- 開発環境のインストール不要
- テンプレート: https://stackblitz.com/edit/web-platform-qnett8m2?file=script.js

## 困ったときは

- 質問がある場合、章節項に割り振られた通し番号といっしょに質問してもらえると対応しやすいです。
- 資料に誤字脱字や理論的な欠陥にお気づきなら、[リポジトリ](https://github.com/jigintern/study_session_materials) に Issue を作成して Contributor に知らせてください。確認して対応します。

## ファイル

- [`slide.md`](./slide.md) — Marp スライド (本編)
- [`examples/start/`](./examples/start/) — 配布時のコード骨格。`script.js` は `symbols` 配列のみ
- [`examples/complete/`](./examples/complete/) — 完成コード。講師の答え合わせ・参加者の最終参照用
- [`examples/snapshots/`](./examples/snapshots/) — 各章末の `script.js` (`ch1.js`〜`ch5.js`)。遅れた参加者を次章の頭から合流させるために配る
- [`examples/challenges/`](./examples/challenges/) — 応用課題のうち、分量が大きいものの実装例

`examples/complete/script.js` と `examples/snapshots/*.js` は、スライドの手順どおりに書き足した場合の並びになっています。`slide.md` のコードを変更したら、この 6 本も追随させてください。

各 `examples/*` には `debug.js` が同梱されています。オンライン講座で参加者が詰まったときの自己診断用で、参加者は触らなくて OK です。以下の機能を持ちます。

- ライブ状態パネル: `firstCard` や `lockBoard` などの現在値、盤面 DOM (カード枚数, `flipped`, `matched`) を 500 ms 毎に表示
- ランタイムエラー捕捉: `window.error` を拾って直近 3 件をパネルに表示 (Console を開かなくても気付ける)。`ReferenceError` の場合は `script.js` 内で宣言された名前 (ネスト含む) と Levenshtein 距離で照合し、近い名前があれば「もしかして X?」を添える
- 静かに壊れる typo の検知: `document.getElementById` と `EventTarget.prototype.addEventListener` を wrap して、id の typo (null 戻り) やイベント名の typo (`clik` など) を捕捉。id は実 DOM の id 集合、イベント名は既知イベント集合と Levenshtein で照合
- 状況ヒント: 「盤面が空 + `createCard`/`renderBoard` は定義済み → `renderBoard()` を呼び忘れ?」など、決め打ちのヒント
- Chapter テスト: 各 Chapter に対応する 32 個の自動テスト (変数の型、関数の定義有無、`shuffle` や `createCard` の pure な返り値検証、盤面 DOM 実態)。副作用のある関数は呼ばない。Chapter ごとに `N/M ✓` を色分けして表示

## 応用課題

スライド末尾の「応用課題の目次」以下 4 枚に対応する答えの置き場所です。

| 課題 | 答えの場所 |
|---|---|
| 記憶タイム (3 行) | スライド「応用課題: 3 行で記憶ゲームにする」に全文 |
| 800 ms / 絵柄 / ペア数を変える | 答えなし。スライドの本文で足りる |
| ベストスコアの保存 | スライド付録「応用課題の答え — ベストスコア」 |
| ペアの条件を変える (英単語 ↔ 和訳) | [`examples/challenges/pair-rule.js`](./examples/challenges/pair-rule.js) |
| 難易度切り替え (4×4 / 6×6 / 8×8) | [`examples/challenges/difficulty.js`](./examples/challenges/difficulty.js) |
| カウントダウンモード | [`examples/challenges/countdown.js`](./examples/challenges/countdown.js) |
| `state` + `setState` 化 | [`examples/challenges/state.js`](./examples/challenges/state.js) |

`examples/challenges/*.js` は、それぞれ `script.js` を丸ごと置き換えると動きます。`index.html` と `styles.css` は変更不要です。完成コードから変えた箇所には `CHANGED` コメントを付けてあるので、差分を追うときの目印にしてください。

`state.js` はカードのめくり表示だけ DOM のクラスのまま残しています。ここも `state` に寄せるとめくるたびに盤面を作り直すことになり、CSS のめくりアニメーションが再生されなくなるためです。理由はファイル冒頭のコメントに書いてあります。

## 演習の 3 モード

コードを進めるとき、スライド上で 3 つのモードを使い分けます。

- 自力 — 要件とヒントだけを見て、コードを見ずに書く。次のスライドで答え合わせ
- 記述 — `【A】` 等の穴を埋める。構造は見えている中で、埋める箇所を考える
- コピペ — 完成コードをそのままコピーして貼る (ボイラープレート的な処理)

## 本編

資料本編はこちら

- [markdown版](./slide.md)
- [HTML版](https://jigintern.github.io/study_session_materials/shinkei-suijaku-2026/slide.html)

https://jigintern.github.io/study_session_materials/shinkei-suijaku-2026/slide.html
