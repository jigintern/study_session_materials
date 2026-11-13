// API の仕様そのものは verify.mjs が Bun 版と同じ検査で確かめる。
// ここでは KV に載せ替えたことで生じた、同時アクセスの扱いを確かめる。
// isolate をまたぐ配信は確かめていない。ローカルの KV（SQLite）の watch は、ほかのプロセスが書いた変更を検知しない。

import { assertEquals } from "@std/assert";
import { type Post, route } from "./main.ts";

const BASE = "http://localhost";

function call(method: string, path: string, body?: unknown) {
  return route(
    new Request(`${BASE}${path}`, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}

function newRoom(): string {
  return `t${crypto.randomUUID().slice(0, 8)}`;
}

async function list(room: string): Promise<Post[]> {
  return await (await call("GET", `/posts?room=${room}`)).json();
}

Deno.test("はじめての部屋に同時に来ても、サンプルは 3 件だけ入る", async () => {
  const room = newRoom();
  await Promise.all(
    Array.from({ length: 10 }, () => call("GET", `/posts?room=${room}`)),
  );
  assertEquals((await list(room)).length, 3);
});

Deno.test("同時に押されたいいねを取りこぼさない", async () => {
  const room = newRoom();
  const [target] = await list(room);
  const responses = await Promise.all(
    Array.from(
      { length: 20 },
      () => call("POST", `/posts/${target.id}/like?room=${room}`),
    ),
  );
  for (const res of responses) await res.body?.cancel();
  const liked = (await list(room)).find((p) => p.id === target.id);
  assertEquals(liked?.likes, 20);
});

Deno.test("同じミリ秒に続けて送っても、送った順の逆に並ぶ", async () => {
  const room = newRoom();
  for (let i = 0; i < 20; i++) {
    await (await call("POST", `/posts?room=${room}`, {
      name: "n",
      text: `t${i}`,
    })).body?.cancel();
  }
  const texts = (await list(room)).slice(0, 20).map((p) => p.text);
  assertEquals(texts, Array.from({ length: 20 }, (_, i) => `t${19 - i}`));
});
