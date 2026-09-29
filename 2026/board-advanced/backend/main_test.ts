import { assertEquals, assertMatch } from "@std/assert";
import {
  lastPostId,
  listConnections,
  MAX_POSTS_PER_ROOM,
  type Post,
  route,
} from "./main.ts";

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

Deno.test("Object のプロパティ名と同じパスも 404", async () => {
  // メソッドの表をオブジェクトで引くと、これらは prototype 経由で値が取れる。
  // undefined にならないので 404 をすり抜け、メソッドの照合で 500 になる
  for (
    const path of [
      "constructor",
      "toString",
      "valueOf",
      "hasOwnProperty",
      "__proto__",
    ]
  ) {
    assertEquals((await callRoute("GET", `/${path}?room=x`)).status, 404);
  }
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

/** GET /events につないで、届いたイベントを 1 件ずつ取り出せる形にする */
async function openEvents(room: string) {
  const res = await callRoute("GET", `/events?room=${room}`);
  assertEquals(res.status, 200);

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let pending: Promise<ReadableStreamReadResult<Uint8Array>> | null = null;

  /** buffer に溜まったぶんから 1 件取り出す。揃っていなければ null */
  function take(): Post | null {
    for (let border = buffer.indexOf("\n\n"); border !== -1;) {
      const block = buffer.slice(0, border);
      buffer = buffer.slice(border + 2);
      // : ping はコメント行なので読み飛ばす
      if (block.startsWith("data: ")) {
        return JSON.parse(block.slice("data: ".length)) as Post;
      }
      border = buffer.indexOf("\n\n");
    }
    return null;
  }

  return {
    /** 次のイベントを待つ。待ち切って何も来なければ null */
    async next(timeoutMs = 1000): Promise<Post | null> {
      const deadline = Date.now() + timeoutMs;
      while (true) {
        const post = take();
        if (post !== null) return post;

        const remaining = deadline - Date.now();
        if (remaining <= 0) return null;
        if (pending === null) pending = reader.read();

        let timer: ReturnType<typeof setTimeout> | undefined;
        const expired = new Promise<"expired">((resolve) => {
          timer = setTimeout(() => resolve("expired"), remaining);
        });
        const result = await Promise.race([pending, expired]);
        clearTimeout(timer);

        // 待ち切った場合、読みかけの read は次の next に持ち越す
        if (result === "expired") return null;
        pending = null;
        if (result.done) return null;
        buffer += decoder.decode(result.value, { stream: true });
      }
    },
    close(): Promise<void> {
      return reader.cancel();
    },
  };
}

Deno.test("GET /events は text/event-stream を返す", async () => {
  const res = await callRoute("GET", `/events?room=${newRoom()}`);
  assertEquals(res.status, 200);
  assertMatch(res.headers.get("Content-Type") ?? "", /^text\/event-stream/);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
  await res.body?.cancel();
});

Deno.test("/events に GET 以外を投げると 405", async () => {
  assertEquals((await callRoute("POST", "/events?room=x")).status, 405);
});

Deno.test("投稿すると本体とカーソルの両方が書かれる", async () => {
  const room = newRoom();
  assertEquals(await lastPostId(room), null);

  const created = await post(room, "ユーザーA", "本文");

  assertEquals((await list(room)).map((p) => p.id), [created.id]);
  assertEquals(await lastPostId(room), created.id);
});

Deno.test("接続した直後は既存の投稿が流れない", async () => {
  const room = newRoom();
  for (const text of ["1件目", "2件目", "3件目"]) {
    await post(room, "ユーザーA", text);
    await nextMillisecond();
  }

  // 初期表示はクライアント側の showPosts() が担うので、ここで流すと二重になる
  const events = await openEvents(room);
  assertEquals(await events.next(200), null);
  await events.close();
});

Deno.test("接続した直後に入った投稿は落ちない", async () => {
  const room = newRoom();
  const events = await openEvents(room);

  const created = await post(room, "ユーザーA", "つないだ後の投稿");

  const received = await events.next();
  assertEquals(received?.id, created.id);
  assertEquals(received?.text, "つないだ後の投稿");
  await events.close();
});

Deno.test("既存の投稿がある部屋でも、流れるのは新しい 1 件だけ", async () => {
  const room = newRoom();
  await post(room, "ユーザーA", "つなぐ前の投稿");
  await nextMillisecond();

  const events = await openEvents(room);
  const created = await post(room, "ユーザーB", "つないだ後の投稿");

  assertEquals((await events.next())?.id, created.id);
  assertEquals(await events.next(200), null);
  await events.close();
});

Deno.test("同時に入った 2 件は、カーソルが 1 回しか動かなくても両方流れる", async () => {
  // kv.watch が渡すのは最新の状態だけで、途中の変化は飛ばされる。
  // 同時に commit した 2 件は 1 回の通知にまとまり、カーソルは後の 1 件を指す。
  // 通知を引き金にして範囲を読み直しているので、飛ばされた側も回収される。
  const room = newRoom();
  const events = await openEvents(room);

  const created = await Promise.all([
    post(room, "ユーザーA", "同時1"),
    post(room, "ユーザーB", "同時2"),
  ]);
  const expected = created.map((p) => p.id).sort();

  const received = [await events.next(), await events.next()];
  assertEquals(received.map((p) => p?.id), expected);
  assertEquals(await events.next(200), null);
  await events.close();
});

/** Date.now を指定ミリ秒だけ巻き戻して実行する */
async function withClockBack<T>(
  ms: number,
  run: () => Promise<T>,
): Promise<T> {
  const realNow = Date.now;
  Date.now = () => realNow() - ms;
  try {
    return await run();
  } finally {
    Date.now = realNow;
  }
}

Deno.test("配信済みより id が小さい投稿が後から入っても流れる", async () => {
  // id の時刻部分は commit より前に決まるので、id の順と commit の順は一致しない。
  // どこまで配信したかを id の大小で持つと、配信済みより小さい id で後から
  // commit された投稿が範囲に入らず、永久に流れない。
  const room = newRoom();
  const events = await openEvents(room);

  const first = await post(room, "ユーザーA", "先に届く投稿");
  assertEquals((await events.next())?.id, first.id);

  const second = await withClockBack(
    1000,
    () => post(room, "ユーザーB", "id が小さい投稿"),
  );
  assertEquals(second.id < first.id, true);

  assertEquals((await events.next())?.id, second.id);
  await events.close();
});

Deno.test("流れる投稿は GET /posts と同じ形", async () => {
  const room = newRoom();
  const events = await openEvents(room);
  const created = await post(room, "ユーザーA", "本文");

  // 包まずに投稿 1 件をそのまま載せる。受講者は JSON.parse の結果をそのまま使う
  assertEquals(await events.next(), created);
  await events.close();
});

Deno.test("古い投稿を捨ててもカーソルは消えない", async () => {
  // 投稿が入ったことを接続中の isolate に知らせる経路はカーソルしかない。
  // trimRoom の走査対象に混ぜると、そこが途切れる
  const room = newRoom();
  let created: Post | undefined;
  for (let i = 0; i < MAX_POSTS_PER_ROOM + 1; i++) {
    created = await post(room, "ユーザーA", `${i}`);
  }

  assertEquals((await list(room)).length, MAX_POSTS_PER_ROOM);
  assertEquals(await lastPostId(room), created?.id);
});

Deno.test("配信中に KV が落ちたらストリームをエラーで閉じる", async () => {
  // 閉じずに残すと EventSource は error も close も受け取らないまま待ち続け、
  // 再接続しない。受講者の画面が無言で止まる
  const room = newRoom();
  const res = await callRoute("GET", `/events?room=${room}`);
  const reader = res.body!.getReader();

  const realList = Deno.Kv.prototype.list;
  Deno.Kv.prototype.list = function (): never {
    throw new Error("kv down");
  };

  try {
    // 投稿本体は commit されるのでカーソルは動く。
    // 引き金を受けた配信側が読み直そうとして、その kv.list が落ちる
    await callRoute("POST", `/posts?room=${room}`, {
      name: "ユーザーA",
      text: "本文",
    });

    let timer: ReturnType<typeof setTimeout> | undefined;
    const outcome = await Promise.race([
      reader.read().then(() => "読めた", () => "エラーで閉じた"),
      new Promise<string>((resolve) => {
        timer = setTimeout(() => resolve("開いたまま"), 1000);
      }),
    ]);
    clearTimeout(timer);
    assertEquals(outcome, "エラーで閉じた");
  } finally {
    Deno.Kv.prototype.list = realList;
  }
});

Deno.test("配信が KV 障害で閉じるとき watch も止める", async () => {
  // error 経路は cancel コールバックを通らないので、watch を止める口が
  // finally にしかない。閉じ損ねると接続ごとに watch 購読が残り続ける
  const room = newRoom();

  // getReader が返すリーダーの cancel が呼ばれたかを見張る
  const realWatch = Deno.Kv.prototype.watch;
  let watchCancelled = false;
  // deno-lint-ignore no-explicit-any
  Deno.Kv.prototype.watch = function (this: Deno.Kv, ...args: any[]) {
    // deno-lint-ignore no-explicit-any
    const stream = (realWatch as any).apply(this, args);
    const realGetReader = stream.getReader.bind(stream);
    stream.getReader = (...readerArgs: unknown[]) => {
      const reader = realGetReader(...readerArgs);
      const realCancel = reader.cancel.bind(reader);
      reader.cancel = (reason?: unknown) => {
        watchCancelled = true;
        return realCancel(reason);
      };
      return reader;
    };
    return stream;
    // deno-lint-ignore no-explicit-any
  } as any;

  const res = await callRoute("GET", `/events?room=${room}`);
  const reader = res.body!.getReader();

  const realList = Deno.Kv.prototype.list;
  Deno.Kv.prototype.list = function (): never {
    throw new Error("kv down");
  };

  try {
    await callRoute("POST", `/posts?room=${room}`, {
      name: "ユーザーA",
      text: "本文",
    });
    // error で閉じるのを待ってから watch の後始末を確かめる
    await reader.read().catch(() => {});
    assertEquals(watchCancelled, true);
  } finally {
    Deno.Kv.prototype.list = realList;
    Deno.Kv.prototype.watch = realWatch;
  }
});

Deno.test("GET /events につないでいる間だけ接続の記録が立つ", async () => {
  const room = newRoom();
  assertEquals(await listConnections(room), []);

  const events = await openEvents(room);
  assertEquals((await listConnections(room)).length, 1);

  await events.close();
  assertEquals(await listConnections(room), []);
});

Deno.test("同じ部屋に複数つなぐと接続 id が別々に立つ", async () => {
  const room = newRoom();

  const a = await openEvents(room);
  const b = await openEvents(room);
  const ids = await listConnections(room);
  assertEquals(ids.length, 2);
  assertEquals(new Set(ids).size, 2);

  await a.close();
  assertEquals((await listConnections(room)).length, 1);
  await b.close();
  assertEquals(await listConnections(room), []);
});

Deno.test("部屋が違えば接続の記録は混ざらない", async () => {
  const a = newRoom();
  const b = newRoom();

  const events = await openEvents(a);
  assertEquals((await listConnections(a)).length, 1);
  assertEquals(await listConnections(b), []);

  await events.close();
});

Deno.test("接続者一覧は room がなくても開ける", async () => {
  const res = await callRoute("GET", "/connections");
  assertEquals(res.status, 200);
  assertMatch(res.headers.get("Content-Type") ?? "", /^text\/html/);
  assertMatch(await res.text(), /<form/);
});

Deno.test("接続者一覧に接続数と接続 id が載る", async () => {
  const room = newRoom();
  const a = await openEvents(room);
  const b = await openEvents(room);

  const body = await (await callRoute("GET", `/connections?room=${room}`))
    .text();
  assertMatch(body, /<b>2<\/b>/);
  const ids = await listConnections(room);
  for (const id of ids) {
    assertMatch(body, new RegExp(`<td>${id}</td>`));
  }

  await a.close();
  await b.close();
});

Deno.test("接続者一覧は room の形式が不正なら 400", async () => {
  const res = await callRoute("GET", "/connections?room=a b");
  assertEquals(res.status, 400);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
  await res.body?.cancel();
});

Deno.test("/connections に GET 以外を投げると 405", async () => {
  assertEquals((await callRoute("POST", "/connections")).status, 405);
});
