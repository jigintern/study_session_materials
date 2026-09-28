/*
 * slide.md をライブプレビューしながら、rehearsal.html で目次と所要時間を見る。
 *
 *   pnpm rehearsal <slide.md> [--port 8000]
 *
 * marp の watch で <name>.preview.html を書き出し、rehearsal.html と一緒にローカルの HTTP サーバーで配る。
 * md を保存すると iframe の中のスライドだけが再読み込みされ、表示中のページと計測はそのまま残る。
 */
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { port: { type: 'string', default: '8000' } },
});
if (positionals.length !== 1) {
  console.error('usage: pnpm rehearsal <slide.md> [--port 8000]');
  process.exit(2);
}

// pnpm run はパッケージのルートで実行するので、呼び出した場所は INIT_CWD から取る
const target = resolve(process.env.INIT_CWD ?? process.cwd(), positionals[0]);
if (!existsSync(target)) {
  console.error('見つからない: ' + target);
  process.exit(1);
}

// 別の worktree の slide.md を渡されたときも、その worktree の engine.mjs と画像を使う
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: dirname(target), encoding: 'utf8' }).trim();
const out = join(dirname(target), basename(target, '.md') + '.preview.html');
// rehearsal.html はスライドではなくこの道具の一部なので、target ではなくこのスクリプトの側から読む
const rehearsal = fileURLToPath(new URL('../../rehearsal.html', import.meta.url));

// 前回の出力が残っていると、初回変換の前に古い版を開いてしまう
rmSync(out, { force: true });

const marp = spawn(
  join(root, 'node_modules/.bin/marp'),
  ['--html', '--engine', join(root, 'engine.mjs'), '--allow-local-files', '--watch', target, '-o', out],
  { cwd: root, stdio: 'inherit' }
);
marp.on('exit', (code) => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => marp.kill(signal));

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
};

// 画像を ../ で参照している教材もあるので、配る範囲はリポジトリのルートにする
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const path = pathname === '/rehearsal.html' ? rehearsal : resolve(root, '.' + pathname);
  const inScope = path === rehearsal || path.startsWith(root + sep);
  if (!inScope || !existsSync(path) || !statSync(path).isFile()) {
    res.writeHead(404).end();
    return;
  }
  res.setHeader('Content-Type', types[extname(path).toLowerCase()] ?? 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  res.end(readFileSync(path));
});

// marp の初回変換が終わる前に開くと 404 になるので、書き出されるまで待つ
const waitAndOpen = (url, tries = 120) => {
  if (existsSync(out)) spawn('open', [url], { stdio: 'ignore' }).on('error', () => {});
  else if (tries > 0) setTimeout(() => waitAndOpen(url, tries - 1), 250);
};

server.listen(Number(values.port), '127.0.0.1', () => {
  const deck = relative(root, out).split(sep).map(encodeURIComponent).join('/');
  const url = `http://localhost:${values.port}/rehearsal.html?deck=${deck}`;
  console.log('リハーサル: ' + url);
  console.log('止めるときは Ctrl+C');
  if (process.platform === 'darwin') waitAndOpen(url);
});
