// ミニX（2026年11月 高専訪問勉強会）の、講師が立てるサーバー。
// completed/server.js（Bun）と同じ API を、Deno Deploy で動くように Deno KV へ載せ替えたもの。

import { monotonicUlid } from "@std/ulid";

const MAX_NAME_LENGTH = 20;
const MAX_TEXT_LENGTH = 140;
export const MAX_POSTS_PER_ROOM = 200;
const ROOM_PATTERN = /^[A-Za-z0-9-]{1,32}$/;

const SAMPLE_POSTS = [
  { name: "たろう", text: "はじめまして！" },
  { name: "はなこ", text: "こんにちは〜" },
  { name: "じろう", text: "ミニX できた 🎉" },
];

/**
 * SSE の接続に何も流れない時間が続くと Deno Deploy が isolate を停止するので、
 * この間隔でコメント行を送って接続を保つ。
 */
const HEARTBEAT_INTERVAL_MS = 15_000;

/**
 * 書き込みを伴う POST を、送信元の IP ごとに毎秒この回数までに抑える。
 * 教室は NAT で全員が同じ IP になりがちなので、1 人分ではなく教室全体の分として決める。
 */
const POST_RATE_PER_SEC = 10;
const POST_BURST = 20;
/** IP の数え分けをすり抜けられても、書き込みがこの回数を超えないようにする */
const TOTAL_POST_RATE_PER_SEC = 20;
const TOTAL_POST_BURST = 40;
const MAX_TRACKED_SOURCES = 10_000;

export type Post = {
  id: string;
  name: string;
  text: string;
  likes: number;
  createdAt: string;
};

// テストでは KV_PATH=":memory:" を渡して、ファイルを作らずに動かす
const kv = await Deno.openKv(Deno.env.get("KV_PATH"));

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function errorResponse(status: number, message: string): Response {
  return json(status, { message });
}

function roomPrefix(room: string): Deno.KvKey {
  return ["posts", room];
}

function postKey(room: string, id: string): Deno.KvKey {
  return [...roomPrefix(room), id];
}

/** サンプルを入れ終えた部屋に置く印。値は使わない */
function roomKey(room: string): Deno.KvKey {
  return ["rooms", room];
}

/**
 * ポストかいいねが変わるたびに書き換える場所。SSE はここを監視する。
 * kv.watch は途中の値を飛ばして最新の値だけを流すが、知らせるのは
 * 「変わった」ことだけなので、飛ばされても困らない。
 */
function changedKey(room: string): Deno.KvKey {
  return ["changed", room];
}

/**
 * id は辞書順がそのまま作った順になる。kv.list はキーの辞書順で返るので、
 * reverse で読めば並べ替えずに新しい順になる。
 * 同じミリ秒に続けて作っても順序が崩れないよう、monotonicUlid を使う。
 */
function newPost(name: string, text: string, createdAt: Date): Post {
  return {
    id: monotonicUlid(),
    name,
    text,
    likes: 0,
    createdAt: createdAt.toISOString(),
  };
}

/**
 * はじめての部屋なら、1 分ずつ前に書いたことにしたサンプルを入れる。
 * 同時に 2 つの isolate が来ても二重に入らないよう、印の有無を check して書く。
 */
async function ensureRoom(room: string): Promise<void> {
  if ((await kv.get(roomKey(room))).versionstamp !== null) return;
  const now = Date.now();
  const op = kv.atomic().check({ key: roomKey(room), versionstamp: null })
    .set(roomKey(room), true);
  SAMPLE_POSTS.forEach(({ name, text }, i) => {
    const minutesAgo = SAMPLE_POSTS.length - i;
    const post = newPost(name, text, new Date(now - minutesAgo * 60_000));
    op.set(postKey(room, post.id), post);
  });
  // check が失敗したのは、ほかの isolate が先に入れ終えたということなので無視する
  await op.commit();
}

/** 保持件数を超えた分を古いものから捨てる。最大でも 200 件強なので全件走査で足りる */
async function trimRoom(room: string): Promise<void> {
  const keys = await Array.fromAsync(
    kv.list({ prefix: roomPrefix(room) }, { reverse: true }),
    (entry) => entry.key,
  );
  for (const key of keys.slice(MAX_POSTS_PER_ROOM)) {
    await kv.delete(key);
  }
}

function checkRoom(room: string | null): string | null {
  if (!room) {
    return "room を指定してください（例: /posts?room=sample）";
  }
  if (!ROOM_PATTERN.test(room)) {
    return "room は英数字とハイフンで1〜32文字にしてください";
  }
  return null;
}

function checkPostBody(body: unknown): string | null {
  const { name, text } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof body !== "object" || typeof name !== "string" ||
    typeof text !== "string"
  ) {
    return 'name と text を文字列で送ってください（例: {"name": "たろう", "text": "こんにちは"}）';
  }
  if (name.trim() === "") return "名前を入れてください";
  if (text.trim() === "") return "本文を入れてください";
  // string.length は UTF-16 単位で絵文字を 2 文字と数えるので、コードポイントで数える
  if ([...name.trim()].length > MAX_NAME_LENGTH) {
    return `名前は${MAX_NAME_LENGTH}文字までです`;
  }
  if ([...text.trim()].length > MAX_TEXT_LENGTH) {
    return `本文は${MAX_TEXT_LENGTH}文字までです`;
  }
  return null;
}

async function listPosts(room: string): Promise<Response> {
  await ensureRoom(room);
  return json(
    200,
    await Array.fromAsync(
      kv.list<Post>({ prefix: roomPrefix(room) }, { reverse: true }),
      (entry) => entry.value,
    ),
  );
}

async function createPost(room: string, request: Request): Promise<Response> {
  let body: { name: string; text: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      400,
      "送るデータを JSON の文字にしてください（JSON.stringify を使います）",
    );
  }
  const bodyError = checkPostBody(body);
  if (bodyError) return errorResponse(400, bodyError);

  await ensureRoom(room);
  const post = newPost(body.name.trim(), body.text.trim(), new Date());
  const written = await kv.atomic()
    .set(postKey(room, post.id), post)
    .set(changedKey(room), post.id)
    .commit();
  if (!written.ok) throw new Error("ポストの保存に失敗しました");
  await trimRoom(room);
  return json(201, post);
}

/**
 * いいねは読んでから 1 足して書くので、同時に押されると片方が消える。
 * 読んだときの versionstamp を check し、ほかが先に書いていたら読み直す。
 */
async function likePost(room: string, id: string): Promise<Response> {
  await ensureRoom(room);
  for (;;) {
    const entry = await kv.get<Post>(postKey(room, id));
    if (entry.value === null) {
      return errorResponse(404, "その id の投稿は見つかりません");
    }
    const post = { ...entry.value, likes: entry.value.likes + 1 };
    const written = await kv.atomic()
      .check(entry)
      .set(entry.key, post)
      .set(changedKey(room), crypto.randomUUID())
      .commit();
    if (written.ok) return json(200, post);
  }
}

// KV で数えると、抑えたい書き込みそのものが増えるのでメモリで数える。
// isolate ごとの数なので、isolate が複数立つと実際の上限はその倍数になる
type Bucket = { tokens: number; at: number };
const buckets = new Map<string, Bucket>();
const totalBucket: Bucket = { tokens: TOTAL_POST_BURST, at: Date.now() };

function refill(bucket: Bucket, now: number, rate: number, burst: number) {
  bucket.tokens = Math.min(
    burst,
    bucket.tokens + (now - bucket.at) / 1000 * rate,
  );
  bucket.at = now;
}

/**
 * IPv6 は 1 台に /64 がまるごと割り当てられることが多く、アドレスを変えながら
 * 送れば 1 件ずつ数えても制限にならないので、先頭 64 ビットでまとめる。
 */
function sourceKey(ip: string): string {
  const addr = ip.split("%")[0];
  if (!addr.includes(":")) return addr;
  const mappedV4 = addr.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mappedV4) return mappedV4[1];
  const [head, tail] = addr.split("::");
  const headGroups = head ? head.split(":") : [];
  const tailGroups = tail ? tail.split(":") : [];
  const groups = tail === undefined ? headGroups : [
    ...headGroups,
    ...Array(8 - headGroups.length - tailGroups.length).fill("0"),
    ...tailGroups,
  ];
  return groups.slice(0, 4).join(":") + "::/64";
}

/** 満タンまで回復した送信元は、消しても次に来たとき同じ状態から数え直すだけなので消してよい */
function evictRefilled(now: number) {
  const refillMs = POST_BURST / POST_RATE_PER_SEC * 1000;
  for (const [key, bucket] of buckets) {
    if (now - bucket.at >= refillMs) buckets.delete(key);
  }
}

function takePostToken(ip: string | undefined): boolean {
  const now = Date.now();
  refill(totalBucket, now, TOTAL_POST_RATE_PER_SEC, TOTAL_POST_BURST);
  if (totalBucket.tokens < 1) return false;
  if (ip === undefined) {
    totalBucket.tokens -= 1;
    return true;
  }

  const key = sourceKey(ip);
  if (!buckets.has(key) && buckets.size >= MAX_TRACKED_SOURCES) {
    evictRefilled(now);
    if (buckets.size >= MAX_TRACKED_SOURCES) return false;
  }
  const bucket = buckets.get(key) ?? { tokens: POST_BURST, at: now };
  refill(bucket, now, POST_RATE_PER_SEC, POST_BURST);
  buckets.set(key, bucket);
  if (bucket.tokens < 1) return false;
  bucket.tokens -= 1;
  totalBucket.tokens -= 1;
  return true;
}

function tooManyRequests(): Response {
  return errorResponse(
    429,
    "送る回数が多すぎます。少し待ってから送ってください",
  );
}

const encoder = new TextEncoder();

/**
 * ポストかいいねが変わるたびに data: changed を流す。
 *
 * Deno Deploy は isolate を複数立てるので、この接続を持つ isolate と POST を受けた
 * isolate は別になりうる。接続をメモリ上に持つだけでは知らせが届かないので、
 * KV の changedKey を監視する。
 */
async function streamEvents(room: string): Promise<Response> {
  const watcher = kv.watch([changedKey(room)]).getReader();
  // 購読した直後に現在値が 1 回流れてくる。変わった知らせではないので捨てる。
  // 返事を返す前に読むので、受け取った側がこの後に送ったポストは必ず知らせになる
  await watcher.read();

  // タブを閉じると立つ。そこから先の controller 操作は例外になるので、
  // 配信そのものの失敗と見分けるために持つ
  let cancelled = false;

  async function pump(
    controller: ReadableStreamDefaultController<Uint8Array>,
  ): Promise<void> {
    const ping = setInterval(() => {
      // cancel から pump の finally までの間に打ってしまう窓が残るので、捕まえて止める
      try {
        controller.enqueue(encoder.encode(": ping\n\n"));
      } catch {
        clearInterval(ping);
      }
    }, HEARTBEAT_INTERVAL_MS);

    try {
      controller.enqueue(encoder.encode(": connected\n\n"));
      while (!(await watcher.read()).done) {
        controller.enqueue(encoder.encode("data: changed\n\n"));
      }
      controller.close();
    } catch (cause) {
      if (cancelled) return;
      // KV 側の失敗はこちらに来る。開いたままにすると EventSource は error を
      // 受け取らず、再接続しないまま黙って止まる
      console.error(cause);
      controller.error(cause);
    } finally {
      clearInterval(ping);
      if (!cancelled) await watcher.cancel();
    }
  }

  const body = new ReadableStream<Uint8Array>({
    start: (controller) => void pump(controller),
    cancel: () => {
      cancelled = true;
      return watcher.cancel();
    },
  });

  return new Response(body, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}

function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function methodNotAllowed(methods: string): Response {
  const res = errorResponse(405, `この URL には ${methods} で送ってください`);
  res.headers.set("Allow", `${methods}, OPTIONS`);
  return res;
}

/** /posts/なにか/like の形なら、なにかの部分を返す */
function likeTarget(pathname: string): string | null {
  const parts = pathname.split("/");
  const ok = parts.length === 4 && parts[1] === "posts" && parts[2] !== "" &&
    parts[3] === "like";
  return ok ? parts[2] : null;
}

/**
 * パスとメソッドの組み合わせは completed/server.js の routes と揃える。
 * /posts/events だけ OPTIONS を受けないのも同じで、EventSource は
 * プリフライトを送らないので困らない。
 */
async function handle(
  request: Request,
  ip: string | undefined,
): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method;
  const room = url.searchParams.get("room");
  const roomError = checkRoom(room);

  if (pathname === "/posts") {
    if (method === "OPTIONS") return preflight();
    if (method !== "GET" && method !== "POST") {
      return methodNotAllowed("GET, POST");
    }
    if (roomError) return errorResponse(400, roomError);
    if (method === "GET") return await listPosts(room!);
    if (!takePostToken(ip)) return tooManyRequests();
    return await createPost(room!, request);
  }

  if (pathname === "/posts/events") {
    if (method !== "GET") return methodNotAllowed("GET");
    if (roomError) return errorResponse(400, roomError);
    return await streamEvents(room!);
  }

  const id = likeTarget(pathname);
  if (id !== null) {
    if (method === "OPTIONS") return preflight();
    if (method !== "POST") return methodNotAllowed("POST");
    if (roomError) return errorResponse(400, roomError);
    if (!takePostToken(ip)) return tooManyRequests();
    return await likePost(room!, id);
  }

  return errorResponse(
    404,
    `${pathname} という URL はありません。/posts を使ってください`,
  );
}

export async function route(
  request: Request,
  info?: Deno.ServeHandlerInfo,
): Promise<Response> {
  const ip = (info?.remoteAddr as Deno.NetAddr | undefined)?.hostname;
  try {
    return await handle(request, ip);
  } catch (cause) {
    // KV の障害などで例外が出ても CORS ヘッダー付きで返す。
    // 素通しすると受講者のブラウザには「CORS でブロックされた」としか出ず、
    // ステータスもメッセージも読めないまま原因調査で講座が止まる。
    console.error(cause);
    return errorResponse(500, "サーバー側で問題が起きました");
  }
}

if (import.meta.main) {
  // PORT は verify.mjs が空いているポートで立てるために使う
  Deno.serve({
    port: Number(Deno.env.get("PORT") ?? 8000),
    onListen: ({ port }) => {
      console.log(`ミニX を http://localhost:${port}/ で起動しました`);
    },
  }, route);
}
