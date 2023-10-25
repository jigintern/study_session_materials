# Deno で学ぶ TypeScript

- 2 時間で学べる内容
- インターン生向け。Deno の環境はある前提
- 型があると便利で安全。を覚えてもらう

## 目次とめやす

- 最初の説明 5分
- 準備 10分
- JavaScriptは型がない 20分
- サーバをTypeScriptで作る 20分
- 休憩 5分
- クライアントをTypeScriptで作る 30分
- TypeScriptとは 10分

## 準備

- GitHub でインターンテンプレからプロジェクトを新規作成
  - <https://github.com/jigintern/template-deno-dev>
  - 名前は`deno-ts-practice`
  - jiginternからユーザの下に切り替えて作成
  - 手元にCloneする
- Deno: Initialize Workspace Configurationを全部Yesで実行
- ターミナルで、`deno run -A --watch server.deno.js`実行
- localhost:8000に立ち上がり、index.htmlが表示されることを確認
- エラーが出ていないことを確認

## JavaScriptは動的型付け

- server.deno.jsを実行
- localhost:8000にアクセス
- `/welcome-message`の内容が表示されること

### 存在しないプロパティにアクセス

- `req.method`を`req.mehtod`にわざと打ち間違えてみる
- 保存して、サーバを更新
- レスポンスがなく、`Not Found`になることを確認
- 実行してみて、初めてエラーになる
- `req.method`に戻しておく

### 型がないメソッドを実装

- 数を合計するメソッドを追加

```js
function sum(a, b) {
  return a + b;
}
```

- `/GET sum`で値を適当な値を返す

```js
if (req.method === "GET" && pathname === "/sum") {
    return new Response(sum(234, 110));
}
```

- `localhost:8000/sum`にアクセス、344が表示されること
- VSCodeでsumにカーソルを合わせて、`function sum(a: any, b: any): any`となることを確認
- 対して`req.method`は`(property) Request.method: string`と型があることを確認
- `sum("あいう", 110)`にしてみる
- コードを変更した段階では、エラーにならない
- 保存して、サーバを更新
- `localhost:8000/sum`にアクセス、あいう110と表示されること
- 動いたけど本当は数字だけを足したい。けど文字列も入力できてしまうことを確認
- `sum(234, 110)`に戻しておく

## サーバを TypeScript で作る

### メソッドに型をつける

- `server.deno.js`を`server.deno.ts`に名前を変更
- sumメソッドでエラーになること
- `Parameter 'a' implicitly has an 'any' type.deno-ts(7006)`
- sumメソッドのパラメータが`any`であることがエラー
- 引数に型を付与できる
- メソッドの返り値に型を付与できる
- sumメソッドに型をつけてみる

```js
function sum(a: number, b: number): number {
  return a + b;
}
```

- `: <型名>`で型を付与できる
- `number`は値型。プリミティブ型と呼ばれる
- プリミティブ型一覧: <https://typescriptbook.jp/reference/values-types-variables/primitive-types>

### 補完を使って型を合わせる

- Responseでもエラーになっている
- `Argument of type 'number' is not assignable to parameter of type 'BodyInit | null | undefined'.deno-ts(2345)`
- Responseの引数として、numberは割り当てられない
- 割り当て可能な型に変換が必要
- 今回は`.toString()`で文字列型に変換する

```js
return new Response(sum(234, 110).toString());
```

- ここで`.to`まで打ちこむと、候補が出てくることを確認
- この補完が便利
- 型に合わせたメソッドやプロパティの候補を表示してくれる
- `toString()`を選択して、エラーを解消する
- 実行して、JavaScriptのときと同じように344が表示されることを確認

### 実装したメソッドで型エラー

- 引数を`"あいう"`に変えてみる
- エラーになる
- `Argument of type 'string' is not assignable to parameter of type 'number'.deno-ts(2345)`
- 実行する前に問題となる箇所が分かる

## クライアントを TypeScript で作る

### サーバの準備

- フロントエンドで使うために、`sum`を別ファイルにしておく
- `public/sum.ts`を作成する
- 実装を移してexportする

```ts
export function sum(a: number, b: number): number {
  return a + b;
}
```

- serverではimportしておく
- フロントエンドでTypeScriptを動かすためにサーバに変更を加える
- TypeScriptファイルとしてServeする`ts-serve`ライブラリを使う
- インポートを`serveDir`から置き換える

```ts
import { serveDirWithTs } from "https://deno.land/x/ts_serve@v1.4.4/mod.ts";
```

- `serveDir`を使用していたコードも置き換える

```ts
return serveDirWithTs(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
```

### クライアントの準備

- index.htmlの実装をファイルに分ける
- `index.js`を作成し、scriptのコードをコピーする
- `index.js`はサーバのコードと解釈されないように、一行追記する

```js
/// <reference lib="dom"/>

const message = await fetch("/welcome-message");
document.querySelector("body").innerHTML = `<h1>${await message.text()}</h1>`;
```

- scriptタグはindex.jsを読み込むよう変更する

```html
<script type="module" src="./index.js"></script>
```

- サーバを更新して、index.htmlが表示されること

### クライアントからTypeScriptを使う

- index.jsをindex.tsにする
- エラーになる
- `querySelector`は要素が見つからないときにnullを返す
- nullチェックが必要
- 要素があるときだけ処理するコードに変更

```ts
const element = document.querySelector("body");
if (element !== null) {
  element.innerHTML = `<h1>${await message.text()}</h1>`;
}
```

### クライアントで別ファイルのTypeScriptを使う

- sumメソッドを使ってみる
- index.tsにインポートする
- 計算結果を表示する

```ts
/// <reference lib="dom"/>
import { sum } from "./sum.ts";

const message = await fetch("/welcome-message");
const element = document.querySelector("body");
if (element !== null) {
  element.innerHTML =
    `<h1>${await message.text()}</h1>` + `<p>${sum(123, 456)}</p>`;
}
```

- サーバを更新して、sumの計算結果が表示されていること
- フロントでも型が見えることを確認
- 型が違っていたり、型が合っていないとエラーになることを確認

## TypeScriptとは

- 有名なページを見て学ぶ
- サバイバルTypeScript <https://typescriptbook.jp/overview/why-you-should-use-typescript>
- TypeScript解読アシスタント <https://typescriptbook.jp/code-reading-assistant>

## まとめ

- JavaScriptは型がない。TypeScriptは型がある。
- 型があると補完があって便利。型があると実行前にエラーが分かって安全。
- Deno以外のWebフレームワークだとTSからJSへ変換が必要。
- 便利さと手軽さでトレードオフがある。

## コラム

### anyに注意

- なんでも受け入れる魔法の型
- TSからJSのファイルを型情報なしに使うとany
- 予期せぬエラーに繋がるため、anyは極力避ける
- anyにするなら、JavaScriptで書いた方が良いぐらいの気持ちで
