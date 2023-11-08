import { HandlerContext } from "$fresh/server.ts";

export const handler = (_req: Request, _ctx: HandlerContext): Response => {
    const body = 'jig.jpの勉強会へようこそ'
    return new Response(body);
  };