import { assertEquals, assertMatch } from "jsr:@std/assert@1";
import { MAX_POSTS_PER_ROOM, type Post, route } from "./main.ts";

const BASE = "http://localhost";

/** サーバーを起動せず、route をそのまま呼ぶ */
function callRoute(
  method: string,
  path: string,
  body?: unknown,
): Promise<Response> {
  return route(
    new Request(`${BASE}${path}`, {
      method,
      headers: body === undefined
        ? undefined
        : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}

/** 生のボディを送る（不正な JSON を試すため） */
function callRouteRaw(
  method: string,
  path: string,
  rawBody: string,
): Promise<Response> {
  return route(
    new Request(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: rawBody,
    }),
  );
}

function newRoom(): string {
  return `t${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * ID の先頭はミリ秒なので、同じミリ秒に入った投稿どうしの順序は保証されない。
 * 並び順を検証するテストでは、投稿の間にこれを挟んでミリ秒をまたがせる。
 */
function nextMillisecond(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 2));
}

async function post(
  room: string,
  name: string,
  text: string,
): Promise<Post> {
  const res = await callRoute("POST", `/posts?room=${room}`, { name, text });
  return await res.json() as Post;
}

async function list(room: string): Promise<Post[]> {
  const res = await callRoute("GET", `/posts?room=${room}`);
  return await res.json() as Post[];
}

Deno.test("投稿がない部屋は空の配列を返す", async () => {
  const res = await callRoute("GET", `/posts?room=${newRoom()}`);
  assertEquals(res.status, 200);
  assertEquals(await res.json(), []);
});

Deno.test("投稿は 201 と作られた投稿 1 件を返す", async () => {
  const room = newRoom();
  const res = await callRoute("POST", `/posts?room=${room}`, {
    name: "ユーザーA",
    text: "こんにちは",
  });
  assertEquals(res.status, 201);

  const created = await res.json() as Post;
  assertEquals(created.name, "ユーザーA");
  assertEquals(created.text, "こんにちは");
  assertEquals(Object.keys(created).sort(), [
    "createdAt",
    "id",
    "name",
    "text",
  ]);
  // createdAt は ISO 8601 文字列
  assertEquals(new Date(created.createdAt).toISOString(), created.createdAt);
});

Deno.test("id は <13桁のミリ秒>-<8桁> の形式", async () => {
  const created = await post(newRoom(), "ユーザーA", "本文");
  assertMatch(created.id, /^\d{13}-[0-9a-f]{8}$/);
});

Deno.test("createdAt は未来の時刻にならない", async () => {
  const before = Date.now();
  const created = await post(newRoom(), "ユーザーA", "本文");
  const after = Date.now();

  const createdAtMs = new Date(created.createdAt).getTime();
  assertEquals(createdAtMs >= before && createdAtMs <= after, true);
});

Deno.test("一覧は古い順に並ぶ", async () => {
  const room = newRoom();
  const first = await post(room, "ユーザーA", "1件目");
  await nextMillisecond();
  await post(room, "ユーザーB", "2件目");

  const posts = await list(room);
  assertEquals(posts.map((p) => p.text), ["1件目", "2件目"]);
  assertEquals(posts[0].id, first.id);
});

Deno.test("部屋が違えば投稿は混ざらない", async () => {
  const a = newRoom();
  const b = newRoom();
  await post(a, "ユーザーA", "aの投稿");

  assertEquals(await list(b), []);
});

Deno.test("名前と本文は上限で切られる", async () => {
  const created = await post(
    newRoom(),
    "あ".repeat(50),
    "い".repeat(500),
  );

  assertEquals([...created.name].length, 20);
  assertEquals([...created.text].length, 200);
});

Deno.test("絵文字が上限で切られても壊れない", async () => {
  // 20 文字目がサロゲートペアの途中に当たる並び
  const created = await post(newRoom(), "あ" + "🐑".repeat(30), "本文");

  assertEquals([...created.name].length, 20);
  // 対になっていないサロゲートが残っていないこと
  assertMatch(
    created.name,
    /^[^\uD800-\uDFFF]*(?:[\uD800-\uDBFF][\uDC00-\uDFFF][^\uD800-\uDFFF]*)*$/,
  );
});

Deno.test("切り詰めた末尾に空白は残らない", async () => {
  const created = await post(newRoom(), "あ".repeat(19) + "  x", "本文");

  assertEquals(created.name, created.name.trimEnd());
});

Deno.test("name と text が空なら 400", async () => {
  const room = newRoom();
  assertEquals(
    (await callRoute("POST", `/posts?room=${room}`, {
      name: " ",
      text: "本文",
    }))
      .status,
    400,
  );
  assertEquals(
    (await callRoute("POST", `/posts?room=${room}`, {
      name: "名前",
      text: "  ",
    }))
      .status,
    400,
  );
});

Deno.test("name と text が文字列でなければ 400", async () => {
  const room = newRoom();
  assertEquals(
    (await callRoute("POST", `/posts?room=${room}`, { name: 1, text: "本文" }))
      .status,
    400,
  );
  assertEquals(
    (await callRoute("POST", `/posts?room=${room}`, { text: "本文" })).status,
    400,
  );
  assertEquals(
    (await callRoute("POST", `/posts?room=${room}`, [1, 2])).status,
    400,
  );
});

Deno.test("JSON として読めないボディは 400", async () => {
  const res = await callRouteRaw(
    "POST",
    `/posts?room=${newRoom()}`,
    "これは JSON ではない",
  );
  assertEquals(res.status, 400);
});

Deno.test("エラーは message を持つ JSON を返す", async () => {
  const res = await callRoute("GET", "/posts");
  assertEquals(res.status, 400);

  const body = await res.json();
  assertEquals(typeof body.message, "string");
  assertEquals(body.message.length > 0, true);
});

Deno.test("room が未指定または形式不正なら 400", async () => {
  assertEquals((await callRoute("GET", "/posts")).status, 400);
  assertEquals((await callRoute("GET", "/posts?room=a b")).status, 400);
  assertEquals((await callRoute("GET", "/posts?room=")).status, 400);
});

Deno.test("room は英数字とハイフンの 32 文字まで", async () => {
  assertEquals(
    (await callRoute("GET", `/posts?room=${"a".repeat(32)}`)).status,
    200,
  );
  assertEquals(
    (await callRoute("GET", `/posts?room=${"a".repeat(33)}`)).status,
    400,
  );
  assertEquals((await callRoute("GET", "/posts?room=2026-01-01")).status, 200);
  assertEquals((await callRoute("GET", "/posts?room=部屋")).status, 400);
});

Deno.test("プリフライトは 204 を返す", async () => {
  const res = await callRoute("OPTIONS", "/posts?room=x");
  assertEquals(res.status, 204);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
  assertEquals(
    res.headers.get("Access-Control-Allow-Headers"),
    "Content-Type",
  );
});

Deno.test("エラー応答にも CORS ヘッダーが付く", async () => {
  // CORS が欠けると、受講者のブラウザではステータスもメッセージも読めなくなる
  for (
    const res of [
      await callRoute("GET", "/posts"), // 400
      await callRoute("GET", "/unknown?room=x"), // 404
      await callRoute("DELETE", "/posts?room=x"), // 405
    ]
  ) {
    assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
    await res.body?.cancel();
  }
});

Deno.test("/posts に GET POST 以外を投げると 405", async () => {
  assertEquals((await callRoute("DELETE", "/posts?room=x")).status, 405);
  assertEquals((await callRoute("PUT", "/posts?room=x")).status, 405);
});

Deno.test("知らないパスは room の有無によらず 404", async () => {
  assertEquals((await callRoute("GET", "/unknown?room=x")).status, 404);
  assertEquals((await callRoute("GET", "/unknown")).status, 404);
  assertEquals((await callRoute("GET", "/posts/abc?room=x")).status, 404);
});

Deno.test("保持件数を超えたら古い投稿から捨てる", async () => {
  const room = newRoom();
  const overflow = 3;

  for (let i = 0; i < MAX_POSTS_PER_ROOM + overflow; i++) {
    await post(room, "ユーザーA", `${i}`);
    await nextMillisecond();
  }

  const posts = await list(room);
  assertEquals(posts.length, MAX_POSTS_PER_ROOM);
  // 捨てられるのは古い方なので、先頭は overflow 件ぶん進んでいる
  assertEquals(posts[0].text, String(overflow));
  assertEquals(
    posts[posts.length - 1].text,
    String(MAX_POSTS_PER_ROOM + overflow - 1),
  );
  // 残った投稿も古い順のまま
  assertEquals(posts.map((p) => p.id), [...posts.map((p) => p.id)].sort());
});
