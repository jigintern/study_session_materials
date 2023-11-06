import { Handlers, PageProps } from "$fresh/server.ts";

export const handler: Handlers<{ joke: string }> = {
  async GET(_req, ctx) {
    // API叩く
    const res = await fetch('http://localhost:8000/api/joke')
    // レスポンスのテキストを取り出す
    const joke = await res.text()

    console.log(joke)

    // 描画時に必要な情報を引数として渡す
    return ctx.render({ joke });
  },
};

// サーバー側でAPIを叩いて、コンポーネントに渡しています
export default function Hello({ data }: PageProps<{ joke: string }>) {
  return (
    <>
        <h1>joke: { data.joke }</h1>
    </>
  );
}