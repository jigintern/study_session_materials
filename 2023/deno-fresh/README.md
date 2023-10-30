
# はじめに
今回の勉強会では[Deno Fresh](https://fresh.deno.dev/)を用いて簡単なWebサイトを作成しようと思います！

Deno Freshとは
> Deno FreshはJavaScriptとTypeScriptの開発者向けのフルスタックのモダンなWebフレームワーク 

フルスタックWebフレームワークとは、バックエンドもフロントエンドもこれ一つで作れるというものです。

# 今回の目標

1. Deno Freshのプロジェクトを作成できる
2. 新規の画面を作ることができる
3. ページからAPIリクエストを叩いて、サーバー側で返されたものをページに反映させることができる

# Deno Freshのプロジェクトを作成 (準備編)

まずDenoが入っていることを確かめましょう。

```sh
$ deno --verion

// 出力 (自分の場合)
deno 1.36.0 (release, aarch64-apple-darwin)
v8 11.6.189.12
typescript 5.1.6
```

denoが入っている人はdenoのバージョンを上げてもいいかもです。

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

denoが入っていない人は[こちら](https://docs.deno.com/runtime/manual/getting_started/installation)からダウンロードしましょう。

準備ができたら、新規にフォルダを作成してもよいところにカレントディレクトリを移動しましょう。

# Deno Freshのプロジェクトを作成

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

最後に以下の表示が出れば成功です！
めっちゃ簡単にプロジェクトを作成することができました！

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

`http://localhost:8000/`を見てみて、この画面が表示されたらOKです！

<img src="./imgs/スクリーンショット02.png" />

# フォルダのかるーい説明

青の枠で書かれた部分がサーバー側のコードで、赤の枠で書かれた部分がクライアント側のコードになっています。

<img src="./imgs/スクリーンショット03.png" />

- クライアント側
  - static/
    - アイコンや画像などを置いておくフォルダ
  - component/, islands/
    - 画面に表示する部品(コンポーネント類)
- サーバー側
  - main.ts, dev.ts
    - サーバーを立ち上げるときに実行されるファイルで、本番はmain.ts, 開発ではdev.tsを実行している
  - routes
    - アクセスされたURLに応じて、表示する画面や処理を行っている

# 新しい画面を作成してみよう

1. routes/に`hello.tsx`というファイルを作成してみよう。

Deno Freshではクライアント側の処理で、[React](https://react.dev/)というwebフレームワークから派生した[Preact](https://preactjs.com/)をというものを採用しています。

拡張子が「`.tsx`」というもので、`.ts`ファイルと`.tsx`ファイルの違いは、JSXという記法ができるかどうかになります。

簡単にいうと`.ts`ファイル内でHTMLのようなコードを書けるようになったのが`.tsx`ファイルです。

2. `hello.tsx`を作成したらコードを書いてみましょう

```ts
export default function Hello() {
  return (
    <>
        <h1>Hello</h1>
    </>
  );
}
```

3. 保存したらブラウザのURLの`http://localhost:8000`に`/hello`を追記してアクセスしてみよう

以下の画面が表示されれば問題なく新規の画面が追加できています。

(左上に小さく「Hello」の文字が表示されています。)

<img src="./imgs/スクリーンショット04.png" />

まとめると、routes/にファイルを追加したら、`localhost:8000/ファイル名`でアクセスできるようになりました。

# クライアント側でAPIリクエストを送ってみよう

1. `hello.tsx`を以下のように改良してみよう

```ts
export default async function Hello() {
  // APIリクエストを実行
  const res = await fetch('http://localhost:8000/api/joke')
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

# サーバー側のAPIリクエスト処理を編集してみよう

1. `routes/api/joke.ts`を編集してみよう

ここでは`JOKES`を日本語版にしてみましょう

```ts
const JOKES = [
  'トマトを食べるの　ちょっと待っとって',
  'お金を取られた　おっかねー',
  'スイカを積んだ　せんすいかん',
  'トイレでバッタが　ふんばった',
  'このアジ　とっても味がある',
  '鯛の刺身が　食べたいな'
];
```

ファイルを保存して、再度アクセスしてみると日本語のジョークが返されていると思います。

まとめると、APIリクエストの処理は`routes/api/`にファイルを追加していきましょう。

# まとめ

Deno Freshのプロジェクトを立ち上げて、新規の画面を追加、ページからAPIリクエストを叩いて画面にレスポンスの値を反映させるところまで行うことができました。

さらに理解を深めたい人は[公式Doc](https://fresh.deno.dev/docs/introduction)を覗いてみましょう