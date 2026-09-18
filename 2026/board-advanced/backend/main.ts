// 掲示板アプリ勉強会（2026年9月 経験者コース）の共有サーバー。
// 受講者はブラウザから fetch でこの API を叩く。
// 保存・CORS・投稿量の上限といった、講座で扱わない部分をここで引き受ける。

const MAX_NAME_LENGTH = 20;
const MAX_TEXT_LENGTH = 200;
export const MAX_POSTS_PER_ROOM = 500;

/**
 * SSE の接続に何も流れない時間が続くと Deno Deploy が isolate を落とすので、
 * この間隔でコメント行を送って接続を保つ。
 */
const HEARTBEAT_INTERVAL_MS = 15_000;

/**
 * 接続の記録が生き残る時間。: ping を流すのと同じ間隔でサーバーが延ばす。
 * 切断時は消しにいくが、isolate が落ちて後始末が飛んでも期限切れで消える。
 */
const CONNECTION_TTL_MS = 30_000;

/**
 * 部屋 ID は開催回を分ける運用上の区切り。英数字とハイフンだけ許可する。
 *
 * ハイフンをエスケープしているのは、この source をそのまま講師用ページの
 * input の pattern 属性に流すため。ブラウザは pattern を v フラグで
 * コンパイルし、文字クラス末尾の裸のハイフンはそこで構文エラーになる。
 */
const ROOM_PATTERN = /^[A-Za-z0-9\-]{1,32}$/;

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

function html(body: string): Response {
  return new Response(body, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
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
 * その部屋で最後に保存した投稿の id を置く場所。SSE はここを見張る。
 * 使うのは値が変わったという事実だけで、値そのものは配信位置に使わない。
 *
 * 投稿そのものではなく id を置くのは、kv.watch が中間状態を飛ばすため。
 * 流れてくるのは最新の状態であって途中の変化ではないので、投稿本体を入れると
 * 同時に 2 件入ったときに片方が配信されない。id なら読み直しで回収できる。
 */
function cursorKey(room: string): Deno.KvKey {
  return ["last_post_id", room];
}

function connectionPrefix(room: string): Deno.KvKey {
  return ["conn", room];
}

function connectionKey(room: string, connId: string): Deno.KvKey {
  return [...connectionPrefix(room), connId];
}

/** テストからカーソルを読むために公開している */
export async function lastPostId(room: string): Promise<string | null> {
  return (await kv.get<string>(cursorKey(room))).value;
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

/**
 * 保持件数を超えた分を古いものから捨てる。最大でも 500 件強なので全件走査で足りる。
 *
 * カーソルは prefix が違うので消えない。消してはいけない。
 * 投稿が入ったことを接続中の isolate に知らせる経路がここしかない。
 */
async function trimRoom(room: string): Promise<void> {
  const keys = await Array.fromAsync(
    kv.list({ prefix: roomPrefix(room) }),
    (entry) => entry.key,
  );
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

/** いま生きている接続の id。サーバーが振ったもので、kv.list が返す辞書順に並ぶ */
export function listConnections(room: string): Promise<string[]> {
  return Array.fromAsync(
    kv.list({ prefix: connectionPrefix(room) }),
    (entry) => String(entry.key.at(-1)),
  );
}

/**
 * 接続の記録を書く、または延ばす。接続 id はサーバーが振るので、
 * クライアントには渡さない。
 *
 * TTL は : ping を流すのと同じ間隔で延ばす。isolate が落ちて後始末が
 * 飛んでも、期限切れで自然に消える。
 */
function recordConnection(room: string, connId: string): Promise<void> {
  return kv.set(connectionKey(room, connId), new Date().toISOString(), {
    expireIn: CONNECTION_TTL_MS,
  }).then(() => {});
}

async function listPosts(room: string): Promise<Response> {
  return json(
    await Array.fromAsync(
      kv.list<Post>({ prefix: roomPrefix(room) }),
      (entry) => entry.value,
    ),
  );
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

  // 投稿本体とカーソルは 1 つの atomic 操作で書く。分けて書くと、その間に
  // 配信されない投稿か、存在しない投稿を指すカーソルが残る。
  const written = await kv.atomic()
    .set(postKey(room, post.id), post)
    .set(cursorKey(room), post.id)
    .commit();
  if (!written.ok) throw new Error("投稿の保存に失敗しました");

  await trimRoom(room);
  return json(post, 201);
}

const encoder = new TextEncoder();

type CursorWatcher = ReadableStreamDefaultReader<[Deno.KvEntryMaybe<string>]>;

/** カーソルが動くのを待つ。接続が切れて watch が終わったら false を返す */
async function cursorChanged(watcher: CursorWatcher): Promise<boolean> {
  return !(await watcher.read()).done;
}

/** その部屋にいま並んでいる投稿の id。kv.list が返す辞書順に並ぶ */
function listPostIds(room: string): Promise<string[]> {
  return Array.fromAsync(
    kv.list({ prefix: roomPrefix(room) }),
    (entry) => String(entry.key.at(-1)),
  );
}

/**
 * まだ流していない投稿を 1 件 1 イベントとして書き、
 * 書き終えた時点で部屋にある id の集合を返す。
 *
 * どこまで配信したかを id の大小ではなく、流した id の集合で持っている。
 * id の時刻部分は commit より前に決まるので、id の順と commit の順は一致しない。
 * 「最後に流した id より後ろ」で範囲を切ると、その手前に割り込んで commit された
 * 投稿が二度と範囲に入らず、永久に流れない。
 *
 * 返した集合をそのまま次回の引数にすると、trimRoom が捨てた投稿の id が残らない。
 * 集合の大きさは部屋の保持件数に収まる。
 */
async function writeUnsent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  room: string,
  sent: Set<string>,
): Promise<Set<string>> {
  const current = new Set<string>();
  for await (const entry of kv.list<Post>({ prefix: roomPrefix(room) })) {
    current.add(entry.value.id);
    if (sent.has(entry.value.id)) continue;
    // JSON.stringify は改行をエスケープするので、投稿 1 件が必ず 1 行に収まる
    const line = `data: ${JSON.stringify(entry.value)}\n\n`;
    controller.enqueue(encoder.encode(line));
  }
  return current;
}

/**
 * 投稿が増えたら 1 件ずつ SSE で流す。イベント名は既定の message のまま使う。
 *
 * Deno Deploy は isolate を複数立てるので、この接続を持つ isolate と POST を受けた
 * isolate は別になりうる。接続をメモリ上の配列に持つだけでは配信されない。
 * カーソルを KV 経由で見張ることで、どの isolate で受けた投稿でも届く。
 */
async function streamPosts(room: string): Promise<Response> {
  // 接続した時点の投稿は配信済みとして扱う。だから接続直後は何も流れない。
  // 初期表示はクライアント側が担う
  let sent = new Set(await listPostIds(room));

  const watcher = kv.watch<[string]>([cursorKey(room)]).getReader();

  // 購読した直後に現在値が 1 回流れてくる。これは引き金として使わず捨てる
  await watcher.read();

  // 接続 id はサーバーが振る。この接続が生きている間だけ KV に記録を持つ
  const connId = crypto.randomUUID();
  await recordConnection(room, connId);

  // タブを閉じると立つ。そこから先の controller 操作は例外になるので、
  // 配信そのものの失敗と見分けるために持つ
  let cancelled = false;

  async function pump(
    controller: ReadableStreamDefaultController<Uint8Array>,
  ): Promise<void> {
    const ping = setInterval(() => {
      // コメント行なのでイベントとしては配送されず、message と衝突しない。
      // cancel から pump の finally までの間はここだけが controller に触るので、
      // 閉じた後に打ってしまう窓が残る。捕まえて止める
      try {
        controller.enqueue(encoder.encode(": ping\n\n"));
      } catch {
        clearInterval(ping);
        return;
      }
      // 接続の記録も ping と同じ間隔で延ばす
      void recordConnection(room, connId);
    }, HEARTBEAT_INTERVAL_MS);

    try {
      // 集合を作ってから watch を張るまでの間に入った投稿をここで回収する。
      // 先に watch を張る順序にすると、購読から集合を作るまでの間に入った投稿が
      // 配信済みとして集合に混ざり、通知が来ても流れないまま消える
      sent = await writeUnsent(controller, room, sent);

      // カーソルの値そのものは使わない。どこまで配信したかは sent が持つ
      while (await cursorChanged(watcher)) {
        sent = await writeUnsent(controller, room, sent);
      }
      controller.close();
    } catch (cause) {
      // 受講者がタブを閉じた後の close() は例外になる。これは配信の終わり方として
      // 正常なので、黙って止める
      if (cancelled) return;

      // KV 側の失敗はこちらに落ちる。開いたままにすると EventSource は error も
      // close も受け取らず、再接続しないまま黙って止まる。
      // 受講者の画面は投稿しても増えず、手動リロード以外に戻る道がなくなる
      console.error(cause);
      controller.error(cause);
    } finally {
      clearInterval(ping);
      // 消費側 cancel は cancel コールバックが watcher と接続の記録を閉じている。
      // それ以外の経路（正常終了と KV 障害の error）はここでしか閉じられないので、
      // 二重呼び出しを避けつつここで閉じる
      if (!cancelled) {
        await watcher.cancel();
        await kv.delete(connectionKey(room, connId));
      }
    }
  }

  const body = new ReadableStream<Uint8Array>({
    start: (controller) => void pump(controller),
    // タブを閉じたときに呼ばれる。watch を止めると pump のループも終わる。
    // 接続の記録もここで消す。期限切れ待ちにすると、閉じた直後の一覧に
    // 残ったままになる
    cancel: () => {
      cancelled = true;
      return Promise.all([
        watcher.cancel(),
        kv.delete(connectionKey(room, connId)),
      ]).then(() => {});
    },
  });

  return new Response(body, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

const PAGE_STYLE = `
  :root { color-scheme: light }
  body {
    margin: 0 auto; padding: 24px 16px; max-width: 640px;
    font: 14px/1.5 system-ui, -apple-system, "Hiragino Sans", sans-serif;
    color: #1a1a1a; background: #fff;
  }
  form { display: flex; gap: 8px; margin-bottom: 24px }
  input, button {
    font: inherit; padding: 6px 10px;
    border: 1px solid #d8d8d8; border-radius: 4px; background: #fff;
  }
  input { flex: 1 }
  button { cursor: pointer }
  h1 { margin: 0; font-size: 20px }
  .count { display: flex; align-items: baseline; gap: 8px; margin: 16px 0 24px }
  .count b { font-size: 40px; font-variant-numeric: tabular-nums }
  .count span { color: #666 }
  table { width: 100%; border-collapse: collapse }
  th, td { padding: 6px 4px; text-align: left; border-bottom: 1px solid #d8d8d8 }
  th { color: #666; font-weight: 400 }
  footer { margin-top: 24px; color: #666 }
`;

/**
 * 講師用の接続者一覧。認証は付けない。
 *
 * room は正規表現を通した値しか KV に入らず、接続 id は crypto.randomUUID()
 * が振ったものしか入らないので、差し込みでエスケープの要る文字は届かない。
 */
async function connectionsPage(room: string | null): Promise<Response> {
  const head = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>接続者一覧${room === null ? "" : ` ${room}`}</title>
<style>${PAGE_STYLE}</style>
<form method="get" action="/connections">
  <input name="room" value="${room ?? ""}" placeholder="部屋 ID"
    pattern="${ROOM_PATTERN.source}" ${room === null ? "autofocus" : ""}>
  <button>開く</button>
</form>`;

  if (room === null) return html(head);

  const ids = await listConnections(room);
  const table = ids.length === 0 ? "" : `
  <table>
    <thead><tr><th>接続 id</th></tr></thead>
    <tbody>
${ids.map((id) => `      <tr><td>${id}</td></tr>`).join("\n")}
    </tbody>
  </table>`;
  const fetchedAt = new Date().toLocaleTimeString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });

  // 5 秒ごとに読み込み直す。講座中は開いたまま置いておく
  return html(`${head}
<meta http-equiv="refresh" content="5">
<h1>${room}</h1>
<p class="count"><b>${ids.length}</b><span>接続数</span></p>${table}
<footer>取得 ${fetchedAt} JST · 対象 直近 ${
    CONNECTION_TTL_MS / 1000
  } 秒</footer>`);
}

/**
 * 受け付けるパスと、そのパスが受け付けるメソッド。
 * 存在するパスの一覧と 405 の文面をここ 1 箇所から作る。
 * 振り分け先は handle の分岐が持つので、足すときは両方に足す。
 *
 * Map なのは、引くキーが URL から来る任意の文字列だから。
 * オブジェクトだと constructor や toString が prototype 経由で引けてしまい、
 * 存在しないパスなのに undefined にならない。
 */
const ALLOWED_METHODS = new Map<string, string[]>([
  ["posts", ["GET", "POST"]],
  ["events", ["GET"]],
  ["connections", ["GET"]],
]);

async function handle(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter((s) => s !== "");
  const path = segments.length === 1 ? segments[0] : "";

  const allowed = ALLOWED_METHODS.get(path);
  if (allowed === undefined) return errorResponse(404, "そのパスはありません");
  if (!allowed.includes(request.method)) {
    return errorResponse(
      405,
      `このパスでは ${allowed.join(" と ")} が使えます`,
    );
  }

  // 講師用のページだけは room を省くと入力欄を出すので、ここでは形式だけを見る
  const room = url.searchParams.get("room");
  if (room !== null && !ROOM_PATTERN.test(room)) {
    return errorResponse(400, "room の形式が不正です");
  }
  if (path === "connections") return await connectionsPage(room);
  if (room === null) return errorResponse(400, "room を指定してください");

  if (path === "events") return await streamPosts(room);
  if (path === "posts") {
    return request.method === "GET"
      ? await listPosts(room)
      : await createPost(room, request);
  }

  // ALLOWED_METHODS に載せたパスはここまでですべて返している。
  // 表にだけ足して振り分けを書き忘れると、405 でも 500 でもなくここに来る
  return errorResponse(404, "そのパスはありません");
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
  // PORT はローカルで別ポートに逃がすためのもの（教材のスクリーンショット撮影で使う）
  const port = Number(Deno.env.get("PORT") ?? 8000);
  Deno.serve({ port }, route);
}
