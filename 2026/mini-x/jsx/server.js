// ミニX のサーバー。部屋ごとにポストを覚えておき、一覧を返したり、ポストやいいねを保存したりする
// 起動方法：このファイルのあるフォルダで bun run server.js を実行し、http://localhost:8000/ を開く

// 同じフォルダの index.html を読み込み、/ を開いたときの画面として配る
import index from './index.html';

// 名前と本文の長さ、1 つの部屋に残すポストの数、部屋の名前に使える文字の決まり
const MAX_NAME_LENGTH = 20;
const MAX_TEXT_LENGTH = 140;
const MAX_POSTS_PER_ROOM = 200;
const ROOM_PATTERN = /^[A-Za-z0-9-]{1,32}$/;

// 新しい部屋ができたときに、はじめから入れておくポスト
const SAMPLE_POSTS = [
  { name: 'たろう', text: 'はじめまして！' },
  { name: 'はなこ', text: 'こんにちは〜' },
  { name: 'じろう', text: 'ミニX できた 🎉' },
];

// ほかの URL で開いた画面（bun run index.html）からの頼みごとにも答えてよい、とブラウザに伝える印（CORS）
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// rooms は部屋の名前ごとのポストの配列。listeners は部屋ごとの、SSE の知らせを待っている接続
// GET のたびに並べ替えずに済むよう、各部屋の配列は新しい順に持つ
const rooms = new Map();
const listeners = new Map();

// ポスト 1 件分のオブジェクトを作る。id には、ほかと重ならない文字を自動で付ける
function newPost(name, text, createdAt) {
  return {
    id: crypto.randomUUID(),
    name: name,
    text: text,
    likes: 0,
    createdAt: createdAt.toISOString(),
  };
}

// SAMPLE_POSTS から、1 分ずつ前に書いたことにしたポストを、新しい順に作る
function createSamplePosts() {
  const posts = [];
  const now = Date.now();
  for (let i = 0; i < SAMPLE_POSTS.length; i++) {
    const minutesAgo = SAMPLE_POSTS.length - i;
    const createdAt = new Date(now - minutesAgo * 60 * 1000);
    posts.unshift(newPost(SAMPLE_POSTS[i].name, SAMPLE_POSTS[i].text, createdAt));
  }
  return posts;
}

// その部屋のポストの配列を返す。はじめての部屋なら、サンプルのポストを入れて作る
function postsOf(room) {
  if (!rooms.has(room)) {
    rooms.set(room, createSamplePosts());
  }
  return rooms.get(room);
}

// その部屋で知らせを待っている画面に、ポストが変わったことを SSE で知らせる
function notify(room) {
  if (!listeners.has(room)) {
    return;
  }
  for (const controller of listeners.get(room)) {
    controller.enqueue('data: changed\n\n');
  }
}

// オブジェクトを JSON の文字にして返事を作る。status は 200（うまくいった）や 400（頼み方がおかしい）などの番号
function jsonResponse(status, body) {
  const res = new Response(JSON.stringify(body), { status: status, headers: CORS_HEADERS });
  res.headers.set('Content-Type', 'application/json; charset=utf-8');
  return res;
}

// うまくいかなかったときの返事。何がだめだったかを message に入れて返す
function errorResponse(status, message) {
  return jsonResponse(status, { message: message });
}

// 部屋の名前を確かめる。だめなら理由の文を、よければ null を返す
function checkRoom(room) {
  if (!room) {
    return 'room を指定してください（例: /posts?room=sample）';
  }
  if (!ROOM_PATTERN.test(room)) {
    return 'room は英数字とハイフンで1〜32文字にしてください';
  }
  return null;
}

// 送られてきたポストの名前と本文を確かめる。だめなら理由の文を、よければ null を返す
function checkPostBody(body) {
  if (typeof body !== 'object' || body === null || typeof body.name !== 'string' || typeof body.text !== 'string') {
    return 'name と text を文字列で送ってください（例: {"name": "たろう", "text": "こんにちは"}）';
  }
  const name = body.name.trim();
  const text = body.text.trim();
  if (name === '') {
    return '名前を入れてください';
  }
  if (text === '') {
    return '本文を入れてください';
  }
  // string.length は UTF-16 単位で絵文字を 2 文字と数えるので、コードポイントで数える
  if (Array.from(name).length > MAX_NAME_LENGTH) {
    return '名前は' + MAX_NAME_LENGTH + '文字までです';
  }
  if (Array.from(text).length > MAX_TEXT_LENGTH) {
    return '本文は' + MAX_TEXT_LENGTH + '文字までです';
  }
  return null;
}

// GET /posts?room=部屋の名前：その部屋のポストの一覧を、新しい順に返す
function getPosts(req) {
  const room = new URL(req.url).searchParams.get('room');
  const roomError = checkRoom(room);
  if (roomError) {
    return errorResponse(400, roomError);
  }
  return jsonResponse(200, postsOf(room));
}

// POST /posts?room=部屋の名前：送られてきたポストを保存して、保存したポストを返す
async function createPost(req) {
  // 1. 部屋の名前を確かめる
  const room = new URL(req.url).searchParams.get('room');
  const roomError = checkRoom(room);
  if (roomError) {
    return errorResponse(400, roomError);
  }

  // 2. 送られてきた中身を JSON として読む。読めなければ 400 で返す
  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, '送るデータを JSON の文字にしてください（JSON.stringify を使います）');
  }
  // 3. 名前と本文が入っているか、長すぎないかを確かめる
  const bodyError = checkPostBody(body);
  if (bodyError) {
    return errorResponse(400, bodyError);
  }

  // 4. 新しいポストを作って配列の先頭に入れる。多すぎたら、いちばん古いポストを消す
  const posts = postsOf(room);
  const post = newPost(body.name.trim(), body.text.trim(), new Date());
  posts.unshift(post);
  if (posts.length > MAX_POSTS_PER_ROOM) {
    posts.pop();
  }
  // 5. 同じ部屋の画面に SSE で知らせ、作ったポストを 201（作った）で返す
  notify(room);
  return jsonResponse(201, post);
}

// POST /posts/:id/like?room=部屋の名前：その id のポストのいいねを 1 増やして返す
function likePost(req) {
  const room = new URL(req.url).searchParams.get('room');
  const roomError = checkRoom(room);
  if (roomError) {
    return errorResponse(400, roomError);
  }

  // URL の :id の部分は req.params.id に入っている。同じ id のポストを探す
  for (const post of postsOf(room)) {
    if (post.id === req.params.id) {
      post.likes += 1;
      notify(room);
      return jsonResponse(200, post);
    }
  }
  return errorResponse(404, 'その id の投稿は見つかりません');
}

// GET /posts/events?room=部屋の名前：接続をつないだままにして、ポストが変わるたびに知らせる（SSE）
function getEvents(req, server) {
  const room = new URL(req.url).searchParams.get('room');
  const roomError = checkRoom(room);
  if (roomError) {
    return errorResponse(400, roomError);
  }
  if (!listeners.has(room)) {
    listeners.set(room, new Set());
  }
  const controllers = listeners.get(room);

  // 知らせのない間が idleTimeout（10 秒）を超えると Bun.serve が接続を切るので、この接続だけ止める
  server.timeout(req, 0);
  // つないでいるあいだは listeners に入れておき、画面が閉じられたら取り除く
  let me;
  const stream = new ReadableStream({
    start(controller) {
      me = controller;
      controllers.add(controller);
      controller.enqueue(': connected\n\n');
    },
    cancel() {
      controllers.delete(me);
      if (controllers.size === 0) {
        listeners.delete(room);
      }
    },
  });

  // text/event-stream という種類の返事にすると、ブラウザは EventSource で受け取れる
  const res = new Response(stream, { headers: CORS_HEADERS });
  res.headers.set('Content-Type', 'text/event-stream');
  res.headers.set('Cache-Control', 'no-cache');
  return res;
}

// ブラウザが POST の前に「送ってもいいか」を OPTIONS で聞いてくるので、いいよと返す
function preflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// URL は合っているが、頼み方（GET や POST）が違うときの返事
function methodNotAllowed(methods) {
  const res = errorResponse(405, 'この URL には ' + methods + ' で送ってください');
  res.headers.set('Allow', methods + ', OPTIONS');
  return res;
}

// /posts/なにか/like の形の URL かどうかを確かめる
function isLikePath(pathname) {
  const parts = pathname.split('/');
  return parts.length === 4 && parts[1] === 'posts' && parts[2] !== '' && parts[3] === 'like';
}

// routes のどれにも当てはまらない頼みごとに答える
// routes に無いメソッドもここに来るので、パスが合っていれば 404 ではなく 405 を返す
function notFound(req) {
  const pathname = new URL(req.url).pathname;
  if (pathname === '/posts') {
    return methodNotAllowed('GET, POST');
  }
  if (pathname === '/posts/events') {
    return methodNotAllowed('GET');
  }
  if (isLikePath(pathname)) {
    return methodNotAllowed('POST');
  }
  return errorResponse(404, pathname + ' という URL はありません。/posts を使ってください');
}

// サーバーを立てる。PORT を決めていなければ 8000 番で待つ
const server = Bun.serve({
  port: Number(process.env.PORT || 8000),
  development: true,
  // URL と頼み方（GET や POST）ごとに、どの関数で答えるかの表
  routes: {
    // / を開くと、ミニX の画面（index.html）を配る
    '/': index,
    '/posts': {
      GET: getPosts,
      POST: createPost,
      OPTIONS: preflight,
    },
    '/posts/events': {
      GET: getEvents,
    },
    '/posts/:id/like': {
      POST: likePost,
      OPTIONS: preflight,
    },
  },
  // 表にない URL や頼み方は notFound で答える
  fetch: notFound,
});

console.log('ミニX を ' + server.url + ' で起動しました');
