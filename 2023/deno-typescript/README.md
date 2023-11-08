# Deno で学ぶ TypeScript

この資料は2時間で学べる内容にまとめました。
Denoの環境がPCにある前提で進めます。
本資料は、「TypeScriptは**型があって便利・安全**」が学べる内容になっています。

## 目次とめやす

- 準備（10分）
- JavaScriptは型がない（20分）
- サーバをTypeScriptで作る（20分）
- クライアントをTypeScriptで作る（30分）
- TypeScriptとは（10分）
- TypeScriptで型を作る（20分）

## 準備

### リポジトリの準備

はじめに、リポジトリを新規作成しましょう。
作成には、GitHubのテンプレート機能を使います。
以下の手順でプロジェクトを作成します。

1. GitHubでリポジトリの新規作成画面を開く
2. **Repository template**を`https://github.com/jigintern/template-deno-dev`にする
3. **Owner**を個人アカウントにする
4. **Repository name**を`deno-ts-practice`にする
5. 公開範囲をPrivateからPublicに変更

### プロジェクトの準備

VSCodeからリポジトリを開き、プロジェクトの準備をしましょう。
先程作成したリポジトリをCloneします。
GitHubDesktopなら、GitHubのページの`Open with GitHubDesktop`からでも開けます。
プロジェクトを開き、以下の手順でプロジェクトを準備します。

1. VSCodeのコマンドパレットを開く
2. **Deno: Initialize Workspace Configuration**を実行
3. 設定のダイアログはすべてYesを選択

これで準備完了です。
次に、プロジェクトが動作することを確認しましょう。
以下の手順で動作を確認します。

1. ターミナルを開き、`deno run -A --watch server.deno.js`を実行
2. ブラウザを開き、`localhost:8000`にアクセス

ブラウザでは、`index.html`の内容が表示されることを確認しましょう。
サーバでは、エラーになっていないことを確認しましょう。

これで、準備がすべて完了しました。
次章では、JavaScriptの振る舞いを見ていきましょう。

## JavaScriptは動的型付き

JavaScriptが動的型付き言語として動作することを見ていきます。
`server.deno.js`を開きましょう。
サーバは、クライアントに`/welcome-message`で表示する内容を返しています。

### 存在しないプロパティにアクセス

まずは、存在しないプロパティにアクセスするとどうなるか見てみましょう。

`req.method`の`method`を、わざと打ち間違えてみてください。
そして、保存してサーバを更新します。
実行してみると、サーバのレスポンスがなくなり、ブラウザには`Not Found`と表示されます。

このように、JavaScriptはコードが実行されたタイミングで初めてエラーになります。
この振る舞いはJavaScriptが動的型付き言語だからです。
対して、TypeScriptは静的型付き言語です。

静的型付き言語は実行前にコンパイルという処理があります。
これらの言語は、そのプロパティがないことを教えてくれるタイミングが異なります。

- 動的型付き言語は、コードが実行されるタイミング
- 静的型付き言語は、コードをコンパイルするタイミング

つまり、静的型付き言語は**実行前に**存在しないプロパティへアクセスしていることが分かるのです。

わざと打ち間違えた`method`を元に戻しておきましょう。

### 型がないメソッドを実装

もうひとつ、JavaScriptの振る舞いを見てみましょう。
サーバに数を合計するメソッドを追加します。
以下のコードを追加しましょう。

```js
function sum(a, b) {
  return a + b;
}
```

このメソッドは数値と数値の足し算を想定したメソッドです。
では、このメソッドを使うエンドポイントを追加しましょう。
以下のコードを追加して、`GET /sum`を追加します。

```js
if (req.method === "GET" && pathname === "/sum") {
    return new Response(sum(234, 110));
}
```

簡単にするため、パラメータで値を受け取らず、適当な値を入れています。

ブラウザから`localhost:8000/sum`にアクセスします。
ブラウザに234+110の結果、344が表示されることを確認しましょう。

VSCodeに戻って、メソッド`sum`にカーソルを合わせてみましょう。
ポップアップで`function sum(a: any, b: any): any`と表示されます。

続けて、プロパティ`req.method`にカーソルを合わせてみましょう。
こちらは、`(property) Request.method: string`と表示されます。

それぞれ返り値の型について、`sum`は「any」、`req.method`は「string」となっていることが確認できます。
「any」はどんな型にもなれる型です。
Deno拡張機能が自動で型推論してくれるため、JavaScriptのコードでも型が表示されています。

このメソッドに、数字以外のデータを入れるとどうなるでしょうか。
コードを、`sum("あいう", 110)`に変更して確認してみましょう。
コードを変更した段階では、エラーになりません。
サーバを更新して、ブラウザからアクセスすると、`あいう110`と表示されます。

これは文字列と文字列の足し算として解釈されたためです。
本来`sum`は数字と数字を足し算を想定していました。
それでも、文字列が入力できてしまい、想定とは違う解釈で表示されました。

このように、実装したメソッドに型がないと想定とは違う使い方ができてしまいます。
コードは、`sum(234, 110)`に戻しておきましょう。

## サーバを TypeScript で作る

いよいよTypeScriptの出番です。
JavaScriptで書いたコードを、TypeScriptに書き直していきます。

### メソッドに型をつける

さっそく、`server.deno.js`から`server.deno.ts`に拡張子を変更しましょう。
これで、サーバのコードがTypeScriptとして認識されるようになりました。

TypeScriptにすると、`sum`メソッドでエラーになります。
これが、コードの実行前にエラーが分かるということです。
ではエラーを解決していきましょう。

`sum`メソッドのエラーは次のように表示されています。

```txt
Parameter 'a' implicitly has an 'any' type.deno-ts(7006)
Parameter 'b' implicitly has an 'any' type.deno-ts(7006)
```

「メソッドのパラメータが`any`である」ことがエラーになっています。
パラメータやメソッドには型を付与できます。
以下のコードのように、メソッドの実装を変更しましょう。

```ts
function sum(a: number, b: number): number {
  return a + b;
}
```

このように、`:`(コロン)の後ろに型を書き、`: <型名>`とすることで型を付与できます。
ここで、`number`は値型を表します。
`number`のような型はプリミティブ型と呼ばれます。

ほかにも論理型や文字列型などがあり、合わせて7種類あります。
プリミティブ型については次のサイトの説明をご覧ください。

- <https://typescriptbook.jp/reference/values-types-variables/primitive-types>

### 補完を使って型を合わせる

メソッドのエラーは解決できましたね。
変更すると、`Response`でエラーになるので解決しましょう。

Responseでは以下のエラーになっています。

```txt
Argument of type 'number' is not assignable to parameter of type 'BodyInit | null | undefined'.deno-ts(2345)
```

「`Response`の引数として、`number`は割り当てられない」ことがエラーになっています。
つまり、`Response`の引数に割り当て可能な型へ変換する必要があります。
この変換にはいくつか方法がありますが、今回は`.toString()`で文字列型に変換します。

メソッド呼び出しの閉じ括弧の後に、`.to`まで打ち込んでみましょう。
すると、ポップアップで使えるメソッドやプロパティの候補が表示されます。
これを補完と言い、型に合わせた候補を表示してくれます。
型のおかげで便利な補完が使えるのです。

この補完を使って、`.toString()`を使う実装に変更しましょう。
変更すると、以下のコードのようになります。

```js
return new Response(sum(234, 110).toString());
```

これでエラーが全て解決できました！
実行中のサーバを中断し、実行するファイルを`server.deno.ts`にして実行してみましょう。

```shell
deno run -A --watch server.deno.ts
```

実行して、JavaScriptだったコードと同じように344が表示されることを確認しましょう。

### 実装したメソッドで型エラー

JavaScriptでは、メソッドを想定とは違う使い方ができてしまう問題がありましたね。
TypeScriptではどう振る舞いが変わっているか確認してみましょう。

`sum`メソッドにわたす引数を`"あいう"`に変えてみます。
変更すると、次のエラーが表示されます。

```txt
Argument of type 'string' is not assignable to parameter of type 'number'.deno-ts(2345)
```

このように、実行する前に問題となる箇所が分かります。
これは、TypeScriptが静的型付き言語であるためです。

## クライアントを TypeScript で作る

前章では、サーバのコードをTypeScriptにしました。
本章では、クライアントのコードをTypeScriptにしてみましょう。

### サーバの準備

フロントエンドの前に、そのためのサーバを準備します。

#### sumメソッドの準備

まずは、`sum`メソッドを別ファイルにします。
`public/sum.ts`ファイルを作成し、メソッドの実装を移行します。

ほかファイルから使用できるよう、以下のように`export`しましょう。

```ts
export function sum(a: number, b: number): number {
  return a + b;
}
```

`server.deno.ts`では、`public/sum.ts`をインポートします。
これで、クライアントから`sum`メソッドを使う準備ができました。

#### フロントエンドでTypeScriptを使う準備

フロントエンドでTypeScriptを動かすには、サーバでの対応が必要です。
TypeScriptファイルを扱うことができる`ts-server`ライブラリを使います。
このライブラリからは、`serveDir`の代わりとなる`serveDirWithTs`が提供されます。
まずは`serveDir`のインポートを置き換えましょう。

```ts
import { serveDirWithTs } from "https://deno.land/x/ts_serve@v1.4.4/mod.ts";
```

次に、`serveDir`を使用していたコードも置き換えます。

```ts
return serveDirWithTs(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
```

これで、サーバの準備は完了です。
`deno run -A --watch server.deno.ts`を実行して動くことを確認しましょう。
次はクライアントの準備をします。

### クライアントの準備

クライアントのJavaScriptコードがHTMLファイル内に書かれています。
この実装をJavaScriptファイルに分けましょう。

`public/index.js`ファイルを作成します。
`index.js`には、scriptタグのコードをコピーします。

```js
const message = await fetch("/welcome-message")
document.querySelector("body").innerHTML = `<h1>${await message.text()}</h1>`
```

scriptタグは、`index.js`を読み込むよう変更します。

```html
<script type="module" src="./index.js"></script>
```

DenoのVSCode拡張がクライアントのコードをサーバのコードと解釈すると、エラーではないコードがエラーと表示されてしまいます。
`index.js`には、サーバのコードと解釈されないように一行追記します。

```js
/// <reference lib="dom"/>

const message = await fetch("/welcome-message");
document.querySelector("body").innerHTML = `<h1>${await message.text()}</h1>`;
```

一行目に追記したコメント`/// <reference lib="dom"/>`によって、間違ったエラー表示がなくなります。
サーバを更新して、変わらず`index.html`の内容が表示されることを確認しましょう。

これで、サーバ・クライアントすべての準備が完了しました。
いよいよ、クライアントをTypeScriptにしていきます。

### クライアントからTypeScriptを使う

サーバと同様に、JavaScriptファイルをTypeScriptファイルに置き換えましょう。
`index.js`から`index.ts`に拡張子を変更します。
`index.html`でインポートするファイル名も`index.ts`に変更しましょう。
これで、クライアントのコードがTypeScriptとして認識されるようになりました。

TypeScriptにすると、`querySelector`でエラーになります。
エラーは次のように表示されます。

```txt
Object is possibly 'null'.deno-ts(2531)
```

「オブジェクトがnullになる可能性がある」とエラーになっています。
`querySelector`は要素が見つからないときにnullを返します。
つまり、nullではないときだけ処理する必要があります。

それでは、要素があるときだけ処理するコードに変更しましょう。
以下のコードのように変更します。

```ts
const element = document.querySelector("body");
if (element !== null) {
  element.innerHTML = `<h1>${await message.text()}</h1>`;
}
```

これでエラーが解決できました。
if文の前の`element`にカーソルを合わせた場合と、if文の後の`element`にカーソルを合わせた場合で、表示される型が変わっています。

仮に"body"を打ち間違えても、実行したタイミングでエラーが出なくなりました。

### クライアントで別ファイルのTypeScriptを使う

`sum`メソッドをクライアントから作ってみましょう。
`index.ts`に`sum.ts`をインポートします。
コードを以下のように変更します。

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

サーバを更新して、sumの計算結果が表示されていることを確認しましょう。
クライアントからでも、`sum`メソッドの型が見えますね。

型が違っていたり、型が合っていないとエラーになることを確認してみましょう。

## まとめ

- JavaScriptは型がない。TypeScriptは型がある。
- 型があると補完があって便利。型があると実行前にエラーが分かって安全。
- Deno以外のWebフレームワークだとTSからJSへ変換が必要。
- 便利さと手軽さでトレードオフがある。

## TypeScriptとは

- 有名なページを見て学んでみよう
- サバイバルTypeScript <https://typescriptbook.jp/overview/why-you-should-use-typescript>
- TypeScript解読アシスタント <https://typescriptbook.jp/code-reading-assistant>

## 型を定義してみよう

型を自分で定義してみましょう。
string型とnumber型を持つ`User`型を定義します。

```ts
type User = {
  full_name: string;
  age: number;
};
```

自作の型でもパラメータが違ったり、型が違うとエラーになることを確認しましょう。
`sum`関数を`User`の年齢を足し算する関数に変えてみましょう。

## コラム

### anyに注意

- なんでも受け入れる魔法の型
- TSからJSのファイルを型情報なしに使うとany
- 予期せぬエラーにつながるため、anyは極力避ける
- anyにするなら、JavaScriptで書いた方が良いぐらいの気持ちで
