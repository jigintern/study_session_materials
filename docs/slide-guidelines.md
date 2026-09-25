# スライドのガイドライン

PR の CI (`.github/workflows/slide-check.yml`) が、スライドのはみ出しと小さすぎる文字を検査します。
ここには、この検査が見ている規則だけを書きます。

## 検査の規則

描画は公開物 (GitHub Pages) と同じ設定の marp で行います。
`theme:` に marp の組み込みテーマ (`default`、`gaia`、`uncover`) を書いたスライドは、そのテーマで測ります。
登録されていないテーマ (`academic` など) を書いたスライドは、公開物と同じく default テーマで測ります。

### はみ出し

1 ページの本文がスライドの枠の下端から 1px を超えてはみ出したら違反です。
枠の大きさは `size:` で決まり、16:9 (指定しないときも同じ) なら 1280x720 です。
高さを指定した枠の中身があふれた場合も違反です。
`position: absolute` の要素と、`overflow: hidden` などで中身を切り取る要素の内側は測りません。

コードブロック (`pre`) は横方向も見ます。
横スクロールが 1px を超えて出たら違反です。

### 文字の大きさ

文字を持つ要素の `font-size` が次の値を下回ったら違反です。

| 場所 | 下限 |
| --- | --- |
| コード (`pre` / `code`) と表 (`table`) の内側 | 18px |
| それ以外 | 20px |

`style="font-size: 0.6em"` のように直接縮めた文字も同じ基準で測ります。

### 検査から外すもの

次の 2 つとその内側だけを外します。

- タイマーのボタン (`.timer-btn`)
- marp の `header:` / `footer:` ディレクティブで付けたヘッダとフッタ

本文を縮めたい箇所 (図の注記など) は例外にしません。

## 検査されるスライド

PR の差分から、次の規則で選びます。

- `<年>/<題材>/` の下のファイルが変わった教材の `slide.md` を検査し、違反があればジョブを落とします。`slide.md` 以外 (画像や CSS) の変更も対象です
- 描画結果を変える共通ファイルが変わったときは、それ以外の全教材の `slide.md` も検査します。こちらは結果を出すだけで、ジョブは落としません

違反は CI のログに 1 行ずつ出ます。
実行結果のページ (Summary) には、スライドごと・種別ごとの件数の表が出ます。

marp の変換やページの読み込みに失敗したスライドは `build-failed` として出し、違反と同じに扱います。

共通ファイルは `engine.mjs`、`.marprc.yml`、`package.json`、`pnpm-lock.yaml`、`tools/slide-check/` の下、`.github/workflows/slide-check.yml` です。

選ばれる対象は手元でも確かめられます。

```sh
tools/slide-check/targets.sh origin/main HEAD
```

## 手元で検査する

初回だけ Chromium を入れます。

```sh
pnpm install
pnpm exec playwright install chromium
```

教材の `slide.md` を渡して実行します。

```sh
pnpm check:slides 2026/<題材>/slide.md
```

違反は `<slide.md>:p<ページ番号> <種別> <値>px <テキストの先頭>` の形で 1 行ずつ出ます。
種別は `overflow` (下へのはみ出し)、`overflow-x` (コードブロックの横スクロール)、`font` (文字の大きさ) です。
違反があれば終了コードは 1 です。

手元の結果は目安で、CI の結果を正とします。
CI (ubuntu と `fonts-noto`) と手元ではフォントが違い、折り返しの位置がずれてはみ出し量が数 px 変わることがあります。
