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
- テンプレート: https://stackblitz.com/edit/node-cdfr3jqk?file=public%2Fscript.js,server.js

### Fork してから書く

テンプレートを開いたら、書き始める前に左上の Fork を押してください。
サインインは要りません。

Fork せずに書くと、ページを再読み込みした時点で書いたコードがテンプレートの状態に戻ります。
この講座は動作チェックのたびに再読み込みをするので、Fork を飛ばすと必ず踏みます。

### 当日伝える値

`public/script.js` の先頭に、書き換える定数が 2 つあります。

| 定数 | 入れる値 |
| --- | --- |
| `API` | 共有サーバーの URL |
| `ROOM` | 開催回ごとの部屋 ID。英数字とハイフンで 32 文字まで |

Chapter 4 で受講者が `API` を `location.origin` に書き換えて自分のサーバーへ向け、まとめで共有サーバーの URL に戻します。
戻すときに URL を入れ直すので、受講者が見返せる場所に残しておいてください。

### 講座前にサンプル投稿を入れる

Chapter 1 の時点で「自分が書いていない投稿が並んでいる」ことを確認します。
講座の前に数件入れておきます。

```sh
API=https://<アプリ名>.<org>.deno.net
ROOM=<今日の部屋>

curl -sX POST "$API/posts?room=$ROOM" -H 'Content-Type: application/json' \
  -d '{"name":"たろう","text":"はじめまして！"}'; sleep 1
curl -sX POST "$API/posts?room=$ROOM" -H 'Content-Type: application/json' \
  -d '{"name":"はなこ","text":"こんにちは〜"}'

curl -s "$API/posts?room=$ROOM"   # 2 件並んでいれば準備完了
```

### 講師がサクラ役を務める

Chapter 1 から 3 とまとめは「他人の投稿が届く」ことで動作チェックが成立します。
オンラインでは進度がばらけるため、受講者同士では章が空振りします。
講師が同じ部屋に投稿を入れて、他人の投稿を発生させてください。

Chapter 3 の最初は「投稿のたびに `posts` が1本ずつ増える」ところを見せます。
1 件だけでは増え方が見えないので、数秒おきに続けて投稿してください。

### 接続者一覧を開いておく

Chapter 2 で受講者が `EventSource` でつなぐと、その接続が `GET /connections?room=<今日の部屋>` に一覧で出ます。

この画面を共有しておくと、受講者は自分がつながったことを人数の増え方で確かめられます。
認証はないので、部屋 ID を知っている人は誰でも開けます。

Chapter 4 でつなぎ先を自分のサーバーに変えると一覧から消え、まとめで共有サーバーに戻すとまた出ます。

## 時間が押したときの短縮ルート

どちらも到達の下限（Chapter 2 の完成）には影響しません。

| 落とすもの | やり方 | 浮く時間 |
| --- | --- | --- |
| Chapter 5 を丸ごとコピペにする | 3 箇所を書かせず、`examples/snapshots/ch5.server.js` を貼ってもらう。読み合わせと動作チェックだけ残す | 15 分 |
| Chapter 4 の接続状態表示を配る | 接続状態を出すコードを先に配り、`GET /events` を足すところだけ書かせる | 5 分 |

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
