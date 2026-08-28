# みんなで書き込める掲示板を作ってみよう！

> この資料は、2026年9月開催のオンライン開発ゼミ（初心者コース）に向けて作成されたものです。
> 開催時間: 3時間

## 目的

JavaScript で掲示板アプリを作ります。
自分が書いた文字が画面に出るだけでなく、サーバーに保存されて他の人からも見える。その一連の流れを、変数・イベント・DOM 操作から `fetch` まで手を動かしながら学びます。

## 対象

プログラミングがはじめての方を想定しています。前回のクイズアプリ回に参加していなくても進められる構成です。

## 準備

- ブラウザのみ（StackBlitz を使用）
- 開発環境のインストール不要

テンプレートには「入力欄とボタンが並んだ、まだ何も動かない状態」の HTML と CSS が用意されています。受講者がさわるのは `script.js` だけです。

## 本編

書くコードはすべてスライドに載っています。

- [スライド（markdown版）](./slide.md)
- [スライド（HTML版）](https://jigintern.github.io/study_session_materials/board-2026/slide.html)
- [完成版アプリ（completed/）](./completed/) — 講師用の完成形
- [テンプレート（template/）](./template/) — StackBlitz プロジェクト作成の元。`script.js` は定数 2 行だけ
- [バックエンド API（backend/）](./backend/) — 受講者が `fetch` で叩くサーバー

## 構成

前半で「自分の画面の中だけで動く掲示板」を作り、後半でそれをサーバーにつなぎ替えます。

| 章 | 内容 |
| --- | --- |
| Chapter 1 | 書いた文字を画面に出す（変数・イベント・DOM 操作・配列） |
| Chapter 2 | サーバーとは何か（GET / POST・JSON・`await`） |
| Chapter 3 | 一覧をサーバーから読みこむ（`showPosts` を `fetch` に差し替え） |
| Chapter 4 | 投稿をサーバーに送る（`addPost` を `fetch` に差し替え） |
| Chapter 5 | 時刻の表示、発展課題 |

Chapter 1 で `addPost()` と `showPosts()` の 2 つの関数に切っておき、後半ではその中身だけを差し替えます。やることは同じで、投稿の置き場所が配列からサーバーに変わるだけ、という形で見せる構成です。

## テンプレートに必要な id（HTML）

スライドのコードは以下の id を前提にしています。

| id | 要素 |
|----|------|
| `name-input` | 名前の入力欄 |
| `text-input` | メッセージの入力欄 |
| `post-btn` | 投稿ボタン |
| `reload-btn` | 更新ボタン |
| `posts` | 投稿一覧の親要素（`<ul>`） |

`script.js` の先頭に、API のベース URL と部屋 ID の定数を用意しておきます。受講者はここをさわりません。

```javascript
const API = 'https://example.deno.dev'; // 講座までに実際の URL に差し替える
const ROOM = '0000'; // 開催回ごとに差し替える
```

## スクリーンショット

スライドに貼る画面は `screenshots/capture.ts` で撮り直せます。

```sh
deno run -A screenshots/capture.ts
```

バックエンドをメモリ上の KV で起動してサンプル投稿を入れ、章ごとの状態のページを Chrome の headless で撮ります。`template/` の HTML や CSS を変えたら、これを流し直せば 4 枚まとめて更新されます。

| ファイル | 使う場所 |
| --- | --- |
| `completed.png` | 今日のゴール |
| `template-initial.png` | 準備 |
| `chapter1-local.png` | Chapter 1 の動作チェック |
| `chapter3-readonly.png` | Chapter 3 の動作チェック |

## 講師用タイマー

記述スライドの右上にタイマーがあります。クリックで開始と停止、右クリックでリセット、± ボタンで 1 分ずつ増減します。持ち時間は写経の行数から見積もった初期値です。

## バックエンド

投稿の保存先は `backend/` にあります。仕様とローカルでの動かし方は [backend/README.md](./backend/README.md) を参照してください。
