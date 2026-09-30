# リアルタイムに届く掲示板を SSE で作ろう

> この資料は、2026年9月開催のオンライン開発ゼミ（経験者コース）に向けて作成されたものです。
> 開催時間: 3時間

## 目的

投稿が自分の画面に届くまでの経路を、ブラウザ側とサーバー側の両方から書きます。

はじめに「更新ボタンを押す」掲示板を「10 秒ごとに勝手に読み直す」掲示板に変え、そこで見える無駄を出発点にして SSE に置き換えます。
後半は、受講者が自分で立てたサーバーに配信する側を書きます。

裏のテーマは DevTools です。
Network タブと EventStream タブで、通信の様子をすべて目で確かめます。
操作手順は [devtools.md](./devtools.md) にまとめてあります。

## 前提知識

変数・関数・配列・オブジェクト・イベントリスナが読める程度を想定しています。
JavaScript そのものが初めてでも構いません。

`async` と `await` は前提にしていません。
配布コードには出てきますが、読み方は当日渡します。

## 準備

- ブラウザのみ（StackBlitz を使用）
- 開発環境のインストール不要
- テンプレート: https://stackblitz.com/fork/github/jigintern/study_session_materials/tree/main/2026/board-advanced/template?file=public%2Fscript.js,server.js

### Fork してから書く

テンプレートを開いたら、書き始める前に左上の Fork を押してください。
サインインは要りません。

Fork せずに書くと、ページを再読み込みした時点で書いたコードがテンプレートの状態に戻ります。
この講座は動作チェックのたびに再読み込みをするので、Fork を飛ばすと必ず踏みます。

## 困ったときは

- 質問がある場合、章節項に割り振られた通し番号といっしょに質問してもらえると対応しやすいです。
- 資料に誤字脱字や理論的な欠陥にお気づきなら、[リポジトリ](https://github.com/jigintern/study_session_materials) に Issue を作成して Contributor に知らせてください。確認して対応します。

## 本編

書くコードはすべてスライドに載っています。

- [スライド（markdown版）](./slide.md)
- [スライド（HTML版）](https://jigintern.github.io/study_session_materials/board-advanced-2026/slide.html)
- [DevTools の操作手順（devtools.md）](./devtools.md): EventStream タブと、接続が切れたときの見え方
- [テンプレート（template/）](./template/): StackBlitz プロジェクト作成の元
- [完成形（completed/）](./completed/): 講座を通しで書き終えた状態のプロジェクト一式
- [追いつき用スナップショット（examples/snapshots/）](./examples/snapshots/): 章末時点のコード
- [バックエンド API（backend/）](./backend/): 受講者が前半でつなぐ共有サーバー
