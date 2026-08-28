// 掲示板アプリ勉強会（2026年9月 初心者コース）のバックエンド。
// 受講者はブラウザから fetch でこの API を叩く。
// 保存・CORS・投稿量の上限といった、講座で扱わない部分をここで引き受ける。

const MAX_NAME_LENGTH = 20;
const MAX_TEXT_LENGTH = 200;
export const MAX_POSTS_PER_ROOM = 200;

/** 部屋 ID は開催回を分ける運用上の区切り。英数字とハイフンだけ許可する */
const ROOM_PATTERN = /^[A-Za-z0-9-]{1,32}$/;

export type Post = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

// テストでは KV_PATH=":memory:" を渡して、ファイルを作らずに動かす
const kv = await Deno.openKv(Deno.env.get("KV_PATH"));

// 受講者は StackBlitz を使う。プロジェクトごとに URL が変わるためオリジンを固定できず、
// ワイルドカードにしている。書き込みは誰でもできる前提の掲示板なので許容する。
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function errorResponse(status: number, message: string): Response {
  return json({ message }, status);
}

/**
 * 辞書順がそのまま時系列順になる ID を作る。
 * Deno KV の list はキーの辞書順で返るので、並べ替えなしで古い順に取り出せる。
 * 同じミリ秒に届いた投稿どうしの順序は保証しない（ランダム部分の順になる）。
 */
function createId(createdAtMs: number): string {
  const stamp = String(createdAtMs).padStart(13, "0");
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  return `${stamp}-${random}`;
}

function roomPrefix(room: string): Deno.KvKey {
  return ["posts", room];
}

function postKey(room: string, id: string): Deno.KvKey {
  return [...roomPrefix(room), id];
}

/**
 * コードポイント単位で切り詰める。
 * String.slice は UTF-16 のコード単位で切るため、境界に絵文字が来ると
 * half surrogate が残って文字化けする。
 */
function truncate(value: string, maxLength: number): string {
  const codePoints = [...value];
  if (codePoints.length <= maxLength) return value;
  return codePoints.slice(0, maxLength).join("");
}

/** 保持件数を超えた分を古いものから捨てる。最大でも 200 件強なので全件走査で足りる */
async function trimRoom(room: string): Promise<void> {
  const keys: Deno.KvKey[] = [];
  for await (const entry of kv.list({ prefix: roomPrefix(room) })) {
    keys.push(entry.key);
  }
  const excess = keys.length - MAX_POSTS_PER_ROOM;
  if (excess <= 0) return;
  for (const key of keys.slice(0, excess)) {
    await kv.delete(key);
  }
}

type ValidatedPost =
  | { ok: true; name: string; text: string }
  | { ok: false; message: string };

/** 受け取ったボディを検証し、保存できる形に整える */
function validatePostBody(body: unknown): ValidatedPost {
  if (typeof body !== "object" || body === null) {
    return { ok: false, message: "JSON オブジェクトを送ってください" };
  }
  const { name, text } = body as Record<string, unknown>;
  if (typeof name !== "string" || typeof text !== "string") {
    return { ok: false, message: "name と text を文字列で送ってください" };
  }

  // 切り詰めで末尾に空白が生まれることがあるので、切ってからもう一度 trim する
  const cleanName = truncate(name.trim(), MAX_NAME_LENGTH).trim();
  const cleanText = truncate(text.trim(), MAX_TEXT_LENGTH).trim();
  if (cleanName === "") return { ok: false, message: "name が空です" };
  if (cleanText === "") return { ok: false, message: "text が空です" };

  return { ok: true, name: cleanName, text: cleanText };
}

async function listPosts(room: string): Promise<Response> {
  const posts: Post[] = [];
  for await (const entry of kv.list<Post>({ prefix: roomPrefix(room) })) {
    posts.push(entry.value);
  }
  return json(posts);
}

async function createPost(room: string, request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "JSON として読めませんでした");
  }

  const validated = validatePostBody(body);
  if (!validated.ok) return errorResponse(400, validated.message);

  const createdAtMs = Date.now();
  const post: Post = {
    id: createId(createdAtMs),
    name: validated.name,
    text: validated.text,
    createdAt: new Date(createdAtMs).toISOString(),
  };

  await kv.set(postKey(room, post.id), post);
  await trimRoom(room);
  return json(post, 201);
}

async function handle(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter((s) => s !== "");
  if (segments.length !== 1 || segments[0] !== "posts") {
    return errorResponse(404, "そのパスはありません");
  }

  const room = url.searchParams.get("room");
  if (room === null) return errorResponse(400, "room を指定してください");
  if (!ROOM_PATTERN.test(room)) {
    return errorResponse(400, "room の形式が不正です");
  }

  if (request.method === "GET") return await listPosts(room);
  if (request.method === "POST") return await createPost(room, request);
  return errorResponse(405, "このパスでは GET と POST が使えます");
}

export async function route(request: Request): Promise<Response> {
  try {
    return await handle(request);
  } catch (cause) {
    // KV の障害などで例外が出ても CORS ヘッダー付きで返す。
    // 素通しすると受講者のブラウザには「CORS でブロックされた」としか出ず、
    // ステータスもメッセージも読めないまま原因調査で講座が止まる。
    console.error(cause);
    return errorResponse(500, "サーバー側で問題が起きました");
  }
}

if (import.meta.main) {
  Deno.serve(route);
}
