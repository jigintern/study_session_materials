import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { homedir, tmpdir } from 'node:os';
import { basename, delimiter, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = dirname(fileURLToPath(import.meta.url));
const MARKER = '<!-- ここから下に書いていきます -->';
const DOCS_STAGES = ['m0', 'm1', 'm2', 'm3', 'm4'];
const SAMPLE_NAMES_NEWEST_FIRST = ['じろう', 'はなこ', 'たろう'];
const SCREENSHOT_DIR = join(ROOT, 'screenshots');
const SERVER_STARTED = /(http:\/\/\S+) で起動しました/;
const DEV_SERVER = { args: ['run', 'index.html', '--port=0'], pattern: /url: (http:\/\/\S+)/ };
const ZIP_PATH = join(ROOT, 'mini-x.zip');
// latest は Go 版の 7 系で、VS Code が同梱する 6 系と診断がずれうるので版を固定する
const TYPESCRIPT = 'typescript@6.0.3';
const ZIP_REBUILD = "cd 2026/mini-x && rm -f mini-x.zip && ln -s template mini-x && zip -r -X mini-x.zip mini-x -x '*.DS_Store' && rm mini-x";

class Failure extends Error {}

function assert(ok, message) {
  if (!ok) throw new Failure(message);
}

function findBun() {
  const candidates = [
    ...(process.env.PATH ?? '').split(delimiter).filter(Boolean).map((dir) => join(dir, 'bun')),
    join(homedir(), '.bun', 'bin', 'bun'),
  ];
  return candidates.find((path) => existsSync(path));
}

const children = [];

function startProcess(command, args, cwd, urlPattern, env) {
  const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  let output = '';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Failure(`${args.join(' ')} が 10 秒以内に起動しませんでした: ${output}`)), 10_000);
    const onData = (chunk) => {
      output += chunk;
      const match = output.match(urlPattern);
      if (match) {
        clearTimeout(timer);
        resolve({ url: match[1].replace(/\/$/, ''), child, output });
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('exit', (code) => reject(new Failure(`${args.join(' ')} が終了しました (code ${code}): ${output}`)));
  });
}

// server.js で配る段階は API に自分の URL を書き込んでから起動するので、PORT=0 ではなく先に空きポートを決める
function freePort() {
  return new Promise((resolve) => {
    const probe = createServer().listen(0, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

function stopProcess(child) {
  if (child.exitCode === null) child.kill('SIGTERM');
}

function stopAll() {
  for (const child of children) stopProcess(child);
}

async function api(apiUrl, method, path, body) {
  const res = await fetch(apiUrl + path, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  return { status: res.status, cors: res.headers.get('access-control-allow-origin'), json: await res.json() };
}

async function openEvents(apiUrl, room) {
  const aborter = new AbortController();
  const res = await fetch(`${apiUrl}/posts/events?room=${room}`, { signal: aborter.signal });
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  let pending;
  async function next(ms) {
    for (;;) {
      const end = buffer.indexOf('\n\n');
      if (end >= 0) {
        const data = buffer.slice(0, end).split('\n').filter((line) => line.startsWith('data:'));
        buffer = buffer.slice(end + 2);
        if (data.length > 0) return data.join('\n');
        continue;
      }
      pending ??= reader.read().catch(() => ({ done: true }));
      const result = await Promise.race([pending, new Promise((resolve) => setTimeout(resolve, ms, 'timeout'))]);
      if (result === 'timeout') return null;
      pending = undefined;
      if (result.done) return null;
      buffer += result.value;
    }
  }
  return { res, next, close: () => aborter.abort() };
}

async function checkEvents(apiUrl) {
  const room = 'verify-sse';
  const noRoom = await fetch(apiUrl + '/posts/events');
  assert(noRoom.status === 400 && noRoom.headers.get('access-control-allow-origin') === '*', `room なしの /posts/events は 400 と CORS ヘッダー: ${noRoom.status}`);

  const events = await openEvents(apiUrl, room);
  assert(events.res.status === 200 && /^text\/event-stream/.test(events.res.headers.get('content-type')) && events.res.headers.get('access-control-allow-origin') === '*', `/posts/events は 200 の text/event-stream と CORS ヘッダー: ${events.res.status} ${events.res.headers.get('content-type')}`);

  const created = await api(apiUrl, 'POST', '/posts?room=' + room, { name: 'テスト', text: 'SSE' });
  assert(await events.next(3000) !== null, 'ポストすると同じ部屋の /posts/events に知らせが届く');
  await api(apiUrl, 'POST', `/posts/${created.json.id}/like?room=${room}`);
  assert(await events.next(3000) !== null, 'いいねすると同じ部屋の /posts/events に知らせが届く');
  await api(apiUrl, 'POST', '/posts?room=verify-sse-other', { name: 'テスト', text: 'SSE' });
  assert(await events.next(300) === null, '別の部屋のポストは知らせない');

  events.close();
  await new Promise((resolve) => setTimeout(resolve, 200));
  const afterClose = await fetch(apiUrl + '/posts?room=' + room, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'テスト', text: '切断後' }) });
  assert(afterClose.status === 201, `接続を閉じた画面が送り先から外れ、その部屋にポストできる: ${afterClose.status}`);
}

async function checkServer(apiUrl) {
  const room = 'verify-server';
  const japanese = /[ぁ-んァ-ヶ一-龠]/;

  const noRoom = await api(apiUrl, 'GET', '/posts');
  assert(noRoom.status === 400 && japanese.test(noRoom.json.message), `room なしは 400 と日本語メッセージ: ${JSON.stringify(noRoom)}`);
  assert(noRoom.cors === '*', 'エラー応答にも Access-Control-Allow-Origin: * が付く');

  const badRoom = await api(apiUrl, 'GET', '/posts?room=' + 'a'.repeat(33));
  assert(badRoom.status === 400, `33 文字の room は 400: ${badRoom.status}`);

  const preflight = await fetch(apiUrl + '/posts?room=' + room, { method: 'OPTIONS' });
  assert(preflight.status === 204 && /Content-Type/i.test(preflight.headers.get('access-control-allow-headers') ?? ''), `OPTIONS は 204 と Allow-Headers: Content-Type: ${preflight.status}`);

  const initial = await api(apiUrl, 'GET', '/posts?room=' + room);
  assert(initial.status === 200 && initial.cors === '*', `一覧は 200 と CORS ヘッダー: ${initial.status}`);
  assert(JSON.stringify(initial.json.map((p) => p.name)) === JSON.stringify(SAMPLE_NAMES_NEWEST_FIRST), `新しい部屋はサンプル 3 件が新しい順: ${JSON.stringify(initial.json.map((p) => p.name))}`);

  const emptyText = await api(apiUrl, 'POST', '/posts?room=' + room, { name: 'テスト', text: '   ' });
  assert(emptyText.status === 400 && japanese.test(emptyText.json.message), `空白だけの本文は 400: ${JSON.stringify(emptyText)}`);

  const emptyName = await api(apiUrl, 'POST', '/posts?room=' + room, { name: '', text: 'こんにちは' });
  assert(emptyName.status === 400, `空の名前は 400: ${emptyName.status}`);

  const notJson = await api(apiUrl, 'POST', '/posts?room=' + room, '{name:');
  assert(notJson.status === 400, `JSON でない本文は 400: ${notJson.status}`);

  const notString = await api(apiUrl, 'POST', '/posts?room=' + room, { name: 'テスト', text: 123 });
  assert(notString.status === 400, `文字列でない text は 400: ${notString.status}`);

  const exactly140 = await api(apiUrl, 'POST', '/posts?room=' + room, { name: 'テスト', text: 'あ'.repeat(139) + '🎉' });
  assert(exactly140.status === 201, `絵文字を含む 140 文字ちょうどは 201: ${JSON.stringify(exactly140)}`);
  assert(exactly140.json.likes === 0 && typeof exactly140.json.id === 'string' && !Number.isNaN(Date.parse(exactly140.json.createdAt)), `作った投稿は id, likes: 0, createdAt を持つ: ${JSON.stringify(exactly140.json)}`);

  const over140 = await api(apiUrl, 'POST', '/posts?room=' + room, { name: 'テスト', text: 'あ'.repeat(141) });
  assert(over140.status === 400 && over140.json.message.includes('140'), `141 文字は 400 で 140 に触れたメッセージ: ${JSON.stringify(over140)}`);

  const over20 = await api(apiUrl, 'POST', '/posts?room=' + room, { name: 'な'.repeat(21), text: 'こんにちは' });
  assert(over20.status === 400, `21 文字の名前は 400: ${over20.status}`);

  const trimmed = await api(apiUrl, 'POST', '/posts?room=' + room, { name: '  さぶろう  ', text: '  前後の空白  ' });
  assert(trimmed.status === 201 && trimmed.json.name === 'さぶろう' && trimmed.json.text === '前後の空白', `前後の空白を除いて保存する: ${JSON.stringify(trimmed.json)}`);

  const list = await api(apiUrl, 'GET', '/posts?room=' + room);
  const times = list.json.map((p) => Date.parse(p.createdAt));
  assert(list.json[0].id === trimmed.json.id && times.every((t, i) => i === 0 || times[i - 1] >= t), '一覧は createdAt の新しい順で、最後の投稿が先頭');

  const missingLike = await api(apiUrl, 'POST', '/posts/no-such-id/like?room=' + room);
  assert(missingLike.status === 404 && japanese.test(missingLike.json.message), `存在しない id へのいいねは 404: ${JSON.stringify(missingLike)}`);

  const liked = await api(apiUrl, 'POST', `/posts/${trimmed.json.id}/like?room=${room}`);
  assert(liked.status === 200 && liked.json.likes === 1, `いいねで likes が 1 になる: ${JSON.stringify(liked)}`);

  const otherRoom = await api(apiUrl, 'GET', '/posts?room=verify-other');
  assert(!otherRoom.json.some((p) => p.id === trimmed.json.id), '別の部屋には投稿が混ざらない');

  const unknownPath = await api(apiUrl, 'GET', '/nothing?room=' + room);
  assert(unknownPath.status === 404, `知らないパスは 404: ${unknownPath.status}`);

  const wrongMethod = await api(apiUrl, 'DELETE', '/posts?room=' + room);
  assert(wrongMethod.status === 405, `許可しないメソッドは 405: ${wrongMethod.status}`);

  const capRoom = 'verify-cap';
  for (let i = 0; i < 205; i++) await api(apiUrl, 'POST', '/posts?room=' + capRoom, { name: 'n', text: 't' + i });
  const capped = await api(apiUrl, 'GET', '/posts?room=' + capRoom);
  assert(capped.json.length === 200 && capped.json[0].text === 't204' && capped.json[199].text === 't5', `部屋あたり 200 件で古いものから捨てる: ${capped.json.length} 件`);
}

async function checkZip() {
  const fix = `。作り直すには: ${ZIP_REBUILD}`;
  const entries = execFileSync('unzip', ['-Z1', ZIP_PATH], { encoding: 'utf8' }).split('\n').filter((e) => e && !e.endsWith('/'));
  const outside = entries.filter((e) => !e.startsWith('mini-x/'));
  assert(outside.length === 0, `mini-x.zip に mini-x/ の外のファイルがある: ${outside.join(', ')}${fix}`);
  const zipFiles = entries.map((e) => e.slice('mini-x/'.length)).sort();
  const templateDir = join(ROOT, 'template');
  const templateFiles = (await readdir(templateDir, { recursive: true, withFileTypes: true }))
    .filter((d) => d.isFile() && d.name !== '.DS_Store')
    .map((d) => relative(templateDir, join(d.parentPath, d.name)))
    .sort();
  assert(JSON.stringify(zipFiles) === JSON.stringify(templateFiles), `mini-x.zip のファイル一覧 [${zipFiles.join(', ')}] が template/ の [${templateFiles.join(', ')}] と違う${fix}`);
  for (const file of templateFiles) {
    const zipped = execFileSync('unzip', ['-p', ZIP_PATH, 'mini-x/' + file]);
    assert(zipped.equals(await readFile(join(templateDir, file))), `mini-x.zip の mini-x/${file} が template/${file} と違う${fix}`);
  }
}

function parseSnapshots(markdown) {
  const snapshots = new Map();
  const pattern = /<!-- snapshot: (\S+) (\S+) -->\s*\n(`{3,})[^\n]*\n([\s\S]*?)\n\3/g;
  for (const [, stage, file, , code] of markdown.matchAll(pattern)) {
    if (!snapshots.has(stage)) snapshots.set(stage, {});
    snapshots.get(stage)[file] = code;
  }
  return snapshots;
}

async function readTemplate() {
  return {
    'index.html': await readFile(join(ROOT, 'template', 'index.html'), 'utf8'),
    'script.js': await readFile(join(ROOT, 'template', 'script.js'), 'utf8'),
  };
}

function assembleFromSnapshot(template, snapshot) {
  return {
    'index.html': snapshot.main === undefined ? template['index.html'] : template['index.html'].replace(MARKER, snapshot.main),
    'script.js': snapshot['script.js'] ?? template['script.js'],
  };
}

async function buildStageDir(dir, sourceDir, overrides, apiUrl, room) {
  await cp(join(ROOT, sourceDir), dir, { recursive: true, filter: (path) => basename(path) !== 'node_modules' });
  if (existsSync(join(dir, 'package.json'))) {
    try {
      execFileSync(findBun(), ['install', '--frozen-lockfile'], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
    } catch (err) {
      throw new Failure(`${sourceDir}/ の bun install --frozen-lockfile に失敗しました（react などをネットから取ってくるので、ネットにつながっているか確かめてください）: ${(err.stderr || err.message).trim()}`);
    }
  }
  for (const [file, content] of Object.entries(overrides)) await writeFile(join(dir, file), content);
  for (const file of ['script.js', 'script.ts', 'app.jsx', 'app.tsx']) {
    const scriptPath = join(dir, file);
    if (!existsSync(scriptPath)) continue;
    const script = (await readFile(scriptPath, 'utf8'))
      .replaceAll('http://localhost:8000', apiUrl)
      .replace(/const ROOM = '[^']*';/, `const ROOM = '${room}';`);
    await writeFile(scriptPath, script);
  }
  return dir;
}

function watchErrors(page, apiUrl, state) {
  page.on('console', (msg) => msg.type() === 'error' && state.errors.push('console: ' + msg.text()));
  page.on('pageerror', (err) => state.errors.push('pageerror: ' + err.message));
  page.on('response', (res) => res.status() >= 400 && state.errors.push(`${res.status()} ${res.url()}`));
  page.on('requestfailed', (req) => state.errors.push(`requestfailed ${req.url()}`));
  page.on('request', (req) => req.url().startsWith(apiUrl) && state.apiRequests.push(req.url()));
  page.on('websocket', (ws) => {
    state.websockets.push(ws.url());
    ws.on('socketerror', (err) => state.errors.push(`websocket ${ws.url()}: ${err}`));
  });
}

async function openPage(ctx) {
  const page = await ctx.context.newPage();
  watchErrors(page, ctx.apiUrl, ctx);
  await page.goto(ctx.pageUrl);
  await page.waitForLoadState('networkidle');
  return page;
}

const texts = (page) => page.locator('#timeline .post .text').allTextContents();

async function waitForFirstText(page, text, message) {
  await page.waitForFunction((t) => document.querySelector('#timeline .post .text')?.textContent === t, text, { timeout: 5000 })
    .catch(() => { throw new Failure(message); });
}

const CHECKS = {
  async columnsVisible({ page }) {
    assert(await page.locator('.sidebar-left').isVisible(), '幅 1280px で左のナビが見える');
    assert(await page.locator('.sidebar-right').isVisible(), '幅 1280px で右のサイドバーが見える');
    assert(await page.locator('.sidebar-left .nav-post-btn').isVisible(), '左のナビに「ポストする」ボタンがある');
  },
  async mainEmpty({ page }) {
    assert(await page.locator('main > *').count() === 0, 'template の main には要素がない');
  },
  async composeStructure({ page }) {
    for (const selector of ['#name-input', '#text-input', '#post-btn', '#timeline', 'template#post-template']) {
      assert(await page.locator(selector).count() === 1, `${selector} が 1 つある`);
    }
    const inTemplate = await page.evaluate(() => ['.post', '.avatar', '.name', '.text'].filter((s) => !document.querySelector('#post-template').content.querySelector(s)));
    assert(inTemplate.length === 0, `#post-template の中に ${inTemplate.join(', ')} がある`);
  },
  async timelineEmpty({ page }) {
    assert(await page.locator('#timeline > *').count() === 0, 'm0 のタイムラインは空');
  },
  async staticCards(ctx) {
    const cards = ctx.page.locator('#timeline .post');
    assert(await cards.count() >= 4, `配列から .post が 4 件以上並ぶ: ${await cards.count()} 件`);
    const names = await cards.locator('.name').allTextContents();
    const bodies = await cards.locator('.text').allTextContents();
    assert(names.every((s) => s.trim()) && bodies.every((s) => s.trim()), '各カードの .name と .text が空でない');
    assert(ctx.apiRequests.length === 0, `m1 は API を呼ばない: ${ctx.apiRequests.join(', ')}`);
  },
  async serverTimeline({ page }) {
    await page.waitForFunction(() => document.querySelectorAll('#timeline .post').length >= 3, null, { timeout: 5000 })
      .catch(() => { throw new Failure('サーバーのサンプル投稿 3 件がタイムラインに並ぶ'); });
    const names = await page.locator('#timeline .post .name').allTextContents();
    assert(JSON.stringify(names) === JSON.stringify(SAMPLE_NAMES_NEWEST_FIRST), `サンプル投稿が新しい順に並ぶ: ${names.join(', ')}`);
  },
  async avatarsLoaded({ page }) {
    const broken = await page.evaluate(() => [...document.querySelectorAll('img.avatar')].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.closest('.post, .compose, nav')?.className));
    assert(broken.length === 0, `すべての .avatar に icon.svg が表示される: 表示されていないのは ${broken.join(', ')}`);
  },
  async reloadShowsNew(ctx) {
    const text = 'API から直接 ' + Date.now();
    await api(ctx.apiUrl, 'POST', `/posts?room=verify-${ctx.stage}`, { name: 'けんさ', text });
    await ctx.page.click('#reload-btn');
    await waitForFirstText(ctx.page, text, '#reload-btn を押すと API へ直接 POST した投稿が先頭に出る');
  },
  async postFromForm(ctx) {
    const text = 'フォームから ' + Date.now();
    await ctx.page.fill('#name-input', 'がくせい');
    await ctx.page.fill('#text-input', text);
    await ctx.page.click('#post-btn');
    await waitForFirstText(ctx.page, text, '#post-btn で投稿すると先頭に出る');
    assert(await ctx.page.inputValue('#text-input') === '', '投稿後に #text-input が空になる');
    assert((await ctx.page.locator('#timeline .post .name').first().textContent()) === 'がくせい', '投稿の名前が #name-input の値になる');
    ctx.postedText = text;
  },
  async sharedAcrossContexts(ctx) {
    const other = await ctx.browser.newContext();
    try {
      const page = await other.newPage();
      watchErrors(page, ctx.apiUrl, ctx);
      await page.goto(ctx.pageUrl);
      await waitForFirstText(page, ctx.postedText, '別のブラウザで同じ部屋を開くと投稿が見える');
    } finally {
      await other.close();
    }
  },
  async likeIncrements(ctx) {
    const card = () => ctx.page.locator('#timeline .post').filter({ hasText: ctx.postedText });
    const before = Number(await card().locator('.like-count').textContent());
    assert(Number.isInteger(before), `.like-count に数が入っている: ${before}`);
    await card().locator('.like-btn').click();
    await ctx.page.waitForFunction(
      ({ text, expected }) => [...document.querySelectorAll('#timeline .post')].some((el) => el.querySelector('.text').textContent === text && el.querySelector('.like-count').textContent === String(expected)),
      { text: ctx.postedText, expected: before + 1 },
      { timeout: 5000 },
    ).catch(() => { throw new Failure('いいねボタンを押すとそのカードの .like-count が 1 増える'); });
    await ctx.page.reload();
    await ctx.page.waitForLoadState('networkidle');
    assert(Number(await card().locator('.like-count').textContent()) === before + 1, '再読み込み後もいいねの数が増えたまま');
  },
  async tooLongRejected(ctx) {
    const responsePromise = ctx.page.waitForResponse((res) => res.request().method() === 'POST' && res.url().startsWith(ctx.apiUrl + '/posts?'));
    await ctx.page.fill('#name-input', 'がくせい');
    await ctx.page.fill('#text-input', 'あ'.repeat(141));
    await ctx.page.click('#post-btn');
    const res = await responsePromise;
    const body = await res.json();
    assert(res.status() === 400 && body.message.includes('140文字'), `141 文字の本文は 400 と「140文字」を含むメッセージ: ${res.status()} ${JSON.stringify(body)}`);
    await ctx.page.waitForLoadState('networkidle');
    ctx.errors.length = 0;
  },
  async hotUpdate(ctx) {
    let reloads = 0;
    ctx.page.on('framenavigated', (frame) => frame === ctx.page.mainFrame() && reloads++);
    const file = `app.${ctx.stage}`;
    const entry = await readFile(join(ctx.dir, file), 'utf8');
    await writeFile(join(ctx.dir, file), entry.replace('<h1>ホーム</h1>', '<h1>ホーム（保存）</h1>'));
    await ctx.page.waitForFunction(() => document.querySelector('.header h1').textContent === 'ホーム（保存）', null, { timeout: 5000 })
      .catch(() => { throw new Failure(`${file} の <h1>ホーム</h1> を書き換えて保存すると画面に出る`); });
    assert(reloads === 0, `${file} を保存してもページを読み込み直さずに画面だけ変わる`);
    assert(await ctx.page.locator('#timeline .post').count() >= 3, '保存の後もタイムラインが残っている');
  },
  async hmrConnected(ctx) {
    assert(ctx.websockets.some((url) => url.endsWith('/_bun/hmr')), `ホットリロード用の /_bun/hmr に WebSocket がつながる: ${ctx.websockets.join(', ')}`);
  },
  async accentVariable({ page }) {
    const colors = () => page.evaluate(() => ({
      post: getComputedStyle(document.getElementById('post-btn')).backgroundColor,
      like: getComputedStyle(document.querySelector('.like-btn')).backgroundColor,
    }));
    const before = await colors();
    await page.evaluate(() => document.documentElement.style.setProperty('--accent', 'rgb(255, 0, 0)'));
    const after = await colors();
    assert(after.post === 'rgb(255, 0, 0)' && before.post !== after.post, `--accent を変えると #post-btn の背景色が変わる: ${before.post} -> ${after.post}`);
    assert(after.like === before.like, `--accent を変えても .like-btn の背景色は変わらない: ${before.like} -> ${after.like}`);
    await page.evaluate(() => document.documentElement.style.removeProperty('--accent'));
  },
  async appRenamed({ page }) {
    const wordmark = await page.locator('.wordmark').textContent();
    const title = await page.title();
    assert(wordmark === 'ミニタイムライン' && title === 'ミニタイムライン', `左上の名前とタブの名前が「ミニタイムライン」: ${wordmark} / ${title}`);
  },
  async composeWords({ page }) {
    const placeholder = await page.getAttribute('#text-input', 'placeholder');
    const label = await page.locator('#post-btn').textContent();
    assert(placeholder === '今日のひとことをどうぞ' && label === 'つぶやく', `投稿欄の言葉が変わっている: ${placeholder} / ${label}`);
  },
  async iconRecolored({ page }) {
    const completedIcon = await readFile(join(ROOT, 'completed', 'icon.svg'), 'utf8');
    const colors = await page.evaluate(async (svg) => {
      async function pick(img) {
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 40;
        const g = canvas.getContext('2d');
        g.drawImage(img, 0, 0, 40, 40);
        return { background: g.getImageData(2, 2, 1, 1).data.join(','), figure: g.getImageData(20, 16, 1, 1).data.join(',') };
      }
      const original = new Image();
      original.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      return { shown: await pick(document.querySelector('.compose .avatar')), original: await pick(original) };
    }, completedIcon);
    assert(colors.shown.background !== colors.original.background && colors.shown.figure !== colors.original.figure, `アイコンの背景と人型の色が completed と違う: ${JSON.stringify(colors)}`);
  },
  async cardLook({ page }) {
    const look = await page.evaluate(() => {
      const [first, second] = document.querySelectorAll('#timeline .post');
      const style = getComputedStyle(first);
      return { radius: style.borderTopLeftRadius, shadow: style.boxShadow, gap: second.getBoundingClientRect().top - first.getBoundingClientRect().bottom };
    });
    assert(look.radius !== '0px' && look.shadow !== 'none' && look.gap > 0, `.post に角の丸み・影・カードの間のすき間がある: ${JSON.stringify(look)}`);
  },
  async trendsRenamed({ page }) {
    const names = await page.locator('.sidebar-right .trend-name').allTextContents();
    assert(['#好きな食べ物', '#部活'].every((name) => names.includes(name)), `右のトレンドに自分の話題が出ている: ${names.join(', ')}`);
  },
  async squareCorners({ page }) {
    const corners = await page.evaluate(() => ['#timeline .avatar', '.compose .avatar', '#post-btn'].map((selector) => {
      const el = document.querySelector(selector);
      const { width, height } = el.getBoundingClientRect();
      const radius = getComputedStyle(el).borderTopLeftRadius;
      const px = radius.endsWith('%') ? parseFloat(radius) * width / 100 : parseFloat(radius);
      return { selector, px, half: Math.min(width, height) / 2 };
    }));
    assert(corners.every((c) => c.px < c.half), `アイコンと #post-btn が丸ではなく角丸の四角: ${JSON.stringify(corners)}`);
  },
  async charCount({ page }) {
    const count = () => page.evaluate(() => {
      const el = document.getElementById('count');
      return { text: el.textContent, color: getComputedStyle(el).color };
    });
    const initial = await count();
    assert(initial.text === '140', `最初は #count が 140: ${initial.text}`);
    await page.fill('#text-input', 'あいう');
    const typed = await count();
    assert(typed.text === '137', `3 文字入れると #count が 137: ${typed.text}`);
    await page.fill('#text-input', 'あ'.repeat(141));
    const over = await count();
    assert(over.text === '-1' && over.color === 'rgb(255, 0, 0)', `141 文字で #count が -1 の赤: ${JSON.stringify(over)}`);
    await postViaForm(page, 'がくせい', '文字数を数える');
    const reset = await count();
    assert(reset.text === '140' && reset.color !== 'rgb(255, 0, 0)', `ポスト後に #count が 140 に戻り赤でなくなる: ${JSON.stringify(reset)}`);
  },
  async postTime({ page }) {
    const cards = await page.locator('#timeline .post').count();
    const times = await page.locator('#timeline .post .time').allTextContents();
    assert(times.length === cards && times.every((t) => /\d:\d/.test(t)), `各カードの .time に時刻が入っている: ${times.join(', ')}`);
  },
  async ctrlEnterPosts(ctx) {
    const text = 'Ctrl+Enter で ' + Date.now();
    await ctx.page.fill('#name-input', 'がくせい');
    await ctx.page.fill('#text-input', text);
    await ctx.page.press('#text-input', 'Control+Enter');
    await waitForFirstText(ctx.page, text, '#text-input で Ctrl + Enter を押すと投稿が先頭に出る');
  },
  async autoRefresh(ctx) {
    const text = '自動更新 ' + Date.now();
    await api(ctx.apiUrl, 'POST', `/posts?room=verify-${ctx.stage}`, { name: 'けんさ', text });
    await waitForFirstText(ctx.page, text, 'ボタンを押さなくても API へ直接 POST した投稿が先頭に出る');
  },
  async realtime(ctx) {
    const text = 'SSE で ' + Date.now();
    const created = await api(ctx.apiUrl, 'POST', `/posts?room=verify-${ctx.stage}`, { name: 'けんさ', text });
    await waitForFirstText(ctx.page, text, 'ボタンもポーリングもなしに、API へ直接 POST した投稿が先頭に出る');
    await api(ctx.apiUrl, 'POST', `/posts/${created.json.id}/like?room=verify-${ctx.stage}`);
    await ctx.page.waitForFunction(() => document.querySelector('#timeline .post .like-count')?.textContent === '1', null, { timeout: 5000 })
      .catch(() => { throw new Failure('ボタンもポーリングもなしに、API へ直接押したいいねの数が画面に出る'); });
  },
  async initialAvatars({ page }) {
    const avatars = await page.evaluate(() => [...document.querySelectorAll('#timeline .post')].map((el) => ({
      name: el.querySelector('.name').textContent,
      initial: el.querySelector('.avatar').textContent,
      color: getComputedStyle(el.querySelector('.avatar')).backgroundColor,
    })));
    assert(avatars.every((a) => a.initial === a.name[0]), `各カードの .avatar に名前の頭文字が入る: ${JSON.stringify(avatars)}`);
    assert(new Set(avatars.map((a) => a.color)).size >= 2, `.avatar の背景色が人によって違う: ${JSON.stringify(avatars)}`);
  },
  async likedHeart({ page }) {
    const target = page.locator('#timeline .post').filter({ hasText: 'はなこ' });
    await target.locator('.like-btn').click();
    await target.locator('.like-btn.liked').waitFor({ timeout: 5000 })
      .catch(() => { throw new Failure('いいねを押したカードの .like-btn に liked が付く'); });
    await page.mouse.move(0, 0);
    const state = await page.evaluate(() => {
      const probe = document.body.appendChild(document.createElement('span'));
      probe.style.color = 'var(--like)';
      const like = getComputedStyle(probe).color;
      probe.remove();
      const buttons = [...document.querySelectorAll('#timeline .post')].map((el) => {
        const btn = el.querySelector('.like-btn');
        return { name: el.querySelector('.name').textContent, liked: btn.classList.contains('liked'), color: getComputedStyle(btn).color, heart: getComputedStyle(btn, '::before').backgroundColor };
      });
      return { like, buttons };
    });
    const pink = (b) => b.color === state.like && b.heart === state.like;
    assert(state.buttons.filter((b) => b.name === 'はなこ').every(pink), `いいねしたカードのハートと数が --like の色: ${JSON.stringify(state)}`);
    assert(state.buttons.filter((b) => b.name !== 'はなこ').every((b) => !b.liked && b.color !== state.like && b.heart !== state.like), `押していないカードは liked が付かず色も変わらない: ${JSON.stringify(state)}`);
  },
};

const M3_CHECKS = ['composeStructure', 'serverTimeline', 'reloadShowsNew', 'postFromForm', 'sharedAcrossContexts'];
const REACT_CHECKS = ['columnsVisible', 'serverTimeline', 'avatarsLoaded', 'reloadShowsNew', 'postFromForm', 'sharedAcrossContexts', 'likeIncrements', 'hotUpdate'];
const REACT_SERVER_CHECKS = ['serverTimeline', 'avatarsLoaded', 'postFromForm', 'likeIncrements'];
const STAGE_CHECKS = {
  template: ['columnsVisible', 'mainEmpty'],
  m0: ['columnsVisible', 'composeStructure', 'timelineEmpty'],
  m1: ['composeStructure', 'staticCards'],
  m2: ['composeStructure', 'serverTimeline', 'reloadShowsNew'],
  m3: M3_CHECKS,
  m4: [...M3_CHECKS, 'likeIncrements'],
  completed: ['columnsVisible', ...M3_CHECKS, 'likeIncrements', 'tooLongRejected', 'accentVariable'],
  'own-server': ['columnsVisible', 'hmrConnected', 'serverTimeline', 'postFromForm', 'likeIncrements'],
  jsx: REACT_CHECKS,
  'jsx-server': REACT_SERVER_CHECKS,
  tsx: REACT_CHECKS,
  'tsx-server': REACT_SERVER_CHECKS,
};
const ANSWER_CHECKS = {
  a1: ['appRenamed'],
  a2: ['composeWords', 'postFromForm'],
  a3: ['iconRecolored'],
  a4: ['serverTimeline', 'cardLook'],
  a5: ['trendsRenamed'],
  a6: ['serverTimeline', 'squareCorners'],
  b1: ['charCount'],
  b2: ['serverTimeline', 'postTime'],
  b3: ['ctrlEnterPosts'],
  b4: ['serverTimeline', 'autoRefresh'],
  b6: ['serverTimeline', 'postFromForm', 'likeIncrements'],
  b7: ['serverTimeline', 'initialAvatars'],
  b8: ['serverTimeline', 'likedHeart'],
  b9: ['serverTimeline', 'realtime'],
};
const SSE_LISTEN = "source.addEventListener('message', showPosts);";
const ANSWER_PATCHES = {
  // 10 秒待たずに済むよう間隔を縮め、SSE ではなくポーリングで届いたと言えるよう SSE を止める
  b4: [['setInterval(showPosts, 10000)', 'setInterval(showPosts, 1000)'], [SSE_LISTEN, '']],
  b9: [['setInterval(showPosts, 10000);', '']],
};
Object.assign(STAGE_CHECKS, ANSWER_CHECKS);
const ANSWER_DIRS = { b6: 'typescript' };

async function withStagePage({ bun, browser, apiUrl, stage, dir, serve = DEV_SERVER }, viewport, run) {
  const devServer = await startProcess(bun, serve.args, dir, serve.pattern, serve.env);
  const context = await browser.newContext({ viewport });
  const ctx = { browser, context, apiUrl, stage, dir, pageUrl: devServer.url + '/', errors: [], apiRequests: [], websockets: [] };
  try {
    ctx.page = await openPage(ctx);
    await run(ctx);
  } finally {
    await context.close();
    stopProcess(devServer.child);
  }
}

async function runStage(options) {
  await withStagePage(options, { width: 1280, height: 900 }, async (ctx) => {
    for (const name of STAGE_CHECKS[options.stage]) {
      await CHECKS[name](ctx);
      assert(ctx.errors.length === 0, `${name} の後にエラーが出ている: ${ctx.errors.join(' | ')}`);
    }
  });
}

async function runOwnServer(options, source, stage) {
  const ownPort = await freePort();
  const ownUrl = `http://localhost:${ownPort}`;
  const dir = await buildStageDir(join(options.workDir, stage), source, {}, ownUrl, `verify-${stage}`);
  const serve = { args: ['run', 'server.js'], pattern: SERVER_STARTED, env: { ...process.env, PORT: String(ownPort) } };
  await runStage({ ...options, apiUrl: ownUrl, stage, dir, serve });
}

async function postViaForm(page, name, text) {
  await page.fill('#name-input', name);
  await page.fill('#text-input', text);
  await page.click('#post-btn');
  await waitForFirstText(page, text, `撮影用に「${text}」をフォームから投稿できる`);
}

const SHOTS = {
  template: async () => {},
  m0: async () => {},
  m1: async () => {},
  m2: CHECKS.serverTimeline,
  async m3({ page }) {
    await postViaForm(page, 'さぶろう', 'はじめてポストしてみた！');
  },
  async completed({ page, apiUrl, stage }) {
    await api(apiUrl, 'POST', `/posts?room=shot-${stage}`, { name: 'けんた', text: 'fetch って思ったよりかんたんだった' });
    await api(apiUrl, 'POST', `/posts?room=shot-${stage}`, { name: 'さくら', text: 'いいね押してね〜 🌸' });
    await postViaForm(page, 'さぶろう', 'はじめてポストしてみた！');
    const sakura = page.locator('#timeline .post').filter({ hasText: 'さくら' });
    for (const expected of ['1', '2']) {
      await sakura.locator('.like-btn').click();
      await sakura.locator('.like-count').filter({ hasText: new RegExp(`^${expected}$`) }).waitFor({ timeout: 5000 })
        .catch(() => { throw new Failure(`撮影用にさくらのいいねを ${expected} にできる`); });
    }
    await page.mouse.move(0, 0);
  },
};

async function shootStage(options) {
  await withStagePage(options, { width: 1280, height: 800 }, async (ctx) => {
    await SHOTS[options.stage](ctx);
    assert(ctx.errors.length === 0, `${options.stage} の撮影中にエラーが出ている: ${ctx.errors.join(' | ')}`);
    await ctx.page.screenshot({ path: join(SCREENSHOT_DIR, `${options.stage}.png`) });
  });
}

const PARTS = [
  { selector: '.header', label: '① ヘッダー', color: '#0072b2' },
  { selector: '.compose', label: '② 投稿欄', color: '#a8327f' },
  { selector: '#timeline .post', label: '③ 投稿カード', sub: 'ポスト 1 件分', color: '#d55e00' },
  { selector: '#timeline', label: '④ タイムライン', sub: 'カードを縦に並べた入れ物', color: '#007a56', bracket: true },
];

function drawParts(parts) {
  const add = (style, text = '') => {
    const el = document.createElement('div');
    el.textContent = text;
    Object.assign(el.style, { position: 'absolute', zIndex: 10, boxSizing: 'border-box', ...style });
    return document.body.appendChild(el);
  };
  for (const selector of ['.sidebar-left', '.sidebar-right']) document.querySelector(selector).style.visibility = 'hidden';
  const main = document.querySelector('main').getBoundingClientRect();
  const labelX = main.right + 28;
  const bracketX = main.right + 228;
  let right = 0;
  for (const { selector, label, sub, color, bracket } of parts) {
    const r = document.querySelector(selector).getBoundingClientRect();
    const cy = r.top + r.height / 2;
    let x = labelX;
    if (bracket) {
      add({ left: `${bracketX}px`, top: `${r.top + 3}px`, width: '18px', height: `${r.height - 6}px`, border: `5px solid ${color}`, borderLeft: 'none' });
      add({ left: `${bracketX + 18}px`, top: `${cy - 2.5}px`, width: '12px', height: '5px', background: color });
      x = bracketX + 40;
    } else {
      add({ left: `${r.left + 3}px`, top: `${r.top + 3}px`, width: `${r.width - 6}px`, height: `${r.height - 6}px`, border: `4px solid ${color}`, borderRadius: '10px' });
      add({ left: `${r.right - 3}px`, top: `${cy - 2}px`, width: `${labelX - 8 - r.right + 3}px`, height: '4px', background: color });
    }
    const el = add({ left: `${x}px`, top: `${cy}px`, transform: 'translateY(-50%)', color, fontSize: '26px', fontWeight: 800, lineHeight: 1.3, whiteSpace: 'nowrap' }, label);
    if (sub) Object.assign(el.appendChild(document.createElement('div')), { textContent: sub }).style.cssText = 'font-size: 17px; font-weight: 600';
    right = Math.max(right, el.getBoundingClientRect().right);
  }
  const timeline = document.querySelector('#timeline').getBoundingClientRect();
  return { x: main.left - 16, y: 0, width: right + 24 - (main.left - 16), height: timeline.bottom + 16 };
}

async function shootParts(options) {
  await withStagePage(options, { width: 1600, height: 900 }, async ({ page, errors }) => {
    await postViaForm(page, 'さぶろう', 'はじめてポストしてみた！');
    await page.mouse.move(0, 0);
    const clip = await page.evaluate(drawParts, PARTS);
    assert(errors.length === 0, `parts の撮影中にエラーが出ている: ${errors.join(' | ')}`);
    await page.screenshot({ path: join(SCREENSHOT_DIR, 'parts.png'), clip });
  });
}

const normalize = (s) => s.replace(/\s+/g, '');
const stripComments = (s) => s.replace(/^[ \t]*<!--.*?-->[ \t]*\n/gm, '').replace(/^[ \t]*\/\/.*\n/gm, '');

function parseAnswerBlocks(markdown) {
  const pattern = /<!-- answer: (\S+) (\S+) -->\s*\n(`{3,})[^\n]*\n([\s\S]*?)\n\3/g;
  return [...markdown.matchAll(pattern)].map(([, dir, file, , code]) => ({ dir, file, code }));
}

async function checkFollowsCompleted() {
  const completed = (file) => readFile(join(ROOT, 'completed', file), 'utf8');
  const read = (dir, file) => readFile(join(ROOT, dir, file), 'utf8');
  for (const dir of ['template', 'advanced', 'typescript', 'jsx', 'tsx']) {
    assert(await read(dir, '.vscode/settings.json') === await completed('.vscode/settings.json'), `${dir}/.vscode/settings.json が completed/.vscode/settings.json と同じ`);
  }
  for (const dir of ['advanced', 'typescript', 'jsx', 'tsx']) {
    assert(await read(dir, 'server.js') === await completed('server.js'), `${dir}/server.js が completed/server.js と同じ`);
  }
  assert((await read('advanced', 'styles.css')).startsWith(await completed('styles.css')), 'advanced/styles.css は completed/styles.css の後ろに足しただけ');
  for (const dir of ['typescript', 'jsx', 'tsx']) {
    for (const file of ['styles.css', 'icon.svg']) {
      assert(await read(dir, file) === await completed(file), `${dir}/${file} が completed/${file} と同じ`);
    }
  }
  assert(!existsSync(join(ROOT, 'typescript', 'script.js')), 'typescript/ に script.js が残っていない');
  assert((await read('typescript', 'index.html')).replace('src="script.ts"', 'src="script.js"') === stripComments(await completed('index.html')), 'typescript/index.html は completed/index.html の src を script.ts にしただけ');
  const functionNames = (code) => [...code.matchAll(/^(?:async )?function (\w+)/gm)].map((m) => m[1]).join(', ');
  const strings = (code) => code.match(/'[^']*'/g).join(' ');
  const ts = stripComments(await read('typescript', 'script.ts'));
  const js = stripComments(await completed('script.js'));
  assert(functionNames(ts) === functionNames(js), `typescript/script.ts の関数 [${functionNames(ts)}] が completed/script.js の [${functionNames(js)}] と同じ並び`);
  assert(strings(ts) === strings(js), `typescript/script.ts の文字列 [${strings(ts)}] が completed/script.js の [${strings(js)}] と同じ並び`);
}

function typeErrors(bun, dir) {
  try {
    execFileSync(bun, ['x', '-p', TYPESCRIPT, 'tsc', '--noEmit', '-p', dir], { encoding: 'utf8', stdio: 'pipe' });
    return '';
  } catch (err) {
    if (/error TS\d+/.test(err.stdout)) return err.stdout.trim();
    throw new Failure(`bun x で ${TYPESCRIPT} の tsc を動かせません（初回はネットから取ってきます）: ${(err.stderr || err.message).trim()}`);
  }
}

async function checkTypescriptTypes(bun, workDir) {
  const errors = typeErrors(bun, join(ROOT, 'typescript'));
  assert(errors === '', `typescript/ に型エラーがある: ${errors}`);
  const dir = join(workDir, 'typescript-types');
  await cp(join(ROOT, 'typescript'), dir, { recursive: true });
  const script = await readFile(join(dir, 'script.ts'), 'utf8');
  assert(script.includes('addLike(post.id);'), 'typescript/script.ts に addLike(post.id); がある');
  await writeFile(join(dir, 'script.ts'), script.replace('addLike(post.id);', 'addLike(123);'));
  assert(/error TS2345/.test(typeErrors(bun, dir)), 'addLike(123) と書くと tsc が型エラー TS2345 を出す');
}

async function main() {
  const shoot = process.argv.includes('--screenshots');
  const bun = findBun();
  if (!bun) {
    console.error('FAIL setup: Bun が見つかりません。curl -fsSL https://bun.com/install | bash で入れてください');
    process.exit(1);
  }

  let current = 'setup';
  const workDir = await mkdtemp(join(tmpdir(), 'mini-x-verify-'));
  let browser;
  try {
    const apiServer = await startProcess(bun, ['run', 'server.js'], join(ROOT, 'completed'), SERVER_STARTED, { ...process.env, PORT: '0' });
    const apiUrl = apiServer.url;

    current = 'server';
    await checkServer(apiUrl);
    console.log('ok server');

    current = 'events';
    await checkEvents(apiUrl);
    const idleSince = Date.now();
    const idleEvents = await openEvents(apiUrl, 'verify-sse-idle');
    console.log('ok events');

    current = 'zip';
    await checkZip();
    console.log('ok zip');

    browser = await chromium.launch();
    if (shoot) await mkdir(SCREENSHOT_DIR, { recursive: true });
    const template = await readTemplate();
    const docsPath = join(ROOT, 'DOCS.md');
    const docs = existsSync(docsPath) ? await readFile(docsPath, 'utf8') : '';
    const snapshots = parseSnapshots(docs);

    const stages = [
      { stage: 'template', source: 'template', overrides: {} },
      ...DOCS_STAGES.map((stage) => ({ stage, source: 'template', snapshot: snapshots.get(stage) })),
      { stage: 'completed', source: 'completed', overrides: {} },
    ];
    for (const { stage, source, overrides, snapshot } of stages) {
      current = stage;
      if (overrides === undefined && snapshot === undefined) {
        console.log(`skip ${stage} (DOCS.md にスナップショットがありません)`);
        continue;
      }
      const files = overrides ?? assembleFromSnapshot(template, snapshot);
      const dir = await buildStageDir(join(workDir, stage), source, files, apiUrl, `verify-${stage}`);
      await runStage({ bun, browser, apiUrl, stage, dir });
      console.log(`ok ${stage}`);
      if (shoot && SHOTS[stage]) {
        const shotDir = await buildStageDir(join(workDir, `shot-${stage}`), source, files, apiUrl, `shot-${stage}`);
        await shootStage({ bun, browser, apiUrl, stage, dir: shotDir });
        console.log(`shot ${stage}`);
      }
      if (shoot && stage === 'completed') {
        const partsDir = await buildStageDir(join(workDir, 'shot-parts'), source, files, apiUrl, 'shot-parts');
        await shootParts({ bun, browser, apiUrl, stage, dir: partsDir });
        console.log('shot parts');
      }
    }

    const m4 = snapshots.get('m4');
    if (m4) {
      current = 'm4-matches-completed';
      const assembled = assembleFromSnapshot(template, m4);
      for (const file of ['index.html', 'script.js']) {
        const completed = await readFile(join(ROOT, 'completed', file), 'utf8');
        assert(normalize(stripComments(assembled[file])) === normalize(stripComments(completed)), `DOCS.md の m4 から組み立てた ${file} が completed/${file} と一致する`);
      }
      console.log('ok m4-matches-completed');
    }

    current = 'own-server';
    await runOwnServer({ bun, browser, workDir }, 'completed', 'own-server');
    console.log('ok own-server');

    current = 'follows-completed';
    await checkFollowsCompleted();
    console.log('ok follows-completed');

    current = 'typescript-types';
    await checkTypescriptTypes(bun, workDir);
    console.log('ok typescript-types');

    for (const source of ['jsx', 'tsx']) {
      current = source;
      const dir = await buildStageDir(join(workDir, source), source, {}, apiUrl, `verify-${source}`);
      await runStage({ bun, browser, apiUrl, stage: source, dir });
      console.log(`ok ${source}`);

      current = `${source}-server`;
      await runOwnServer({ bun, browser, workDir }, source, current);
      console.log(`ok ${current}`);
    }

    current = 'tsx-types';
    const tsxErrors = typeErrors(bun, join(workDir, 'tsx'));
    assert(tsxErrors === '', `tsx/ に型エラーがある: ${tsxErrors}`);
    console.log('ok tsx-types');

    for (const [id, checks] of Object.entries(ANSWER_CHECKS)) {
      current = id;
      const source = ANSWER_DIRS[id] ?? 'advanced';
      const dir = await buildStageDir(join(workDir, id), source, {}, apiUrl, `verify-${id}`);
      for (const [from, to] of ANSWER_PATCHES[id] ?? []) {
        const script = await readFile(join(dir, 'script.js'), 'utf8');
        assert(script.includes(from), `${source}/script.js に ${from} がある`);
        await writeFile(join(dir, 'script.js'), script.replace(from, to));
      }
      await runStage({ bun, browser, apiUrl, stage: id, dir });
      console.log(`ok ${id}`);
    }

    current = 'events-idle';
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, idleSince + 11_000 - Date.now())));
    await api(apiUrl, 'POST', '/posts?room=verify-sse-idle', { name: 'テスト', text: '静かな接続' });
    assert(await idleEvents.next(3000) !== null, 'Bun.serve の idleTimeout（10 秒）より長く黙っていた /posts/events にも知らせが届く');
    idleEvents.close();
    console.log('ok events-idle');

    current = 'answers-in-docs';
    const blocks = parseAnswerBlocks(docs);
    const markers = docs.match(/<!-- answer:/g)?.length ?? 0;
    assert(markers === blocks.length, `DOCS.md の answer の目印 ${markers} 個のうち、直後にコードブロックがあるのは ${blocks.length} 個`);
    for (const { dir, file, code } of blocks) {
      const path = join(ROOT, dir, file);
      assert(existsSync(path), `DOCS.md の answer: ${dir} ${file} が指す ${dir}/${file} がある`);
      assert(normalize(await readFile(path, 'utf8')).includes(normalize(code)), `DOCS.md の answer: ${dir} ${file} のコードが ${dir}/${file} に含まれている`);
    }
    console.log(blocks.length === 0 ? 'skip answers-in-docs' : 'ok answers-in-docs');
  } catch (err) {
    console.error(`FAIL ${current}: ${err instanceof Failure ? err.message : err.stack ?? err}`.replace(/\n/g, ' '));
    process.exitCode = 1;
  } finally {
    await browser?.close();
    stopAll();
    await rm(workDir, { recursive: true, force: true });
  }
}

process.on('SIGINT', () => {
  stopAll();
  process.exit(130);
});

await main();
