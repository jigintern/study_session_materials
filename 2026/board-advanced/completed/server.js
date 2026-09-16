// みんなの掲示板サーバー (完成形)
//
// public/ の中身をブラウザに配りながら、投稿の保存と取り出しと配信を引き受ける。
// 保存すると node --watch が自動で再起動する。

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = 3000;
const MAX_POSTS = 500;

// 投稿の置き場。再起動すると空に戻る。
const posts = [];

// いまつながっている接続。つながった順に並ぶ。
const connections = [];

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // 投稿を全部返す
  if (req.method === 'GET' && url.pathname === '/posts') {
    sendJson(res, posts);
    return;
  }

  // つなぎっぱなしにして、投稿が来たら流す
  if (req.method === 'GET' && url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    connections.push(res);
    console.log(`接続数: ${connections.length}`);

    req.on('close', () => {
      connections.splice(connections.indexOf(res), 1);
      console.log(`接続数: ${connections.length}`);
    });
    return;
  }

  // 投稿を 1 件受け取る
  if (req.method === 'POST' && url.pathname === '/posts') {
    const post = await readPost(req);
    posts.push(post);
    if (posts.length > MAX_POSTS) posts.shift();

    for (const connection of connections) {
      connection.write(`data: ${JSON.stringify(post)}\n\n`);
    }

    sendJson(res, post);
    return;
  }

  // どれにも当てはまらなければ public/ の中のファイルを返す
  sendFile(url.pathname, res);
});

server.listen(PORT);
console.log(`http://localhost:${PORT} で待っています`);

// 送られてきた JSON を、投稿の形に整える
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
