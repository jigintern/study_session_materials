/**
 * 福井恐竜博物館 おでかけプランナー（授業用テンプレート）
 *
 * パート 4〜8 の関数は 2 種類の方法で有効にします:
 *   【記述】 // STUDENT: のコメントを読み、条件を満たすコードを自分で書く
 *   【解除】 /* … * / で囲まれたブロックの先頭・末尾の行を削除する
 * ブラウザを再読み込みして画面の変化を確認。console で試すときは main() 内のデバッグ用コメントを必要な行だけ外す。
 */

// ================================================================
// 定数・URL（授業中は変更不要）
// ================================================================

const DINO_CSV_URL =
  "https://raw.githubusercontent.com/code4fukui/dinosaur-opendata/main/latest_dino_sum.csv";
const SPOTS_CSV_URL =
  "https://raw.githubusercontent.com/code4fukui/fukui-spot/main/fuku-e-spot-dino.csv";

const MUSEUM_LAT = 36.08;
const MUSEUM_LNG = 136.51;

const OPEN_METEO_URL =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${MUSEUM_LAT}&longitude=${MUSEUM_LNG}` +
  `&daily=precipitation_sum` +
  `&timezone=Asia%2FTokyo&forecast_days=16`;

const CROWD_THRESHOLD = 500;

const COLORS = {
  empty:   "rgba(82, 183, 136, 0.85)",
  crowded: "rgba(224, 122, 95, 0.85)",
  unknown: "rgba(173, 181, 189, 0.75)",
};

// ================================================================
// グローバル変数
// ================================================================

let chart = null;
let dinoRows = null;
let allSpots = null;
let genreChangeBound = false;

// ================================================================
// 授業用のサンプルデータ
// ================================================================

const DEMO_DINO_ROWS = [
  { date_visit: "2026-05-01", n_people: 120, amount_fee: 120000 },
  { date_visit: "2026-05-02", n_people: 300, amount_fee: 240000 },
  { date_visit: "2026-05-03", n_people: 2502, amount_fee: 1800000 },
];

const DEMO_DINO_CSV = [
  "date_visit,n_people,amount_fee",
  "2026-05-01,120,120000",
  "2026-05-02,300,240000",
  "2026-05-03,2502,1800000",
].join("\n");

const DEMO_SPOTS = [
  {
    name: "かつやまディノパーク",
    category: "テーマパーク, 家族向け",
    url: "https://example.com/dino-park",
    description: "恐竜博物館の近くで恐竜モチーフの展示を楽しめるスポットです。",
  },
  {
    name: "平泉寺白山神社",
    category: "歴史, 自然",
    url: "https://example.com/heisenji",
    description: "苔むした参道が有名な歴史ある神社です。",
  },
  {
    name: "越前大仏",
    category: "歴史, 建築",
    url: "https://example.com/daibutsu",
    description: "大きな大仏と建築を見学できる人気スポットです。",
  },
];

// ================================================================
// 補助関数（授業運営用）
// ================================================================

// 各 STUDENT 関数が「まだ穴埋めされていない」ことを判定するためのプレースホルダ文字列辞書
const STUDENT_PLACEHOLDER_SNIPPETS = {
  formatDateLabel: ['return isoDate; // ← この行を書き換える'],
  splitLines: ['return []; // ← この行を書き換える'],
  parseDinoCsv: ['return []; // ← この行を書き換える'],
  loadDinoData: [
    'const res = null; // ← この行を書き換える',
    'const text = ""; // ← この行を書き換える',
  ],
  splitGenres: ['return []; // ← この行を書き換える'],
  barColor: ['return COLORS.unknown; // ← この行を書き換える'],
  weatherScore: ['return 0; // ← この行を書き換える'],
  loadWeatherData: [
    'const res = null; // ← この行を書き換える',
    'const json = {}; // ← この行を書き換える',
  ],
};

// ----------------------------------------------------------------
// isEnabled  その名前の関数があり、プレースホルダが残っていない（穴埋め完了）かを確認する
// main や hasEnabled では名前で参照（globalThis）。log*Try はスクリプト内の関数を直接呼ぶ。
// ----------------------------------------------------------------
function isEnabled(name) {
  const fn = globalThis[name];
  if (typeof fn !== "function") return false;

  const placeholderSnippets = STUDENT_PLACEHOLDER_SNIPPETS[name];
  if (!placeholderSnippets) return true;

  const source = Function.prototype.toString.call(fn);
  return !placeholderSnippets.some((snippet) => source.includes(snippet));
}

// ----------------------------------------------------------------
// hasEnabled  複数の関数がすべて穴埋め完了かまとめて確認する
// ----------------------------------------------------------------
function hasEnabled(...names) {
  return names.every((name) => isEnabled(name));
}

// ----------------------------------------------------------------
// logFormatDateLabelTry  [4-1]  main 内のコメント解除で有効化（関数内の console.log もここで走る）
// ----------------------------------------------------------------
function logFormatDateLabelTry() {
  formatDateLabel("2026-05-03");
}

// ----------------------------------------------------------------
// logSplitLinesTry  [5-1]
// ----------------------------------------------------------------
function logSplitLinesTry() {
  splitLines(DEMO_DINO_CSV);
}

// ----------------------------------------------------------------
// logParseDinoCsvTry  [5-2]  splitLines 完了後に使う
// ----------------------------------------------------------------
function logParseDinoCsvTry() {
  if (!hasEnabled("splitLines")) {
    warnWaiting("parseDinoCsv", ["splitLines"]);
    return;
  }
  parseDinoCsv(DEMO_DINO_CSV);
}

// ----------------------------------------------------------------
// logNormalizeSpacesTry  [6-1]  解除後に使う
// ----------------------------------------------------------------
function logNormalizeSpacesTry() {
  normalizeSpaces("歴史,\n  自然\t 家族向け");
}

// ----------------------------------------------------------------
// logSplitGenresTry  [6-2]
// ----------------------------------------------------------------
function logSplitGenresTry() {
  splitGenres("テーマパーク, 家族向け, 自然");
}

// ----------------------------------------------------------------
// logCollectUniqueGenresTry  [6-3]  splitGenres 完了後に使う
// ----------------------------------------------------------------
function logCollectUniqueGenresTry() {
  if (!hasEnabled("splitGenres")) {
    warnWaiting("collectUniqueGenres", ["splitGenres"]);
    return;
  }
  collectUniqueGenres(DEMO_SPOTS);
}

// ----------------------------------------------------------------
// logSpotCardFromRowTry  [6-4]  normalizeSpaces 有効化後に使う
// ----------------------------------------------------------------
function logSpotCardFromRowTry() {
  if (typeof normalizeSpaces !== "function") {
    warnWaiting("spotCardFromRow", ["normalizeSpaces"]);
    return;
  }
  spotCardFromRow(DEMO_SPOTS[0]);
}

// ----------------------------------------------------------------
// logBarColorTry  [7-1]
// ----------------------------------------------------------------
function logBarColorTry() {
  barColor(0);
  barColor(120);
  barColor(800);
}

// ----------------------------------------------------------------
// logWeatherScoreTry  [8-1]
// ----------------------------------------------------------------
function logWeatherScoreTry() {
  weatherScore(0);
  weatherScore(2.5);
  weatherScore(8);
}

// ----------------------------------------------------------------
// logLoadDinoDataTry  [5-3]  未完成時は fetch が失敗しうる（エラーは console に出る）
// ----------------------------------------------------------------
async function logLoadDinoDataTry() {
  await loadDinoData();
}

// ----------------------------------------------------------------
// logLoadWeatherDataTry  [8-2]
// ----------------------------------------------------------------
async function logLoadWeatherDataTry() {
  await loadWeatherData();
}

// ----------------------------------------------------------------
// warnWaiting  依存する関数がまだ完成していない旨の警告を console に出す
// ----------------------------------------------------------------
function warnWaiting(name, deps) {
  console.warn(`[demo] ${name}: 先に ${deps.join(" / ")} を有効にしてください`);
}

// ----------------------------------------------------------------
// setChartStatus  グラフエリアのステータスメッセージを更新する
// ----------------------------------------------------------------
function setChartStatus(text) {
  const status = document.getElementById("chart-status");
  if (status) status.textContent = text;
}

// ----------------------------------------------------------------
// setSpotsStatus  スポットエリアのステータスメッセージを更新する
// ----------------------------------------------------------------
function setSpotsStatus(text) {
  const status = document.getElementById("spots-status");
  if (status) status.textContent = text;
}

// ----------------------------------------------------------------
// renderChartFallback
// loadDinoData が完成するまでの間、サンプルデータでグラフを仮表示する
// formatDateLabel と buildOrUpdateChart の両方が完成済みのときだけ動く
// ----------------------------------------------------------------
function renderChartFallback() {
  if (!hasEnabled("formatDateLabel", "buildOrUpdateChart")) return;

  setChartStatus("サンプル 3 日分で棒グラフを表示中。パート 5 で公開 CSV に切り替わります。");
  buildOrUpdateChart(DEMO_DINO_ROWS);
}

// ----------------------------------------------------------------
// renderSpotsFallback
// loadSpotsData が完成するまでの間、サンプルデータでスポット一覧を仮表示する
// renderSpots / spotCardFromRow / normalizeSpaces がすべて完成済みのときだけ動く
// ----------------------------------------------------------------
function renderSpotsFallback() {
  if (!hasEnabled("renderSpots", "spotCardFromRow", "normalizeSpaces")) return;

  allSpots = DEMO_SPOTS;
  if (hasEnabled("populateGenreSelect", "collectUniqueGenres", "splitGenres")) {
    populateGenreSelect(collectUniqueGenres(DEMO_SPOTS));
  }
  renderSpots("__all__");
  setSpotsStatus("サンプル 3 件でスポット一覧を表示中。loadSpotsData で公開 CSV に切り替わります。");
}

// ----------------------------------------------------------------
// renderTopThreeFallback
// renderTopThree が完成済みなら dinoRows（なければ DEMO）で TOP 3 を表示する
// loadDinoData より前に完成している場合のフォールバックとして機能する
// ----------------------------------------------------------------
function renderTopThreeFallback() {
  if (!hasEnabled("renderTopThree", "formatDateLabel")) return;

  const rows = dinoRows || DEMO_DINO_ROWS;
  renderTopThree(rows);
}

// ================================================================
// [4-1] formatDateLabel  【記述】
// ISO 日付を "M/D" に変換
// デバッグは main の logFormatDateLabelTry をコメント解除して確認
// ================================================================
function formatDateLabel(isoDate) {
  // STUDENT: "-" で分割して月と日を取り出し、"M/D" 形式の文字列を返してください。
  // 例: "2026-05-03" → "5/3"（先頭ゼロは不要）
  // ヒント: split / Number / テンプレートリテラル を使う
  return isoDate; // ← この行を書き換える
}

// ================================================================
// [4-2] buildOrUpdateChart
// rows を Chart.js の data に変換して描画
// 解除後: サンプル 3 日分の棒グラフが画面に出る
// 必要: formatDateLabel
// ================================================================
/*
function buildOrUpdateChart(rows) {
  const canvas = document.getElementById("reservation-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = rows.map((r) => formatDateLabel(r.date_visit));
  const data = rows.map((r) => r.n_people);
  const backgroundColor = isEnabled("barColor")
    ? rows.map((r) => barColor(r.n_people))
    : rows.map(() => "rgba(45, 106, 79, 0.85)");

  const config = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "予約人数",
          data,
          backgroundColor,
          borderWidth: 0,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const i = items[0]?.dataIndex ?? 0;
              return rows[i]?.date_visit ?? "";
            },
            label: (item) => {
              const n = item.parsed.y ?? 0;
              if (!isEnabled("barColor")) {
                return `予約人数: ${n.toLocaleString("ja-JP")} 人`;
              }
              const tag =
                n <= 0 ? "未確定・0件" : n < CROWD_THRESHOLD ? "空きやすい目安" : "混みやすい目安";
              return [`予約人数: ${n.toLocaleString("ja-JP")} 人`, tag];
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 20 },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "予約人数" },
        },
      },
    },
  };

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = backgroundColor;
    chart.update();
  } else {
    chart = new Chart(canvas.getContext("2d"), config);
  }
}
*/

// ================================================================
// [5-1] splitLines  【記述】
// CSV テキストを行配列にする
// 完成後: splitLines が有効になる（確認は main の logSplitLinesTry）
// ================================================================
function splitLines(text) {
  // STUDENT: 次の条件を満たす処理を書いてください。
  //   1. 前後の余分な空白・改行を取り除く
  //   2. Windows 改行 "\r" を空文字に置き換える
  //   3. "\n" で分割して行の配列にする
  //   4. 空行（""）を取り除く
  // ヒント: trim / replaceAll / split / filter を順番につなぐ
  return []; // ← この行を書き換える
}

// ================================================================
// [5-2] parseDinoCsv  【記述】
// 恐竜 CSV をオブジェクト配列に変換
// 完成後: parseDinoCsv が有効になる（確認は main の logParseDinoCsvTry）
// 必要: splitLines
// ================================================================
function parseDinoCsv(text) {
  const lines = splitLines(text);
  if (lines.length < 2) return [];
  // STUDENT: lines の先頭行はヘッダーなので読み飛ばし、残りの各行を
  //   { date_visit, n_people, amount_fee } のオブジェクトに変換してください。
  //   - "," で分割して前後の空白を trim する
  //   - n_people と amount_fee は Number() で数値にする（変換失敗時は 0）
  // ヒント: slice(1) / map / split / trim / Number
  return []; // ← この行を書き換える
}

// ================================================================
// [5-3] loadDinoData  【記述】
// 公開 CSV を fetch して rows にし、グラフを更新
// 完成後: 棒グラフが本番データに切り替わる
// 必要: parseDinoCsv / buildOrUpdateChart
// ================================================================
async function loadDinoData() {
  const thresholdEl = document.getElementById("threshold-value");
  if (thresholdEl) thresholdEl.textContent = String(CROWD_THRESHOLD);
  setChartStatus("予約データを読み込み中…");

  // STUDENT: DINO_CSV_URL に fetch リクエストを送り、レスポンスを受け取ってください。
  //   - await を使って非同期に待機する
  //   - 取得に失敗したとき（res.ok が false）はエラーを throw する
  // ヒント: const res = await fetch(...);
  const res = null; // ← この行を書き換える
  if (!res.ok) throw new Error(`恐竜データの取得に失敗しました (${res.status})`);

  // STUDENT: レスポンスをテキスト（CSV 文字列）として受け取ってください。
  // ヒント: const text = await res.text();
  const text = ""; // ← この行を書き換える

  const rows = parseDinoCsv(text);
  dinoRows = rows;

  setChartStatus(`最新の公開データ ${rows.length} 日分を表示しています。`);
  buildOrUpdateChart(rows);

  if (isEnabled("renderTopThree")) {
    renderTopThree(rows);
  }
}

// ================================================================
// [6-1] normalizeSpaces
// 改行やタブ入りの文字列を 1 行に整える
// 解除後: logNormalizeSpacesTry() で試せる
// ================================================================
/*
function normalizeSpaces(text) {
  return text
    .replaceAll("\r", " ")
    .replaceAll("\n", " ")
    .replaceAll("\t", " ")
    .split(" ")
    .filter((part) => part !== "")
    .join(" ");
}
*/

// ================================================================
// [6-2] splitGenres  【記述】
// category のカンマ区切りをジャンル配列にする
// 完成後: splitGenres が有効になる（確認は main の logSplitGenresTry）
// ================================================================
function splitGenres(category) {
  if (!category) return [];
  // STUDENT: 次の条件を満たす処理を書いてください。
  //   1. "," でジャンルを分割する
  //   2. 各ジャンルの前後の空白を取り除く
  //   3. 空文字を取り除く
  // 例: "テーマパーク, 家族向け" → ["テーマパーク", "家族向け"]
  // ヒント: split / map / trim / filter(Boolean)
  return []; // ← この行を書き換える
}

// ================================================================
// [6-3] collectUniqueGenres
// 全スポットから重複なしジャンル一覧を作る
// 解除後: logCollectUniqueGenresTry() で試せる
// 必要: splitGenres
// ================================================================
/*
function collectUniqueGenres(parsedRows) {
  const set = new Set();
  for (const row of parsedRows) {
    const cat = row.category || row["category"];
    for (const g of splitGenres(cat)) set.add(g);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
}
*/

// ================================================================
// [6-4] spotCardFromRow
// 1 件分のスポットデータからカード DOM を作る
// 解除後: logSpotCardFromRowTry() で試せる
// 必要: normalizeSpaces
// ================================================================
/*
function spotCardFromRow(row) {
  const name = row.name || "";
  const category = row.category || "";
  const url = row.url || "#";
  let desc = row.description || "";
  if (desc.length > 160) desc = `${desc.slice(0, 160)}…`;

  const card = document.createElement("article");
  card.className = "spot-card";

  const h3 = document.createElement("h3");
  h3.className = "spot-card__title";
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = name;
  h3.appendChild(a);

  const meta = document.createElement("p");
  meta.className = "spot-card__meta";
  meta.textContent = normalizeSpaces(category);

  const p = document.createElement("p");
  p.className = "spot-card__desc";
  p.textContent = desc;

  card.append(h3, meta, p);
  return card;
}
*/

// ================================================================
// [6-5] renderSpots
// allSpots を画面に描画する
// 解除後: サンプルのスポットカード一覧が出る
// 必要: spotCardFromRow
// ================================================================
/*
function renderSpots(filterGenre) {
  const container = document.getElementById("spot-list");
  if (!container || !allSpots) return;

  container.innerHTML = "";

  const filtered =
    !filterGenre || filterGenre === "__all__"
      ? allSpots
      : allSpots.filter((row) => {
          const genres = splitGenres(row.category || "");
          return genres.includes(filterGenre);
        });

  const frag = document.createDocumentFragment();
  for (const row of filtered) {
    frag.appendChild(spotCardFromRow(row));
  }
  container.appendChild(frag);
}
*/

// ================================================================
// [6-6] populateGenreSelect
// select にジャンル option を入れ、change で renderSpots を呼ぶ
// 解除後: 絞り込み用 select に項目が入る
// 必要: renderSpots
// ================================================================
/*
function populateGenreSelect(genres) {
  const sel = document.getElementById("genre-select");
  if (!sel) return;

  sel.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "__all__";
  optAll.textContent = "すべて表示";
  sel.appendChild(optAll);

  for (const g of genres) {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    sel.appendChild(opt);
  }

  if (genreChangeBound) return;
  sel.addEventListener("change", () => renderSpots(sel.value));
  genreChangeBound = true;
}
*/

// ================================================================
// [6-7] loadSpotsData
// Papa Parse で公開 CSV を読み込み、本番の一覧と select に切り替える
// 解除後: スポット一覧が公開データに切り替わる
// 必要: collectUniqueGenres / populateGenreSelect / renderSpots
// ================================================================
/*
function loadSpotsData() {
  setSpotsStatus("観光スポットを読み込み中…");

  return new Promise((resolve, reject) => {
    Papa.parse(SPOTS_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data || [];
        allSpots = data;
        const genres = collectUniqueGenres(data);
        populateGenreSelect(genres);
        renderSpots("__all__");
        setSpotsStatus(`スポット ${data.length} 件（ジャンル ${genres.length} 種）`);
        resolve();
      },
      error: (err) => reject(err),
    });
  });
}
*/

// ================================================================
// [7-1] barColor  【記述】
// 予約人数を棒の色に変換
// 完成後: グラフが色分けされる（確認は main の logBarColorTry）
// ================================================================
function barColor(nPeople) {
  // STUDENT: nPeople の値に応じて 3 種類の色を返してください。
  //   - 0 以下（未確定）→ COLORS.unknown
  //   - CROWD_THRESHOLD（500人）未満 → COLORS.empty（空きやすい）
  //   - それ以上 → COLORS.crowded（混みやすい）
  // ヒント: COLORS と CROWD_THRESHOLD は定数として定義済み
  return COLORS.unknown; // ← この行を書き換える
}

// ================================================================
// [7-2] renderTopThree
// 「空きやすい日」を 3 件表示する（教材の完成版は予約人数のみで並べる。天気は TOP 3 に使わない）
// 解除後: グラフの下に TOP 3 が出る
// 必要: formatDateLabel
// ================================================================
/*
function renderTopThree(rows) {
  const list = document.getElementById("top-days-list");
  const title = document.getElementById("top-days-title");
  if (!list) return;

  const positive = rows.filter((r) => r.n_people > 0);
  const ranked = [...positive].sort((a, b) => a.n_people - b.n_people);
  const top = ranked.slice(0, 3);

  if (title) {
    title.textContent = "おすすめ日 TOP 3（予約が少ない順）";
  }

  list.innerHTML = "";
  if (top.length === 0) {
    const li = document.createElement("li");
    li.textContent = "比較できるデータがありません（予約人数がすべて 0 の可能性があります）。";
    list.appendChild(li);
    return;
  }

  for (const r of top) {
    const li = document.createElement("li");
    li.textContent = `${r.date_visit}（${formatDateLabel(r.date_visit)}）— 予約 ${r.n_people.toLocaleString("ja-JP")} 人`;
    list.appendChild(li);
  }
}
*/

// ================================================================
// [8-1] weatherScore  【記述】
// 降水量(mm)を点数に変換する例（発展: おすすめ並びに天気を足すときに使える。メインの TOP 3 には未使用）
// 完成後: 点数ロジックが有効になる（確認は main の logWeatherScoreTry）
// ================================================================
function weatherScore(precipitation) {
  // STUDENT: 降水量(mm)に応じて点数を返してください。
  //   - 0mm（晴れ）→ 30 点
  //   - 5mm 未満（小雨）→ 10 点
  //   - 5mm 以上（雨）→ -20 点
  // ヒント: if 文の条件と戻り値を書く（=== と < を使い分ける）
  return 0; // ← この行を書き換える
}

// ================================================================
// [8-2] loadWeatherData  【記述】
// Open-Meteo から降水量を取得し、画面上の天気エリアに表示する（おすすめ TOP 3 の並びには使わない）
// 完成後: 天気エリアに予報が表示される（デバッグは main の logLoadWeatherDataTry をコメント解除）
// ================================================================
async function loadWeatherData() {
  // STUDENT: OPEN_METEO_URL に fetch リクエストを送り、レスポンスを受け取ってください。
  //   - await を使って非同期に待機する
  //   - 取得失敗時はエラーを throw する
  // ヒント: const res = await fetch(...);
  const res = null; // ← この行を書き換える
  if (!res.ok) throw new Error(`天気データの取得に失敗しました (${res.status})`);

  // STUDENT: レスポンスを JSON オブジェクトとして受け取ってください。
  //   - CSV と違い、天気 API は JSON を返すので res.json() を使う
  // ヒント: const json = await res.json();
  const json = {}; // ← この行を書き換える

  const dates = json.daily?.time ?? [];
  const precips = json.daily?.precipitation_sum ?? [];
  const weatherMap = new Map(dates.map((d, i) => [d, precips[i] ?? 0]));
  const weatherStatus = document.getElementById("weather-status");
  if (weatherStatus) {
    const sample = dates.slice(0, 3).map((date, i) => {
      const precip = precips[i] ?? 0;
      const label = precip === 0 ? "晴れ" : precip < 5 ? "小雨" : "雨";
      return `${formatDateLabel(date)} ${label}`;
    });
    weatherStatus.textContent = `天気データ ${dates.length} 日分を取得しました（例: ${sample.join(" / ")}）`;
  }
  const weatherList = document.getElementById("weather-list");
  if (weatherList) {
    weatherList.innerHTML = "";
    const preview = dates.slice(0, 5);
    for (let i = 0; i < preview.length; i += 1) {
      const date = preview[i];
      const precip = precips[i] ?? 0;
      const label = precip === 0 ? "晴れ" : precip < 5 ? "小雨" : "雨";
      const li = document.createElement("li");
      li.textContent = `${formatDateLabel(date)}: ${label}（降水量 ${precip} mm）`;
      weatherList.appendChild(li);
    }
  }
}

// ================================================================
// 付録 A: `map.html` 用のロジック（参考）
// `index.html` 本体では使わず、Leaflet を読み込んだ単体ページで使う
// ================================================================
/*
let leafletMap = null;
let mapMarkers = [];

function initMap() {
  leafletMap = L.map("map").setView([36.06, 136.22], 10);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(leafletMap);
}

function renderMarkers(spots) {
  for (const marker of mapMarkers) marker.remove();
  mapMarkers = [];

  for (const spot of spots) {
    const lat = Number(spot.lat);
    const lng = Number(spot.lng);
    if (!lat || !lng) continue;

    const marker = L.marker([lat, lng])
      .addTo(leafletMap)
      .bindPopup(`<b>${spot.name}</b><br>${spot.category}`);
    mapMarkers.push(marker);
  }
}

function applyMapFilter(filterGenre) {
  if (!allSpots) return;

  const filtered =
    !filterGenre || filterGenre === "__all__"
      ? allSpots
      : allSpots.filter((row) => splitGenres(row.category || "").includes(filterGenre));

  renderMarkers(filtered);
}
*/

// ================================================================
// 付録 B: `open-meteo.html` 用のロジック（参考）
// `index.html` 本体の `loadWeatherData()` とは別に、単体デモではグラフと表を作る
// ================================================================
/*
let precipChart = null;

function labelFromPrecip(precipitation) {
  if (precipitation === 0) return "晴れ (+30)";
  if (precipitation < 5) return "小雨 (+10)";
  return "雨 (-20)";
}

function barColorForPrecip(precipitation) {
  if (precipitation === 0) return "rgba(82, 183, 136, 0.85)";
  if (precipitation < 5) return "rgba(255, 179, 71, 0.9)";
  return "rgba(224, 122, 95, 0.85)";
}

function buildOrUpdatePrecipChart(dates, precips) {
  const canvas = document.getElementById("precip-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = dates.map((date) => formatDateLabel(date));
  const data = precips.map((precip) => precip ?? 0);

  const config = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "降水量 (mm)",
          data,
          backgroundColor: data.map((precip) => barColorForPrecip(precip)),
          borderWidth: 0,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const index = items[0]?.dataIndex ?? 0;
              return dates[index] ?? "";
            },
            label: (item) => {
              const value = item.parsed.y ?? 0;
              return [
                `降水量: ${value} mm`,
                `${labelFromPrecip(value)}（スコア ${weatherScore(value)}）`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
          },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "降水量 (mm)" },
        },
      },
    },
  };

  if (precipChart) {
    precipChart.data.labels = labels;
    precipChart.data.datasets[0].data = data;
    precipChart.data.datasets[0].backgroundColor = data.map((precip) => barColorForPrecip(precip));
    precipChart.update();
  } else {
    precipChart = new Chart(canvas.getContext("2d"), config);
  }
}

async function loadOpenMeteoDemo() {
  const status = document.getElementById("weather-status");
  const tbody = document.getElementById("weather-rows");
  if (!tbody) return;

  const res = await fetch(OPEN_METEO_URL);
  if (!res.ok) throw new Error(`取得に失敗しました (${res.status})`);

  const json = await res.json();
  const dates = json.daily?.time ?? [];
  const precips = json.daily?.precipitation_sum ?? [];

  buildOrUpdatePrecipChart(dates, precips);

  tbody.innerHTML = "";
  for (let i = 0; i < dates.length; i += 1) {
    const date = dates[i];
    const precipitation = precips[i] ?? 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${date}</td>
      <td class="weather-code">${precipitation}</td>
      <td>${labelFromPrecip(precipitation)}（スコア ${weatherScore(precipitation)}）</td>
    `;
    tbody.appendChild(tr);
  }

  if (status) {
    status.textContent = `${dates.length} 日分の予報をグラフと表で表示しています。`;
  }
}
*/

// ================================================================
// 起動
// コメント解除済みのメソッドだけ使って画面に変化を出す（console は main 内のデバッグ用コメントで）
// ================================================================

async function main() {
  // ------------------------------------------------------------
  // デバッグ用: 必要な行だけコメント解除し、終わったら戻す（console を静かに保つ）
  // 穴埋め途中に入れた console.log は、対応する log*Try() を 1 行だけ外すと表示される
  //
  // logFormatDateLabelTry();
  // logSplitLinesTry();
  // logParseDinoCsvTry();
  // logNormalizeSpacesTry();
  // logSplitGenresTry();
  // logCollectUniqueGenresTry();
  // logSpotCardFromRowTry();
  // logBarColorTry();
  // logWeatherScoreTry();
  // await logLoadDinoDataTry();
  // await logLoadWeatherDataTry();
  // ------------------------------------------------------------

  try {
    if (hasEnabled("loadDinoData", "parseDinoCsv", "buildOrUpdateChart", "formatDateLabel")) {
      await loadDinoData();
    } else {
      if (isEnabled("loadDinoData")) {
        warnWaiting("loadDinoData", ["parseDinoCsv", "buildOrUpdateChart"]);
      }
      renderChartFallback();
    }

    if (hasEnabled("loadSpotsData", "collectUniqueGenres", "splitGenres", "populateGenreSelect", "renderSpots", "spotCardFromRow", "normalizeSpaces")) {
      await loadSpotsData();
    } else {
      if (isEnabled("loadSpotsData")) {
        warnWaiting("loadSpotsData", ["collectUniqueGenres", "populateGenreSelect", "renderSpots"]);
      }
      renderSpotsFallback();
    }

    if (isEnabled("loadWeatherData")) {
      await loadWeatherData().catch((e) => {
        console.warn("天気データを取得できませんでした:", e);
      });
    }

    renderTopThreeFallback();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    setChartStatus(`エラー: ${msg}`);
    setSpotsStatus(`エラー: ${msg}`);
    console.error(e);
  }
}

main();
