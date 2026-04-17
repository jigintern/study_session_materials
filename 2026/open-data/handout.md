# 配布資料：オープンデータで課題を解決する Web アプリ開発

## 概要

> **「身の回りの課題」→「オープンデータで解決できそう」→「Web アプリで解決する」**

この授業では、**福井恐竜博物館 おでかけプランナー** を題材に、上の流れをゼロから体験します。

プログラミングの技術は「課題を解くための道具」として、必要になったタイミングで登場します。

前半は身近な困りごとから問いを立て、後半は [Code for FUKUI](https://github.com/code4fukui) の**オープンデータ（CSV）**を `fetch` で取り込みます。  
そのうえで「混雑だけでなく天気も見たい」となれば、**同じ `fetch` で公開 API（JSON）** にもつなげられる、という流れでアプリを広げます。

---

## 題材：福井恐竜博物館 おでかけプランナー

### 課題

> 「GW に恐竜博物館に行きたいけど、混みそうで迷ってる。いつ行けば空いてる？ 近くに他にどんな観光スポットがある？」

### 使うオープンデータ

| データ                                                               | 内容                                                 | 提供元         |
| :------------------------------------------------------------------- | :--------------------------------------------------- | :------------- |
| [dinosaur-opendata](https://github.com/code4fukui/dinosaur-opendata) | 恐竜博物館の 60 日先までの予約人数（毎日更新）       | Code for FUKUI |
| [fukui-spot](https://github.com/code4fukui/fukui-spot)               | 福井県の観光スポット一覧（名前・ジャンル・位置情報） | Code for FUKUI |

### 完成アプリで何がわかるか

- 予約人数の棒グラフ →「GW のどの日が混んでいるか」が一目でわかる
- 「空いている日」を緑・「混んでいる日」を赤で色分け →「いつ行くか」の判断材料になる
- 観光スポット一覧をジャンルで絞り込み →「行く前後に寄れる場所」がわかる

---

## ファイル構成

```
2026/open-data/
├── template/       # ハンズオン開始用（このフォルダをコピーして編集を始める）
├── index.html      # アプリの画面（HTML 骨格）— 完成版デモ
├── map.html        # Leaflet 地図（スポットをピン表示）
├── open-meteo.html # Open-Meteo API の降水量を Chart.js でグラフ化するサンプル（表付き）
├── styles.css      # 見た目のスタイル
├── app.js          # JavaScript：データ取得・グラフ・スポット一覧（完成版デモ）
├── CODE_REFERENCE.md   # `template/` と完成版の見方をまとめた索引
├── README.md       # 授業の仕様・設計書
├── slide.md        # 講義スライド（講師用・Marp）
└── handout.md      # この配布資料（参加者用）
```

### ハンズオンは `template/` から

スライドに長いコードは載せません。**まず [`template/`](./template/) フォルダをコピー**し、その中の `index.html` / `styles.css` / `app.js` を編集します。  
見た目の **CSS は授業では書かず**、テンプレートの `styles.css` をそのまま使う想定です（`template/README.md` にも記載）。

### コードがうまく動かないとき

講義の進行に合わせた **完成版の参照** は [`CODE_REFERENCE.md`](./CODE_REFERENCE.md) にまとまっています。  
`template/app.js` の該当ブロックと、リポジトリ直下の完成版 `app.js` を見比べながら進められます。

---

## Day 1（3 時間）― 問いを形にする日

### 第1章：VSCode を使ってみよう ― 開発の準備をする（15 分）

[Visual Studio Code](https://code.visualstudio.com/) は、HTML・CSS・JavaScript などのコードを書くためのエディタです。今日の実習ではこれを使います。

**入れておくと便利な拡張機能**

| 拡張機能 | 何に使うか |
| :--- | :--- |
| [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) | HTML をローカルサーバーで開き、保存のたびにブラウザへ反映 |
| [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) | 保存時にコードを自動整形 |
| [Japanese Language Pack for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=MS-CEINTL.vscode-language-pack-ja) | VSCode を日本語表示に |

左サイドバーの拡張機能アイコンを開き、名前で検索してインストールしてください。

**おすすめのワークスペース設定**

コマンドパレット `Ctrl(cmd) + Shift + P` から `基本設定: ワークスペース設定を開く (JSON)` を選んで以下を貼ります。

```json
{
  "editor.wordWrap": "on",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.renderWhitespace": "all",
  "editor.tabSize": 2,
  "editor.minimap.enabled": false
}
```

**今日の VSCode の使い方**

1. `index.html` / `styles.css` / `app.js` を開く
2. コードを書いたら `Ctrl(cmd) + S` で保存する
3. `index.html` を Live Server で開いてブラウザ確認
4. 表示がおかしいときは VSCode とブラウザの Console（F12）を確認する

---

### 第2章：Web ページの三本柱 ― HTML・CSS・JavaScript（15 分）

まず完成アプリを見せてもらいながら、ページを構成する 3 つの技術を確認します。

| 技術           | 役割                       | ファイル     |
| :------------- | :------------------------- | :----------- |
| **HTML**       | 骨格（「何が」あるか）     | `index.html` |
| **CSS**        | 見た目（「どう見せるか」） | `styles.css` |
| **JavaScript** | 動き（「どう動くか」）     | `app.js`     |

**試してみよう**

ブラウザの開発者ツール（F12）を開いて、以下を確認してください。

1. 「Elements」タブで HTML の構造を眺める
2. `<canvas id="reservation-chart">` というタグを探す（棒グラフがここに描かれる）
3. 「Console」タブを開いて空白になっていることを確認（エラーが出ていないかチェック）

---

### 第3章：問いを立てる ― 身近な問題から考える（45 分）

まずは「どんなデータがあるか」ではなく、**自分の身の回りで困っていること**から始めます。

**身近な問題を出してみよう**

1. 「混み具合がわからない」「行くタイミングを決めにくい」「比較しづらい」などの困りごとを各自で出す
2. その困りごとが「データがあれば判断しやすくなるか」を考える
3. 完成アプリを見て、「問いをアプリで解く」とはどういうことかをつかむ

**今日のデータで試せる問いに絞る**

全員の問いをそのまま実装するのは難しいので、今日は [Code for FUKUI](https://github.com/code4fukui) の公開データを使って、近い形で試せる問いに絞ります。

| データ | 内容 | 提供元 |
| :--- | :--- | :--- |
| [dinosaur-opendata](https://github.com/code4fukui/dinosaur-opendata) | 恐竜博物館の 60 日先までの予約人数（毎日更新） | Code for FUKUI |
| [fukui-spot](https://github.com/code4fukui/fukui-spot) | 福井県の観光スポット（名前・ジャンル・位置情報） | Code for FUKUI |

- [dinosaur-opendata](https://github.com/code4fukui/dinosaur-opendata) から「いつ行けば空いているか」を考える
- [fukui-spot](https://github.com/code4fukui/fukui-spot) から「行く前後にどこへ寄れるか」を考える

**ここで持ちたい見通し**

- データがあると「なんとなく」ではなく「根拠をもって」判断できる
- 今日の授業では、身近な問題を完全に解くのではなく、**近い形で解ける問いに変換して試す**

---

### 第4章：Chart.js でグラフ ― データを見える化する（55 分）

「数字の羅列では判断できない」から、グラフが必要になります。ここで **Chart.js** が登場します。

#### Step 1：固定データで棒グラフを描いてみる

[`template/`](./template/) をコピーしたフォルダで作業します。テンプレートの **`app.js` は骨格・定数・デモ・補助関数・`main()` を含み、パート4以降で追加する関数（`[4-*]`〜`[8-*]`）は 2 種類の方法で有効にします**: `// STUDENT:` のある関数は**条件を満たすコードを自分で書く（記述）**、`/* … */` で囲まれた関数は**ブロックコメントを外す（解除）**。詳しくは [`template/README.md`](./template/README.md) を参照。`index.html` では Chart.js を先に読み込んでから `app.js` を読み込みます。

スライドを見ながら、**`app.js` にコードを入力**して固定データの棒グラフを表示します（スライドでは `data` オブジェクトの形も説明します）。

**確認ポイント**

- [ ] 棒グラフが 3 本表示されるか
- [ ] ラベル（5/1〜5/3）が横軸に表示されるか
- [ ] Console にエラーがないか

#### Step 2：`data` / `labels` / `datasets` の構造を理解する

`app.js` の `buildOrUpdateChart()` 関数を一緒に読みます。

```javascript
// app.js より（該当箇所）
const labels = rows.map((r) => formatDateLabel(r.date_visit));
const data = rows.map((r) => r.n_people);
const backgroundColor = rows.map((r) => barColor(r.n_people));
```

- `labels`：グラフの横軸に表示する文字列の配列
- `data`：棒の高さを表す数値の配列
- `backgroundColor`：棒ごとの色を表す文字列の配列

#### Step 3：タイトル・ツールチップなどのカスタマイズ

`app.js` の `options` の部分を読んで、どんなカスタマイズが入っているか確認します（**棒の色分けはパート 7 で扱います**。パート 4 のハンズオンでは色分けはまず入れず、単色の棒グラフから進めます）。

---

### 第5章：CSV を読み取る ― fetch と async/await（取得 → 確認 → 抽出）（55 分）

「毎回 CSV を手で貼り付けるのは大変。自動で最新データを取ってきたい」というところから `fetch` と `async/await` が登場します。

#### `fetch` の仕組み

```javascript
// URL を渡すとデータが返ってくる
const response = await fetch("https://example.com/data.csv");
const text = await response.text();
```

#### `async` / `await` とは

`fetch` はデータが届くまでに時間がかかります。`await` は「データが来るまで待つ」命令です。`await` を使うには関数に `async` をつける必要があります。

```javascript
async function loadData() {
  const res = await fetch(URL); // 待つ
  const text = await res.text(); // テキストとして受け取る
  console.log(text);
}
```

#### CSV を JavaScript の配列に変換する

`app.js` の `parseDinoCsv()` 関数を読みます。

```javascript
function parseDinoCsv(text) {
  const lines = text
    .trim()
    .replaceAll("\r", "")
    .split("\n")
    .filter((line) => line !== "");
  // lines[0] はヘッダ行なので除外する
  const rows = lines.slice(1).map((line) => {
    const [date_visit, n_people, amount_fee] = line
      .split(",")
      .map((s) => s.trim());
    return {
      date_visit,
      n_people: Number(n_people) || 0,
      amount_fee: Number(amount_fee) || 0,
    };
  });
  return rows;
}
```

**ポイント**

| 操作                        | 意味                             |
| :-------------------------- | :------------------------------- |
| `text.replaceAll("\r", "")` | 改行コードをそろえる             |
| `split("\n")`               | 改行で分割して行の配列にする     |
| `lines.slice(1)`            | 先頭のヘッダ行を除く             |
| `line.split(",")`           | カンマで分割して列の配列にする   |
| `.map(...)`                 | 配列の全要素に変換処理を適用する |

**ハンズオン**

`loadDinoData()` 関数を読み、`fetch` で取得した CSV が `parseDinoCsv` を通ってグラフに渡るまでの流れをトレースしてください。

- [ ] `fetch` の URL はどこに書かれているか確認する
- [ ] `parseDinoCsv` が返す配列の中身を `console.log` で確認する
- [ ] グラフのデータが CSV の実際の数値に変わっていることを確認する

---

## Day 2（3 時間）― 機能を広げる日

Day 1 で予約データのグラフが最新化できたので、Day 2 はここから機能を足して「行く日を決めやすいアプリ」にしていきます。

---

### 第6章：観光スポット一覧 ― DOM 操作と filter（45 分）

「博物館の混雑はわかった。せっかく行くなら近くのスポットも知りたい」

ここで **fukui-spot** データを使います。

#### スポット CSV を読む

スポットデータは列数が多く、列名も変わりうるので **Papa Parse** ライブラリを使います。

```javascript
// Papa Parse でヘッダ付き CSV を読む
Papa.parse(URL, {
  download: true,
  header: true, // 先頭行をキーとして使う
  skipEmptyLines: true,
  complete: (results) => {
    console.log(results.data); // オブジェクト配列
  },
});
```

> **補足**：恐竜データは列数が固定（3列）なので `split` で手書きパースしました。  
> スポットデータのように列数が多い・増える可能性があるときはライブラリが便利です。

#### DOM でカード一覧を作る

`app.js` の `spotCardFromRow()` 関数を読みます。

```javascript
// 要素を作って内容を入れて返す
const card = document.createElement("article");
const h3 = document.createElement("h3");
h3.textContent = row.name;
card.appendChild(h3);
// …
return card;
```

**ハンズオン**

1. `loadSpotsData()` が呼ばれてから `renderSpots()` までの流れを追う
2. `spot-list` の中身が変わる様子を開発者ツールで観察する
3. ジャンルのドロップダウンを変えたときに何が起きているか確認する

---

### 第7章：色分けと TOP 3 ― 直感的な UI を作る（30 分）

グラフのバーを混雑度で色分けして、直感的にわかるようにします。

#### しきい値による色分け

`app.js` の `barColor()` 関数を読みます。

```javascript
const CROWD_THRESHOLD = 500; // 人数の目安

function barColor(nPeople) {
  if (nPeople <= 0) return COLORS.unknown; // 未確定・0件 → グレー
  if (nPeople < CROWD_THRESHOLD) return COLORS.empty; // 空きやすい → 緑
  return COLORS.crowded; // 混みやすい → 赤
}
```

#### ジャンルで絞り込む（`filter`）

`renderSpots()` 関数を読みます。

```javascript
const filtered = allSpots.filter((row) => {
  const genres = splitGenres(row.category || "");
  return genres.includes(filterGenre);
});
```

`filter` は条件に一致する要素だけを残した**新しい配列**を返します。元の配列は変わりません。

#### おすすめ日 TOP 3

`renderTopThree()` 関数を読みます。

```javascript
const sorted = [...positive].sort((a, b) => a.n_people - b.n_people);
const top = sorted.slice(0, 3);
```

**ハンズオン**

1. `CROWD_THRESHOLD` の値を変えてグラフの色がどう変わるか試す
2. ジャンルを変えてスポット一覧が絞り込まれることを確認する
3. `renderTopThree` が表示する 3 日を確認し、CSV の数値と一致しているか確認する

---

### 第8章：公開 API でおすすめ日を作る ― CSV のつぎに JSON を足す（40 分）

オープンデータだけでは足りない情報を、同じ `fetch` で足す、という流れに入ります。

ここまで、オープンデータは **GitHub 上の CSV ファイル** を `fetch` → `text()` で読んできました。  
一方、**天気**のように CSV に含まれていない情報は、別の形で公開されていることがあります。**公開 API** は「決まった URL にアクセスすると、JSON などが返ってくる」サービスで、ブラウザからは **`fetch` → `json()`** で受け取れます（やり方の骨格は CSV と同じです）。

#### Open-Meteo で天気データを取得する

[Open-Meteo](https://open-meteo.com/) は天気予報を提供する公開 API です。  
`fetch` で URL を叩くと JSON が返ってきます。

```javascript
const URL =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=36.08&longitude=136.51" +
  "&daily=precipitation_sum" +
  "&timezone=Asia%2FTokyo&forecast_days=16";

const res = await fetch(URL);
const json = await res.json();

const dates = json.daily.time; // ["2026-04-13", "2026-04-14", ...]
const precips = json.daily.precipitation_sum; // [0.0, 2.3, 0.0, ...]
```

| パラメータ                | 意味                                 |
| :------------------------ | :----------------------------------- |
| `latitude` / `longitude`  | 場所の指定（教材では恐竜博物館付近） |
| `daily=precipitation_sum` | 1 日の降水量合計（mm）               |
| `forecast_days=16`        | 最大 16 日先まで取得                 |

#### 組み合わせのヒント（発展）：天気スコアと予約人数

メインの完成版では **おすすめ日 TOP 3**（`renderTopThree`）は **予約人数だけ**（少ない順）で並べます。天気は **天気エリア**（`loadWeatherData()`）に表示する、という役割分担です。

発展として、降水量を点数化して予約人数と足し合わせる考え方もあります（メインの完成版では TOP 3 には未使用）。

```javascript
// 発展のイメージ（メインの完成版では TOP 3 に未使用）
function weatherScore(precipitation) {
  if (precipitation === 0) return 30;
  if (precipitation < 5) return 10;
  return -20;
}
const score = -r.n_people + (precip !== null ? weatherScore(precip) : 0);
```

**ポイント**：`json.daily.time`（日付）と `json.daily.precipitation_sum`（降水量）のインデックスは対応しています。予約データの `date_visit` をキーに突き合わせる、という発展の練習になります。

> **ライセンス・利用**：無料 API は **非商用** が前提（教育・学習でのデモ利用は例示されている）。データ表示付近に **クレジット**（例: _Weather data by Open-Meteo.com_）を出す（CC BY 4.0）。サービスとして商用公開する場合は **利用規約・有償プラン** を公式サイトで確認する。

**ハンズオン**

- [ ] ブラウザのアドレスバーに URL を直接貼って JSON の構造を確認する
- [ ] `json.daily.time` と `json.daily.precipitation_sum` を `console.log` で出力する
- [ ] `loadWeatherData()` を追い、天気エリアに取得結果が出ることを確認する（TOP 3 の並びは予約人数のままであることを確認する）
- [ ] （発展）`weatherScore` を試し、降水量と予約人数の突き合わせ方のイメージをつかむ

---

### 第9章：改善タイム・発表 ― グループ内で共有（60 分）

#### 改善タイム

- 各自で改善テーマを 1 つ決めて手を入れる
- 例：Leaflet で地図表示、`localStorage` でお気に入り保存、しきい値や表示文言の改善

#### Leaflet で地図にスポットをピン表示する

[Leaflet](https://leafletjs.com/) は地図を表示できる JavaScript ライブラリです（BSD-2-Clause ライセンス、商用利用可）。

**1. HTML に追加する**

```html
<!-- head 内に CSS を読み込む -->
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>
<!-- body 末尾などに JS を読み込む -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- 地図を表示したい場所に div を置く（高さ必須） -->
<div id="map" style="height: 400px;"></div>
```

**2. 地図を初期化する**

```javascript
// 福井県周辺を中心に地図を作る（教材の初期ズーム例）
const map = L.map("map").setView([36.06, 136.22], 10);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
```

**3. スポットをピン表示する**

```javascript
// Papa Parse で読み込んだ allSpots を地図に載せる
for (const spot of allSpots) {
  L.marker([Number(spot.lat), Number(spot.lng)])
    .addTo(map)
    .bindPopup(`<b>${spot.name}</b><br>${spot.category}`);
}
```

| コード                              | 意味                                 |
| :---------------------------------- | :----------------------------------- |
| `L.map("map")`                      | `id="map"` の要素に地図を作る        |
| `.setView([緯度, 経度], ズーム)`    | 初期表示の中心とズームレベルを決める |
| `L.tileLayer(url, { attribution })` | 地図の背景タイルを設定する           |
| `L.marker([lat, lng])`              | 指定座標にピンを立てる               |
| `.bindPopup(html)`                  | クリック時に吹き出しを表示する       |

> `Number(spot.lat)` のように明示的に数値へ変換するのがポイントです。  
> CSV から読み込んだ値は文字列なので、変換しないとピンが正しく表示されません。

**ハンズオン**

- [ ] `<div id="map">` を `index.html` に追加して地図が表示されることを確認する
- [ ] スポット CSV を読み込んだ後に上のループを呼び出してピンが立つか確認する
- [ ] `.bindPopup()` の中身を変えて表示内容をカスタマイズする

#### 発表（グループ内）

- **目的**（何をよくしたいと決めたか）、**使ったもの**（技術・ファイル・API）、**どこまで進んだか** を短く共有する
- 各自ブラウザでデモできればベスト（動かなくても、試した内容を話してよい）

---

## 今日使った技術まとめ

| 技術                    | なぜ必要になったか                         |
| :---------------------- | :----------------------------------------- |
| Chart.js                | 数字だけでは比べにくく、グラフ化したかった |
| `fetch` / `async/await` | 手で貼らずに自動取得したかった             |
| `split` / `map`         | CSV を使いやすい形に変えたかった           |
| Papa Parse              | 列の多い CSV を楽に読みたかった            |
| `createElement`         | スポット一覧を画面に並べたかった           |
| `filter`                | 条件に合うものだけ表示したかった           |
| 条件分岐・色分け        | 状況をひと目で判断しやすくしたかった       |
| 公開 API / JSON         | 別データも組み合わせたかった               |

---

## 参考リンク

- [Code for FUKUI](https://github.com/code4fukui) — 今日使ったオープンデータの提供元
- [Chart.js 公式ドキュメント](https://www.chartjs.org/docs/latest/)
- [Papa Parse 公式サイト](https://www.papaparse.com/)
- [MDN: fetch](https://developer.mozilla.org/ja/docs/Web/API/fetch)
- [MDN: async function](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN: Array.prototype.filter](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [Leaflet 公式サイト](https://leafletjs.com/) — 地図ライブラリ（BSD-2-Clause）
- [Leaflet クイックスタート](https://leafletjs.com/examples/quick-start/)
- [Open-Meteo 公式サイト](https://open-meteo.com/) — 無料天気予報 API（非商用）
- [Open-Meteo API ドキュメント](https://open-meteo.com/en/docs)
