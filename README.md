# study_session_materials

[jig.jp](https://www.jig.jp) で実施している勉強会の資料を管理するリポジトリです。

## 資料一覧

作成年度が新しい順に記述しています。

### 2026年作成

* [みんなで書き込める掲示板を作ってみよう！](./2026/board/README.md)
  * JavaScript の基本を学びながら、サーバーに投稿が保存されて他の人からも見える掲示板アプリを作ります
  * [スライド](https://jigintern.github.io/study_session_materials/board-2026/slide.html)
* [神経衰弱ゲームを作ろう — JavaScript 中級講座](./2026/shinkei-suijaku/README.md)
  * JavaScript で神経衰弱ゲームを作りながら、Webアプリを支える 3 つの考え方 (状態・イベント・時間) を体験するハンズオンです
  * [スライド](https://jigintern.github.io/study_session_materials/shinkei-suijaku-2026/slide.html)
* [1から学ぶ JavaScript！ クイズアプリを作ってみよう](./2026/quiz/README.md)
  * JavaScript の基本を学びながら、自分だけの3択クイズアプリを作ります。
  * [スライド](https://jigintern.github.io/study_session_materials/quiz-2026/slide.html)
* [自己紹介ページを作ろう — Web開発入門](./2026/web-intro/README.md)
  * HTML、CSS、JavaScriptの3つの言語を使って、自己紹介ページを作ります。
  * [スライド](https://jigintern.github.io/study_session_materials/web-intro-2026/slide.html)
* [オープンデータで課題を解決する Web アプリ開発](./2026/open-data/README.md)
  * オープンデータを使って「福井恐竜博物館 おでかけプランナー」を作りながら、fetch・Chart.js・DOM 操作・filter を学ぶハンズオンです
  * [スライド](https://jigintern.github.io/study_session_materials/open-data-2026/slide.html)
* [GSAP ワークショップ 〜Web アニメーションの世界へようこそ〜](./2026/gsap-workshop/README.md)
  * GSAP を使ってアニメーション付きの Web ページを作る方法を学ぶワークショップです
  * [スライド](https://jigintern.github.io/study_session_materials/gsap-workshop-2026/slide.html)

### 2025年作成

* [サイコロで学ぶスクラム開発](./2025/scrum-trial/README.md)
  * サイコロを使ってスクラム開発の基本的な流れを体験するハンズオンです
  * [スライド](https://jigintern.github.io/study_session_materials/scrum-trial-2025/slide.html)
* [正規表現を用いたパスワード強度チェッカーを作ってみよう！](./2025/regex-handson/README.md)
  * 正規表現を使ってパスワードの強度をチェックする機能をゼロから実装するハンズオンです
  * [スライド](https://jigintern.github.io/study_session_materials/regex-handson-2025/slide.html)
* [ウェブコンポーネントを利用したSPAの開発手法](./2025/spa-with-web-component/README.md)
  * ウェブコンポーネントと呼ばれる一連の技術を活用して、効率的にウェブアプリケーションを開発する手法を学びます
* [CSS Animation勉強会](./2025/css-animation/README.md)
  * CSSのkeyframesやtransitionを使ったアニメーション実装をハンズオン形式で学びます

### 2024年作成

* [はじめてのFlutter](./2024/flutter-intro/readme.md)
  * FlutterのWidgetについて学びながら、簡単なカウンターアプリを作成します
  * [スライド](https://jigintern.github.io/study_session_materials/flutter-intro-2024/slide.html)
* [実践！Flutter開発 〜メモ帳編〜](./2024/flutter-memo/readme.md)
  * Flutterを使用したメモ帳開発を通して、SharedPreferences や flutter_hooks について学びます
  * [スライド](https://jigintern.github.io/study_session_materials/flutter-memo-2024/slide.html)
* [JavaScript でつくる超かんたん Web アプリ入門](./2024/javascript-job-hunting-management/README.md)
  * JavaScript の基本文法を学びながら「就活管理アプリ」を作成します
* [はじめの一歩は時間割](./2024/web-timetable/README.md)
  * Web技術の基礎を学びながら、ウェブコンポーネントという技術郡を利用してウェブアプリを作成します

### 2023年作成

* [Fresh](./2023/deno-fresh/README.md)
  * Deno で実行できるSSRフレームワーク
* [Deno で学ぶ TypeScript](./2023/deno-typescript/README.md)
  * 「TypeScriptは**型があって便利・安全**」が学べる内容
* [Flask勉強会](./2023/Flask/DOCS.md)
  * Pythonのライブラリである「Flask」を利用して、WebアプリやWeb APIを作成する方法を学びます
* [Flutter勉強会](./2023/flutter/README.md)
  * 「Flutter」というネイティブアプリケーション開発向けのフレームワークを使って、アプリ開発を学びます

## リハーサルの時間を測る

ルートの `rehearsal.html` で、スライドを送りながら区間ごととスライドごとの所要時間を測れます。

```sh
pnpm build 2026/board-advanced/slide.md   # slide.md の隣に slide.html ができる
python3 -m http.server 8000
# http://localhost:8000/rehearsal.html?deck=2026/board-advanced/slide.html を開く
```

`file://` で開くとスライドの中身を読めないため、リポジトリのルートを HTTP で配信してから開きます。

* 区間は `#` 見出しのスライドで区切ります。区間を開いて、スライドの行の「区切り」で足したり外したりできます
* 区間ごとに予定の分数を入れると、予定との差と累計の差が出ます
* `Shift+T` で開始と一時停止を切り替えます。このページにフォーカスがあるときだけ効きます
* 発表者ビュー (`p`) で送っても、計測はスライドの移動に追従します
* 記録はデッキごとにブラウザの localStorage に残ります。CSV と JSON で書き出せます
