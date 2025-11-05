import { serveDir } from "jsr:@std/http";

Deno.serve(
  { hostname: "localhost", port: 8080 },
  (request) => {
    return serveDir(request, { fsRoot: "project" });
  },
);
