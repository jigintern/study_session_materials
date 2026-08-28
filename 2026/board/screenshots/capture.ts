// 教材用のスクリーンショットを撮り直すスクリプト。
//
//   deno run -A screenshots/capture.ts
//
// バックエンドをメモリ上の KV で起動し、サンプル投稿を入れ、
// 各章の状態のページを Chrome の headless で撮る。
// テンプレートの HTML / CSS を変えたら、これを流し直せば全部撮り直せる。

const HERE = new URL(".", import.meta.url).pathname;
const BOARD = `${HERE}..`;
const API_PORT = 8787;
const PAGE_PORT = 8788;
const API = `http://localhost:${API_PORT}`;
const ROOM = "shot";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/** 撮影用に差し替える先頭2行 */
function withLocalApi(source: string): string {
  return source
    .replace(/^const API = .*$/m, `const API = '${API}';`)
    .replace(/^const ROOM = .*$/m, `const ROOM = '${ROOM}';`);
}

/** Chapter 1 の到達点（サーバーを使わない、配列だけの掲示板） */
const CHAPTER1_SCRIPT = `
const posts = [];

function showPosts() {
  const list = document.getElementById('posts');
  list.textContent = '';

  for (const post of posts) {
    const item = document.createElement('li');
    item.textContent = \`\${post.name}: \${post.text}\`;
    list.appendChild(item);
  }
}

function addPost() {
  const name = document.getElementById('name-input').value;
  const text = document.getElementById('text-input').value;

  posts.push({ name: name, text: text });

  document.getElementById('text-input').value = '';
  showPosts();
}

document.getElementById('post-btn').addEventListener('click', addPost);

// 撮影用: 数件入れた状態を作る
posts.push({ name: 'たろう', text: 'はじめまして！' });
posts.push({ name: 'はなこ', text: 'こんにちは〜' });
showPosts();
`;

/** Chapter 3 の到達点（読むだけ。時刻はまだ出ない） */
function chapter3Script(completed: string): string {
  return completed
    .replace(
      /    const time = new Date\(post\.createdAt\)\.toLocaleTimeString\(\);\n/,
      "",
    )
    .replace(/ \(\$\{time\}\)/, "")
    .replace(
      /document\.getElementById\('post-btn'\)[\s\S]*?addPost\);\n/,
      "",
    );
}

const SAMPLE_POSTS = [
  { name: "たろう", text: "はじめまして！" },
  { name: "はなこ", text: "こんにちは〜" },
  { name: "じろう", text: "掲示板できた 🎉" },
];

// ---- ここから実行 ----

const completed = await Deno.readTextFile(`${BOARD}/completed/script.js`);
const templateScript = await Deno.readTextFile(`${BOARD}/template/script.js`);
const html = await Deno.readTextFile(`${BOARD}/template/index.html`);
const css = await Deno.readTextFile(`${BOARD}/template/styles.css`);

/** 章ごとの script.js */
const variants: Record<string, string> = {
  "template-initial": withLocalApi(templateScript),
  "chapter1-local": CHAPTER1_SCRIPT,
  "chapter3-readonly": withLocalApi(chapter3Script(completed)),
  "completed": withLocalApi(completed),
};

// バックエンドを起動
const api = new Deno.Command("deno", {
  args: [
    "run",
    "--unstable-kv",
    "--allow-net",
    "--allow-read",
    "--allow-write",
    "--allow-env",
    `${BOARD}/backend/main.ts`,
  ],
  env: { KV_PATH: ":memory:", PORT: String(API_PORT) },
  stdout: "null",
  stderr: "null",
}).spawn();

// ページ配信
const pageServer = Deno.serve({ port: PAGE_PORT, onListen: () => {} }, (req) => {
  const path = new URL(req.url).pathname;
  if (path.endsWith("styles.css")) {
    return new Response(css, { headers: { "Content-Type": "text/css" } });
  }
  const variant = path.split("/")[1];
  if (path.endsWith("script.js")) {
    return new Response(variants[variant] ?? "", {
      headers: { "Content-Type": "text/javascript; charset=utf-8" },
    });
  }
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});

await new Promise((r) => setTimeout(r, 2000));

// サンプル投稿を入れる（時刻がばらけるよう少しずつ間を空ける）
for (const post of SAMPLE_POSTS) {
  await fetch(`${API}/posts?room=${ROOM}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
  await new Promise((r) => setTimeout(r, 1100));
}

// 撮影
for (const name of Object.keys(variants)) {
  const out = `${HERE}${name}.png`;
  const chrome = new Deno.Command(CHROME, {
    args: [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=2",
      "--window-size=760,620",
      "--virtual-time-budget=4000",
      `--screenshot=${out}`,
      `http://localhost:${PAGE_PORT}/${name}/`,
    ],
    stdout: "null",
    stderr: "null",
  });
  await chrome.output();
  console.log(`撮影: ${name}.png`);
}

api.kill();
await api.status;
await pageServer.shutdown();
