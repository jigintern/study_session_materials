import { HandlerContext } from "$fresh/server.ts";

// Jokes courtesy of https://punsandoneliners.com/randomness/programmer-jokes/
const JOKES = [
  'トマトを食べるの　ちょっと待っとって',
  'お金を取られた　おっかねー',
  'スイカを積んだ　せんすいかん',
  'トイレでバッタが　ふんばった',
  'このアジ　とっても味がある',
  '鯛の刺身が　食べたいな'
];

export const handler = (_req: Request, _ctx: HandlerContext): Response => {
  const randomIndex = Math.floor(Math.random() * JOKES.length);
  const body = JOKES[randomIndex];
  return new Response(body);
};
