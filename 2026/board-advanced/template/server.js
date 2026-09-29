// みんなの掲示板サーバー
//
// public/ の中身をブラウザに配信する + 投稿を保存・取得する

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = 3000;
const MAX_POSTS = 500;

// 投稿の置き場。再起動すると空に戻る。
const posts = [];

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // 投稿を全部返す
  if (req.method === 'GET' && url.pathname === '/posts') {
    sendJson(res, posts);
    return;
  }

  // ▼ 4章: ここに GET /events を足す

  // 投稿を 1 件受け取る
  if (req.method === 'POST' && url.pathname === '/posts') {
    const post = await readPost(req);
    posts.push(post);
    if (posts.length > MAX_POSTS) posts.shift();

    // ▼ 4章: つながっているブラウザに届ける

    sendJson(res, post);
    return;
  }

  // どれにも当てはまらなければ public/ の中のファイルを返す
  sendFile(url.pathname, res);
});

server.listen(PORT);
console.log(`http://localhost:${PORT} で待っています`);

// 送られてきた JSON を投稿の形に整える
function readPost(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      const body = JSON.parse(raw);
      resolve({
        name: String(body.name || '名無し').slice(0, 20),
        text: String(body.text || '').slice(0, 200),
        createdAt: new Date().toISOString(),
      });
    });
  });
}

function sendJson(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

const TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
};

// public/ の中のファイルをそのまま返す
async function sendFile(pathname, res) {
  const name = pathname === '/' ? '/index.html' : pathname;
  try {
    const body = await readFile(join('public', normalize(name)));
    const type = TYPES[extname(name)] || 'text/plain';
    res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
}
