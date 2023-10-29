import { serveDirWithTs } from "https://deno.land/x/ts_serve@v1.4.4/mod.ts";
import { sum } from "./public/sum.ts";

Deno.serve((req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  if (req.method === "GET" && pathname === "/sum") {
    return new Response(sum(234, 110).toString());
  }

  if (req.method === "GET" && pathname === "/welcome-message") {
    return new Response("jigインターンへようこそ！");
  }

  return serveDirWithTs(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});
