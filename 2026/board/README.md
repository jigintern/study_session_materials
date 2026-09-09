# みんなで書き込める掲示板を作ってみよう！

> この資料は、2026年9月開催のオンライン開発ゼミ（初心者コース）に向けて作成されたものです。
> 開催時間: 3時間

## 目的

JavaScript で掲示板アプリを作ります。
自分が書いた文字が画面に出るだけでなく、サーバーに保存されて他の人からも見える。その一連の流れを、変数・イベント・DOM 操作から `fetch` まで手を動かしながら学びます。

## 準備

- ブラウザのみ（StackBlitz を使用）
- 開発環境のインストール不要
- テンプレート: https://stackblitz.com/edit/board-beginner

### 講座前にサンプル投稿を入れる

Chapter 3 の動作チェックで「自分が書いていない投稿が並んでいる」ことを確認します。受講者が投稿できるようになるのは Chapter 4 からなので、講座の前に数件入れておきます。

```sh
API=https://<アプリ名>.<org>.deno.net
ROOM=<今日の部屋>

curl -sX POST "$API/posts?room=$ROOM" -H 'Content-Type: application/json' \
  -d '{"name":"たろう","text":"はじめまして！"}'; sleep 1
curl -sX POST "$API/posts?room=$ROOM" -H 'Content-Type: application/json' \
  -d '{"name":"はなこ","text":"こんにちは〜"}'; sleep 1
curl -sX POST "$API/posts?room=$ROOM" -H 'Content-Type: application/json' \
  -d '{"name":"じろう","text":"掲示板できた 🎉"}'

curl -s "$API/posts?room=$ROOM"   # 3 件並んでいれば準備完了
```

`ROOM` に使えるのは英数字とハイフンで 32 文字までです。

## 困ったときは

- 質問がある場合、章節項に割り振られた通し番号といっしょに質問してもらえると対応しやすいです。
- 資料に誤字脱字や理論的な欠陥にお気づきなら、[リポジトリ](https://github.com/jigintern/study_session_materials) に Issue を作成して Contributor に知らせてください。確認して対応します。

## 本編

書くコードはすべてスライドに載っています。

- [スライド（markdown版）](./slide.md)
- [スライド（HTML版）](https://jigintern.github.io/study_session_materials/board-2026/slide.html)
- [完成版アプリ（completed/）](./completed/) — 講師用の完成形
- [テンプレート（template/）](./template/) — StackBlitz プロジェクト作成の元
- [バックエンド API（backend/）](./backend/) — 受講者が `fetch` で叩くサーバー。仕様と動かし方は [backend/README.md](./backend/README.md)
