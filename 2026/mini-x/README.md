# ミニX をつくろう

> この資料は、2026 年 11 月の高専訪問勉強会に向けて作成したものです。
> 開催時間: 2 時間 × 2 日

## 目的

X 風のタイムラインアプリ「ミニX」を作ります。
自分のポストがサーバーに保存され、みんなのタイムラインに流れる。その仕組みを、HTML の部品づくりから `fetch` によるサーバーとのやりとりまで、手を動かしながら学びます。

見た目（CSS）は X に似せて用意してあるので、みなさんは HTML と JavaScript だけを書きます。

## 準備

次の 3 つを使います。入れ方は手元資料の「準備」にあります。

- [Visual Studio Code](https://code.visualstudio.com/)
- [Bun](https://bun.com/)
- [Google Chrome](https://www.google.com/chrome/)

手元資料の「準備」にあるリンクから [mini-x.zip](https://github.com/jigintern/study_session_materials/raw/main/2026/mini-x/mini-x.zip) をダウンロードし、解凍します。
解凍してできた `mini-x` フォルダで `bun run index.html` を実行し、表示された URL を Chrome で開きます。

zip の中には VS Code の設定も入っています。VS Code から離れると自動で保存され、保存したときにコードの字下げも自動で整います。

## 本編

- [手元資料（DOCS.md）](./DOCS.md)：手元で見ながら進める資料。手順と動作チェックがすべて載っている
- [スライド（slide.md）](./slide.md)：前に映す資料。概論と各ミッションの要点
- [テンプレート（template/）](./template/)：`mini-x.zip` の中身と同じもの
- [完成形（completed/）](./completed/)：ミッション 4 まで書き終えた状態。ポストといいねを保存するサーバー（`server.js`）もここにある
- [応用の答え（advanced/）](./advanced/)：完成形に、応用ミッションの A1〜A6、B1〜B4、B7〜B9 の答えを全部入れたもの
- [TypeScript 版（typescript/）](./typescript/)：応用 B6 の答え。完成形を TypeScript にしたもの
- [React 版（jsx/、tsx/）](./jsx/)：応用 B10、B11 の答え。完成形を React で書き直したもの（[tsx/](./tsx/) は TypeScript 版）

## 困ったときは

- 質問がある場合は、ミッションの番号といっしょに質問してもらえると対応しやすいです。
- 資料に誤字脱字や誤りを見つけたら、[リポジトリ](https://github.com/jigintern/study_session_materials) に Issue を作成して知らせてください。
