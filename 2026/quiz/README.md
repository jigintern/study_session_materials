# 1から学ぶ JavaScript！ クイズアプリを作ってみよう

> この資料は、2026年8月開催のオンライン開発ゼミ（初心者コース）に向けて作成されたものです。
> 開催時間: 3時間

## 目的

JavaScript を使って自分だけの3択クイズアプリを作ります。
HTML と CSS で作ったページに「動き」をつける体験を通して、変数・関数・条件分岐・DOM操作・配列/オブジェクトといった JavaScript の基本を学びます。

## 準備

- ブラウザのみ（StackBlitz を使用）
- 開発環境のインストール不要
- テンプレート: **[テンプレートURL（準備中）]**

テンプレートには「1問目が決めうちで表示された状態」の HTML と CSS が用意されています。今日さわるのは `script.js`（JS）だけです。

## 本編

書くコードはすべてスライドに載っています。

- [スライド（markdown版）](./slide.md)
- [スライド（HTML版）](https://jigintern.github.io/study_session_materials/quiz-2026/slide.html)
- [完成版アプリ（completed/）](./completed/) — 講師用の完成形。テンプレート作成の元にもなる

### テンプレートに必要な id（HTML）

`completed/index.html` と同じ構成を想定しています。スライドのコードは以下の id を前提にしています。

| id | 要素 |
|----|------|
| `question-number` | 問題番号の表示欄 |
| `question` | 問題文の表示欄 |
| `choices` | 選択肢ボタンの親要素 |
| `choice-0` `choice-1` `choice-2` | 選択肢ボタン |
| `result` | 正解 / 不正解の表示欄 |
| `next-btn` | 「次の問題へ」ボタン |
