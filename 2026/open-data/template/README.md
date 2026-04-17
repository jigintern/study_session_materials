# 授業用テンプレート（`template/`）

スライドに長いコードは載せません。**このフォルダをまるごとコピー**してハンズオンを始めます。

## 含まれるもの

| ファイル     | 内容                                                                                               |
| :----------- | :------------------------------------------------------------------------------------------------- |
| `index.html` | 完成版と同じ骨格（`canvas`・Chart.js / Papa Parse / `app.js` の読み込み、スポット枠など）          |
| `styles.css` | 完成版と同じ見た目（**授業では書き換えない想定**）                                                 |
| `app.js`     | 定数・デモ・補助関数・`main()` は入っている。パート4〜8の関数（`[4-*]`〜`[8-*]`）は、スライドに合わせて **【記述】は穴埋めし、【解除】はブロックコメントを外して** 進める |

## `app.js` の進め方

各メソッドには **【記述】** と **【解除】** の 2 種類があります。

| 種類 | 見分け方 | やること |
| :--- | :------- | :------- |
| **【記述】（穴埋め）** | 関数の中に `// STUDENT:` のコメントがある | 条件を読み、空欄を自分で埋める |
| **【解除】** | 関数が `/*` … `*/` で囲まれている | `/*` と `*/` の行だけを削除する |

どちらも保存してブラウザを再読み込みすると、**主に画面**に変化が出ます。

| パート | ラベル | 種類 | 確認できること |
| :----- | :----- | :--- | :------------- |
| パート 4 | `[4-1] formatDateLabel` | **記述** | `logFormatDateLabelTry` で途中確認できる |
| パート 4 | `[4-2] buildOrUpdateChart` | 解除 | サンプル 3 日分の棒グラフが出る |
| パート 5 | `[5-1] splitLines` | **記述** | CSV が行に分かれる（中身は `main` の `logSplitLinesTry` で確認可） |
| パート 5 | `[5-2] parseDinoCsv` | **記述** | 行がオブジェクト配列になる（`logParseDinoCsvTry`） |
| パート 5 | `[5-3] loadDinoData` | **記述** | グラフが公開データに切り替わる（`logLoadDinoDataTry`） |
| パート 6 | `[6-1] normalizeSpaces` | 解除 | 文字列が 1 行に整う（`logNormalizeSpacesTry`） |
| パート 6 | `[6-2] splitGenres` | **記述** | カテゴリがジャンル配列になる（`logSplitGenresTry`） |
| パート 6 | `[6-3]`〜`[6-7]` | 解除 | スポット一覧・絞り込みが表示される |
| パート 7 | `[7-1] barColor` | **記述** | グラフが緑・赤・灰色に色分けされる（`logBarColorTry`） |
| パート 7 | `[7-2] renderTopThree` | 解除 | おすすめ日 TOP 3 が表示される |
| パート 8 | `[8-1] weatherScore` | **記述** | 降水量から点数が付く（`logWeatherScoreTry`） |
| パート 8 | `[8-2] loadWeatherData` | **記述** | 天気エリアに予報一覧が表示される（`logLoadWeatherDataTry`） |

### ブラウザの console で確認したいとき（任意）

`app.js` の `main()` 冒頭にある **デバッグ用**のコメントのうち、必要な **1 行だけ** `//` を外してください。関数の中に一時的に入れた `console.log` も、その行で対象関数が実行されると表示されます。用が済んだら `//` を戻すと、再読み込みのたびに余計な log は出ません。

| 目的 | `main()` でコメント解除する行の例 |
| :--- | :--- |
| `[4-1]` | `logFormatDateLabelTry();` |
| `[5-1]`〜`[5-2]` | `logSplitLinesTry();` / `logParseDinoCsvTry();` |
| `[6-1]` / `[6-3]` / `[6-4]` | `logNormalizeSpacesTry();` / `logCollectUniqueGenresTry();` / `logSpotCardFromRowTry();` |
| `[5-3]` 全体の流れ | `await logLoadDinoDataTry();`（未完成だと fetch で失敗しうる） |
| `[6-2]` / `[7-1]` / `[8-1]` | `logSplitGenresTry();` / `logBarColorTry();` / `logWeatherScoreTry();` |
| `[8-2]` | `await logLoadWeatherDataTry();` |

> **穴埋めを直す前でも** ブラウザを開いてエラーにはなりません（上記のデバッグ行を外していない限り、console は静かです）。完成させて画面の違いを確かめてみましょう。  
> 完成版は一つ上のディレクトリの [`app.js`](../app.js) または [`CODE_REFERENCE.md`](../CODE_REFERENCE.md) を参照してください。

## 使い方

1. `template` フォルダを作業用に別名でコピーする。
2. VSCode でそのフォルダを開き、Live Server で `index.html` を表示する。
3. スライドのハンズオン指示に従い、`app.js` のメソッドごとのコメントを順番に外していく。

完成版や参照の見方は、ひとつ上のディレクトリの [`CODE_REFERENCE.md`](../CODE_REFERENCE.md) を参照してください。
