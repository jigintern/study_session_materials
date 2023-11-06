
## はじめに
今回の勉強会では[Deno Fresh](https://fresh.deno.dev/)を用いて簡単なWebサイトを作成しようと思います！

Deno Freshとは
> Deno FreshはJavaScriptとTypeScriptの開発者向けのフルスタックのモダンなWebフレームワーク  
> 引用: [公式サイト](https://fresh.deno.dev/)より

です。

VueやReact、Angularなどは主にクライアント側のコードを扱うフレームワークで、ExpressやNestJS、Fastifyなどは主にサーバー側のコードを扱うものでした。

Deno Freshはサーバー側のコードとクライアント側のコードのその両方を扱えるフルスタックWebフレームワークです。

サーバーサイドレンダリング(SSR)という技術を採用しています。

サイトにアクセスされコンテンツのGETリクエスト来た時に、描画の際に必要なAPI通信, データベースへのアクセス等々をサーバー側で行ってしまい、それをDOMに反映させた状態のHTMLをクライアント側に返すようになっています。

つまり、サーバーから返されるのHTML, CSS, JavaScriptのみです。

しかも、描画に必要なAPIリクエスト等は既に済んでいるため、JavaScriptに含まれる処理はユーザー操作に対応するもののみとなり、サイズが小さくなり初期描画速度が高速になります。

Deno Freshというフレームワークを導入することで、以下のような利点があります。
1. プロジェクトの作成が簡単
2. クライアント側のコードもTypeScript(Preact)でかける
3. パフォーマンス性の高いページを作成可能
4. Deno Deployにてデプロイが簡単にできる

## 今回の目標

1. Deno Freshのプロジェクトを作成できる
2. Deno Freshプロジェクトのファイル構造がわかる
3. Deno Freshでの開発の仕方が少しわかる

## Deno Freshのプロジェクトを作成

### 準備

まずDenoが入っていることを確かめましょう。

```sh
$ deno --verion

// 出力 (自分の場合)
deno 1.36.0 (release, aarch64-apple-darwin)
v8 11.6.189.12
typescript 5.1.6
```

Denoが既に入っている人はバージョンを最新のものにあげておきましょう。

```sh
$ deno upgrade

// 出力 (自分の場合)
deno 1.36.0 (release, aarch64-apple-darwin)
v8 11.6.189.12
typescript 5.1.6
fujii@tcp0281 study_session_materials % deno upgrade
Looking up latest version
Found latest version 1.37.2
Downloading https://github.com/denoland/deno/releases/download/v1.37.2/deno-aarch64-apple-darwin.zip
Deno is upgrading to version 1.37.2
Archive:  /var/folders/91/2_7s_3351gs8xhhx7wgs08js4498z5/T/.tmpk7JJBV/deno.zip
  inflating: deno
Upgraded successfully
Release notes: https://github.com/denoland/deno/releases/tag/v1.37.2
Blog post: https://deno.com/blog/v1.37
```

Denoがインストールされていない人は[こちら](https://docs.deno.com/runtime/manual/getting_started/installation)を参考にインストールしましょう。

準備ができたら、新規にフォルダを作成してもよいところにカレントディレクトリを移動しましょう。

### Deno Freshプロジェクトを作成する

以下のコマンドを実行してDeno Freshのプロジェクトを作成しましょう。

```sh
$ deno run -A -r https://fresh.deno.dev
```

これを実行すると以下の表示が出るので、プロジェクト名(フォルダ名)を指定しましょう。特に気にしない場合はそのままエンターしてもらっても大丈夫です。

```sh
  🍋 Fresh: the next-gen web framework.  

Project Name [fresh-project]
```

次に以下のような表示が出ると思いますが、これは[Tailwind CSS](https://tailwindcss.com/)をサポートしていますが使用しますか？というものです。

一旦`y`にしておきましょう。

```sh
Fresh has built in support for styling using Tailwind CSS. Do you want to use this? [y/N]
```

VSCodeを使用しているのであれば、`y`を押しましょう。
```sh
Do you use VS Code? [y/N]
```

最後に以下の表示が出れば成功です！簡単にプロジェクトを作成することができました！

```sh
The manifest has been generated for 5 routes and 1 islands.

Project initialized!

Enter your project directory using cd fresh-project.
Run deno task start to start the project. CTRL-C to stop.

Stuck? Join our Discord https://discord.gg/deno

Happy hacking! 🦕
```

VSCodeでフォルダを開いてみると以下のようになっていると思います。

<img src="./imgs/スクリーンショット01.png">


最後に、次のコマンドを実行してDeno Freshのプロジェクトを立ち上げてみましょう。

```sh
$ deno task start

// 出力
Task start deno run -A --watch=static/,routes/ dev.ts
Watcher Process started.
The manifest has been generated for 5 routes and 1 islands.

 🍋 Fresh ready
    Local: http://localhost:8000/
```

`http:\//localhost:8000/`を見てみて、この画面が表示されたらOKです！

<img src="./imgs/スクリーンショット02.png" />

## フォルダのかるーい説明

青の枠で書かれた部分がサーバー側のコードで、赤の枠で書かれた部分がクライアント側のコードになっています。

<img src="./imgs/スクリーンショット03.png" />

- クライアント側
  - static/
    - アイコンや画像などを置いておくフォルダ
  - component/
    - ユーザー操作がないコンポーネント
  - islands/
    - ユーザー操作を含むコンポーネント
- サーバー側
  - main.ts, dev.ts
    - サーバーを立ち上げるときに実行されるファイルで、本番はmain.ts, 開発ではdev.tsを実行している
  - routes
    - アクセスされたURLに応じて、表示する画面やAPI処理を行っている

`component/`と`island/`という2つのフォルダについて説明します。

Deno Freshがアイランドアーキテクチャを採用しています。

先ほど

> つまり、サーバーから返されるのはHTML, CSS, JavaScriptのみです。

クライアント側にJavaScriptファイルを返す必要があるコンポーネントかどうかは、そのコンポーネントが`island/`フォルダ下にあるか否かで判断しています。

よって、購入ボタンやカルーセルなどの動的な処理があるコンポーネントは、`island/`フォルダに入れる必要があります。

逆に`component/`には動的な処理が必要のないコンポーネントが入ります。

逆に`component/`には動的な処理が必要のないコンポーネントを入れていくと良さそうです。

## routes/index.tsxを覗いてみる

表示されている画面には

> Try updating this message in the./routes/index.tsx file, and refresh.

と書かれています。  
この文章をプロジェクト内で検索してみると、トップ画面に該当するファイルは`./routes/index.tsx`であるとわかります。  
では、`./routes/index.tsx`ファイルを覗いてみましょう。

```ts
export default function Home() {
  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/logo.svg"
          width="128"
          height="128"
          alt="the Fresh logo: a sliced lemon dripping with juice"
        />
        <h1 class="text-4xl font-bold">Welcome to Fresh</h1>
        <p class="my-4">
          Try updating this message in the
          <code class="mx-2">./routes/index.tsx</code> file, and refresh.
        </p>
      </div>
    </div>
  )
}
```

`Home`関数の返り値を見てみるとHTMLのようなコードが返っていることがわかると思います。

TypeScriptやJavaScriptファイル内にHTMLのようなコードを記述できるようにTypeScriptやJavaScriptの構文を拡張したものをTSX（TypeScript XML）やJSX（JavaScript XML）と言います。

拡張子はTSXの場合は「`.tsx`」、JSXの場合は「`.jsx`」になります。

Deno Freshではクライアント側の処理で、[React](https://react.dev/)というwebフレームワークから派生した[Preact](https://preactjs.com/)をというものを採用しており、TSXの構文を用いて記述します。

またHTML内のClassの文字列は[Tailwind](https://tailwindcss.com/)というCSSフレームワークのものです。

このTSX記法やPreactやTailwindに関しては今回の勉強会では省略します。

## routes/フォルダの仕組み

ここでDeno Freshの特徴的な機能の一つである、ファイルシステムベースのルーティングについて説明します。

Deno Freshは`routes/`の階層(パス)がそのままAPIリクエストのパスに対応しています。

つまりAPIリクエストのパスが
- `/`の時は`routes/index.tsx`を見に行く
- `/hello`の時は`routes/hello.tsx`見に行く
- `/api/joke`の時は`routes/joke.ts`を見に行く
- `/greet/:name`の時は`/routes/greet/[name].tsx`を見に行く

ようになっています。
ルーティングがファイル構造とマッチしていることで、パスと対応するファイルの関係がわかりやすいですね。

詳しくは[こちら](https://fresh.deno.dev/docs/concepts/routing)

## .tsxファイル内の基本的な書き方

Deno Freshはサーバーサイドレンダリングを採用しているので、書き方が特殊です。

基本的には、以下のようになっています。
```ts
/** APIリクエストが届いたときに、そのままレスポンスを返したい場合 */
export const handler: Handlers<ExampleType> = {
  async GET(_req, ctx) {
    // GET リクエストに対する処理を行う

    // レスポンスを返す
    return Response('ok!');
  },
};

-----------------------------------------------

/** APIリクエストが届いたときに、別途定義したコンポーネントをレンダリングして返したい場合 */
export const handler: Handlers<ExampleType> = {
  // GETリクエスト
  async GET(_req, ctx) {
    // 描画前に行いたい処理を行う (データベース接続等々)
    const data = getData()

    // 描画時に必要な情報を引数として渡す
    return ctx.render(data);
  },
};

/** コンポーネント */
export default function Page(ctx: PageProps<ExampleType>) {
  // handlerから渡されたデータを取り出す。
  const { data } = ctx;

  // クライアント側で行いたい処理 (APIリクエスト)

  return (
    <>
      // DOM
    </>
  )
}
```

`handler`オブジェクトで`GET`や`POST`関数を定義することでそのリクエストに対する処理を実装できます。

APIリクエストが届いた時の処理は以下のようになります。
1. `handler`オブジェクト内に受け取ったAPIリクエストにマッチするハンドラーがあればそのハンドラー内の処理を実行する
2. そのままレスポンスを返却したい場合は返り値を`return Response(data)`にする
3. HTMLを返却したい場合は`return ctx.render()`でそのファイル内で別途定義してあるコンポーネントをレンダリングしたものを返す。

`handler`を特別用意しなくても、デフォルトではコンポーネントをレンダリングするだけのデフォルトハンドラが用意されているので、APIリクエストが届いてもコンポーネントがレンダリングされて返されます。

> By default, all routes that don’t define a custom handler use a default handler that just renders the page component.

> 引用: [公式サイト](https://fresh.deno.dev/docs/getting-started/custom-handlers)より

## 新しい画面を作成してみよう

上のセクションのファイルシステムベースのルーティングを考慮して新規の画面を作成してみましょう。

1. `routes/`に`hello.tsx`というファイルを作成しよう

2. `hello.tsx`にコードを書こう

```ts
export default function Hello() {
  // htmlのコードをtypescriptのコードの中に入れることができる
  return (
    <>
        <h1>Hello</h1>
    </>
  );
}
```

3. ブラウザで`http:\//localhost:8000/hello`にアクセスしよう

以下の画面が表示されれば問題なく新規の画面が追加できています。

(左上に小さく「Hello」の文字が表示されています。)

<img src="./imgs/スクリーンショット04.png" />

このように、`routes/`にファイルを追加することで簡単に新規の画面を作成することができます。

## コンポーネント側でAPIを叩いてみよう

1. `hello.tsx`を以下のように改良してみよう

```ts
export default async function Hello() {
  // APIリクエストを実行
  const res = await fetch('/api/joke')
  // レスポンスのテキストを取り出す
  const joke = await res.text()

  return (
    <>
        <h1>joke: { joke }</h1>
    </>
  );
}
```

すると以下のようにジョークが表示されていると思います。

<img src="./imgs//スクリーンショット05.png" />

APIリクエスト先の`http:\//localhost:8000/api/joke`の処理は`routes/api/joke.ts`に書かれています。

```ts
export const handler = (_req: Request, _ctx: HandlerContext): Response => {
  // 配列のindexをランダム決める
  const randomIndex = Math.floor(Math.random() * JOKES.length);
  // 返すジョークを代入
  const body = JOKES[randomIndex];
  // レスポンスを返す
  return new Response(body);
};
```

JOKES配列の中にあるジョークからランダムに一つ取り出して、その文字列を返しています。

ここでクライアント側からサーバー側にAPIが叩かれていないことを確認するためにChromeのDevToolsを開いて「ネットワーク」タブが表示できたら画面をリロードして、`/api/joke`へのアクセスがないことを確認しましょう。

## ハンドラー側でAPIを叩いてコンポーネントに渡してみよう

1. `hello.tsx`を以下のように改良してみよう

```ts
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
```

するとクライアント側でAPIを叩いていた時と同様にジョークが表示されていると思います。

APIリクエストを`handler`内で実行しても同等の処理になります。しかし、`Hello`コンポーネントに引数(とその型)を用意する必要があるので、コンポーネント内で完結させることができる時は`handler`オブジェクトの`GET`や`POST`関数内でAPIを叩く処理を書くのは冗長になりがちです。

`GET`や`POST`関数内でもコンポーネント内でもAPIリクエストを実行することができますが、所管としては「`GET`や`POST`関数内ではデータベースとの通信などのコンポーネントの描画には関係のない処理を行って、コンポーネント内では描画に関係するAPIリクエストを実行する」のが良さそうです。

## サーバー側のAPIリクエスト処理を追加してみよう

ファイルシステムベースのルーティングを考慮して新規のAPIリクエスト処理を作成してみましょう。

今回は「jig.jpの勉強会へようこそ」という文言を返すような処理を書いてみましょう。

`routes/api/wellcome.ts`というファイルを作成しましょう。

APIリクエストを処理してレスポンスを返す処理は以下のようなものになります。

```ts
export const handler = (_req: Request, _ctx: HandlerContext): Response => {
  const body = /** クライアント側に返したいもの */
  return new Response(body);
};
```

よって

```ts
export const handler = (_req: Request, _ctx: HandlerContext): Response => {
  const body = 'jig.jpの勉強会へようこそ'
  return new Response(body);
};
```

のように書いて保存してみましょう。

最後に`routes/hello.tsx`内のAPIリクエストのurlを`http:\//localhost:8000/api/wellcome`に変更して文言等も以下のように調整して、保存します。

```ts
export default async function Hello() {
  const res = await fetch('/api/wellcome')
  const wellcomeMeg = await res.text()

  return (
    <>
        <h1>{ wellcomeMeg }</h1>
    </>
  );
}
```

画面に「jig.jpの勉強会へようこそ」が表示されたらOKです！

# まとめ

今回の勉強会では
- Deno Freshのプロジェクトを立ち上げる
- 新規の画面を追加する
- ページからAPIリクエストを叩いて画面にレスポンスの値を反映させる
- 新規のAPIを作成してみる

ところまでやりました。

Deno Freshには他にも重要な機能が備わっています。
- `component/`, `islands/`フォルダについて(アイランドアーキテクチャについて)
- 表示するファイルとAPIリクエストを行うファイルが全部`routes/`にあることについて (SSR、サーバーサイドレンダリングについて)

さらに理解を深めたい人は[公式Doc](https://fresh.deno.dev/docs/introduction)を覗いてみましょう

# Deno Deployでデプロイ

アプリが完成したら[Deno Deploy](https://deno.com/deploy)でデプロイしてみましょう。

Githubでリポジトリを管理していると思いますが、プライベートリポジトリであってもデプロイできます。

以下の手順でデプロイできます。
1. Deno Deployにログイン
2. ログインできたら「+ New Project」を押す
3. `Deploy your own code`の欄から自分のGitHubアカウントのデプロイしたいリポジトリを選択
4. 「Create & Deploy」でデプロイ