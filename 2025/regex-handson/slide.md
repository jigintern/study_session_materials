---
marp: true
theme: academic
paginate: true
---

<!-- _class: lead -->

# 正規表現を用いたパスワード強度チェッカーを作ってみよう

---

## 本日のゴール 🎯

正規表現が書けるようになる！

以下の正規表現が読めるようになっているはず？！

```javascript
/^(?!.*(.)\1\1)(?=.*[a-z])(?=.*[A-Z])(?=.*(?<=\d)[!@#$%^&*])
(?=.{8,}$)[a-zA-Z0-9].*[a-zA-Z0-9]$/
```

---

## もくじ

1. **導入** - 実装の流れ (5分)
2. **正規表現の基礎** - 基本構文を学ぶ (15分)
3. **レベル1-2実装** - 長さと英小文字 (15分)
4. **レベル3-4実装** - 連続文字チェックと複数条件 (20分)
5. **レベル5-6実装** - 後読みと位置指定で完成！ (25分)
6. **まとめと応用** (10分)

---

<!-- _class: lead -->

# 1. 導入

## 実装の流れ

---

<!-- _class: lead -->

## パスワードチェッカー

- レベル1: 8文字以上
- レベル2: 英小文字を含む
- レベル3: 連続する同じ文字が3つ以上ない
- レベル4: 英大文字と数字を両方含む
- レベル5: 数字の直後に記号がある箇所を含む
- レベル6: 先頭と末尾は英数字

**順番にチェック強度を上げていく**

---

## 対応する正規表現

- レベル1-2: 量指定子と先読み
- レベル3: キャプチャグループ、後方参照、否定先読み
- レベル4: 先読みの組み合わせ
- レベル5: 後読み
- レベル6: アンカーと位置指定

正規表現を順番に学んでいきましょう！

---

## 注意

正規表現を学ぶための題材として、パスワードチェッカーを扱っています。
実際のパスワードバリデーションには、セキュリティの要件やユーザビリティを考慮する必要があります。

---

<!-- _class: lead -->

# 2. 正規表現の基礎

## 基本構文を学ぶ

- メタ文字
- 文字クラス
- 先読み

---

## 正規表現とは？

**Regular Expression (Regex)** - 文字列のパターンを表現する記法

### 使用例

- 📧 メールアドレスのバリデーション
- 📱 電話番号のフォーマット確認
- 🔍 ログファイルからのデータ抽出
- ✅ パスワードの強度チェック

---

## JavaScriptでの書き方

`/`で囲む、もしくは`RegExp`コンストラクタを使用

```javascript
const patternA = /正規表現パターン/;
const patternB = new RegExp("正規表現パターン");

patternA.test("検証したい文字列"); // true or false
```

```javascript
// 例: 3文字以上の英小文字にマッチ
const regex = /^[a-z]{3,}$/;
console.log(regex.test("abc")); // true
```

---

## 基本的なメタ文字

| メタ文字 | 意味              | 例                               |
| -------- | ----------------- | -------------------------------- |
| `.`      | 任意の1文字       | `/a.c/` → "abc", "a9c"           |
| `*`      | 0回以上の繰り返し | `/ab*/` → "a", "ab", "abb"       |
| `+`      | 1回以上の繰り返し | `/ab+/` → "ab", "abb"            |
| `?`      | 0回または1回      | `/ab?/` → "a", "ab"              |
| `{n}`    | ちょうどn回       | `/a{3}/` → "aaa"                 |
| `{n,}`   | n回以上           | `/a{2,}/` → "aa", "aaa"          |
| `{n,m}`  | n回以上m回以下    | `/a{2,4}/` → "aa", "aaa", "aaaa" |

---

## メタ文字を使ってみよう

### `project/password-checker.js` を開く

`checkLevel1`に正規表現を書いてみよう！

```javascript
export function checkLevel1(password) {
  return /a{4}/.test(password); // 例えば、aが4回連続するかチェック
}
```

色々書いて試してみよう！

---

## 文字クラス

**角括弧 `[]` で文字の集合を指定**

| パターン   | 意味                 | 例                        |
| ---------- | -------------------- | ------------------------- |
| `[abc]`    | a, b, c のいずれか   | `/[abc]/` → "a", "b", "c" |
| `[a-z]`    | 英小文字             | `/[a-z]/` → "a", "m", "z" |
| `[A-Z]`    | 英大文字             | `/[A-Z]/` → "A", "M", "Z" |
| `[0-9]`    | 数字                 | `/[0-9]/` → "0", "5", "9" |
| `[a-zA-Z]` | 英字（大文字小文字） | `/[a-zA-Z]/` → "a", "Z"   |

---

## 文字クラスを使ってみよう

`checkLevel1`に正規表現を書いてみよう！

```javascript
export function checkLevel1(password) {
  return /[a-zA-Z0-9]{8,}/.test(password); // 例えば、英数字が8文字以上かチェック
}
```

色々書いて試してみよう！

---

## 先読み

**文字列が特定のパターンを含むかチェック**

### 肯定先読み `(?=パターン)`

文字列が指定のパターンを**含む**ことを確認

```javascript
/(?=.*[a-z])/.test("Pass")  // true (英小文字を含む)
/(?=.*[a-z])/.test("PASS")  // false (英小文字を含まない)
```

肯定先読みの「肯定」: `===`のイメージ。反対に「否定」は`!==`のイメージ。

---

## 先読みの特徴

### マッチ位置が進まない

例えば、小文字を含む && 4文字以上のパターンが書ける。

```javascript
/(?=.*[a-z]).{4}/.test("Pass"); // true
```

### 複数の条件を組み合わせられる

```javascript
/(?=.*[a])(?=.*[b])/.test("ab"); // true
/(?=.*[a])(?=.*[B])/.test("ab"); // false
```

---

<!-- _class: lead -->

# 3. レベル1-2実装

## 長さチェック & 英小文字

---

## レベル1: 8文字以上かチェック

### 条件

- パスワードが8文字以上であること

---

## レベル1: 実装してみよう

### ファイル: `project/password-checker.js`

```javascript
export function checkLevel1(password) {
  return /(?!)/.test(password);
}
```

- パスワードが8文字以上であること

---

## レベル1: テストしてみよう

### ブラウザで確認

1. `deno run --allow-read --allow-net server.deno.js`
2. `localhost:8080/test-runner.html` にアクセス
3. 「テスト実行」をクリック、レベル1のテストが通ること

### または Deno でテスト

```bash
deno test project/password-checker.test.js -- --level=1
```

---

## レベル1: 答え合わせ

```javascript
export function checkLevel1(password) {
  return /.{8,}/.test(password);
}
```

- `.` : 任意の1文字
- `{8,}` : 8回以上の繰り返し

---

## レベル2: 英小文字を含む

### 条件

- 8文字以上
- **英小文字を1文字以上含む**

---

## レベル2: 実装してみよう

```javascript
export function checkLevel2(password) {
  return /(?!)/.test(password); // TODO
}
```

---

## レベル2: テストしてみよう

### ブラウザで確認

1. `deno run --allow-read --allow-net server.deno.js`
2. `localhost:8080/test-runner.html` にアクセス
3. 「テスト実行」をクリック、レベル2のテストが通ること

### または Deno でテスト

```bash
deno test project/password-checker.test.js -- --level=2
```

---

## レベル2: 答え合わせ

```javascript
export function checkLevel2(password) {
  return /(?=.*[a-z]).{8,}/.test(password);
}
```

- `(?=.*[a-z])`
  1. `.*` で任意の文字を0文字以上スキップ
  2. `[a-z]` 英小文字が1つ以上あればマッチ
  3. 位置は最初に戻る（先読みなので）
- `.{8,}`
  - 8文字以上をチェック

---

<!-- _class: lead -->

# 4. レベル3-4実装

## 連続文字チェックと複数条件

---

## レベル3: 連続する同じ文字が3つ以上ない

### 条件

- 8文字以上
- 英小文字を含む
- **連続する同じ文字が3つ以上ない**

### 例

- `Paaassword1` ❌ (aが3回連続)
- `Password11` ✅ (2回までOK)

---

## レベル3: 新しいテクニック

### キャプチャグループ `( )`

### 後方参照 `\1`

```javascript
(.)\1\1  // 同じ文字が3回連続
```

- `(.)` : 任意の1文字をキャプチャ
- `\1` : キャプチャした文字への後方参照
- `(.)\1` = 同じ文字2回、`(.)\1\1` = 同じ文字3回

---

### 否定先読み `(?!パターン)`

文字列が指定のパターンを**含まない**ことを確認

```javascript
/(?!.*[a-z])/.test("Pass")  // false (英小文字を含む)
/(?!.*[a-z])/.test("PASS")  // true (英小文字を含まない)
```

肯定先読み「`(?=パターン)`」の反対。

---

## レベル3: 実装してみよう

```javascript
export function checkLevel3(password) {
  return /(?!)/.test(password); // TODO
}
```

- **連続する同じ文字が3つ以上ない**

---

## レベル3: テストしてみよう

### ブラウザで確認

1. `deno run --allow-read --allow-net server.deno.js`
2. `localhost:8080/test-runner.html` にアクセス
3. 「テスト実行」をクリック、レベル3のテストが通ること

### または Deno でテスト

```bash
deno test project/password-checker.test.js -- --level=3
```

---

## レベル3: 答え合わせ

```javascript
export function checkLevel3(password) {
  return /^(?!.*(.)\1\1)(?=.*[a-z]).{8,}$/.test(password);
}
```

- `^` : 文字列の開始
- `(?!.*(.)\1\1)` : 連続3文字がないことを確認（否定先読み）
- `(?=.*[a-z])` : 英小文字を含む（肯定先読み）
- `.{8,}` : 8文字以上
- `$` : 文字列の終了

---

## レベル4: 英大文字と数字を両方含む

### 条件

- 8文字以上
- 英小文字を含む
- 連続する同じ文字が3つ以上ない
- **英大文字を含む**
- **数字を含む**

---

## レベル4: ポイント

### 文字クラスのショートハンド

みじかく書けます。

- `\d` : 数字 = `[0-9]`
- `\w` : 英数字とアンダースコア = `[a-zA-Z0-9_]`
- `\s` : 空白文字

---

## レベル4: 実装してみよう

```javascript
export function checkLevel4(password) {
  return /(?!)/.test(password); // TODO
}
```

- レベル3の条件に加えて
- **英大文字を含む**
- **数字を含む**

---

## レベル4: テストしてみよう

### ブラウザで確認

1. `deno run --allow-read --allow-net server.deno.js`
2. `localhost:8080/test-runner.html` にアクセス
3. 「テスト実行」をクリック、レベル4のテストが通ること

### または Deno でテスト

```bash
deno test project/password-checker.test.js -- --level=4
```

---

## レベル4: 答え合わせ

```javascript
export function checkLevel4(password) {
  return /^(?!.*(.)\1\1)(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}
```

- `(?=.*[A-Z])` : 英大文字を含む（肯定先読み）
- `(?=.*\d)` : 数字を含む（肯定先読み）
- `^(?!.*(.)\1\1)(?=.*[a-z]).{8,}$`: 他はレベル3と同様

---

<!-- _class: lead -->

# 5. レベル5-6実装

## 後読みと位置指定で完成

---

## レベル5: 数字の直後に記号がある箇所を含む

### 条件

- 8文字以上
- 英小文字を含む
- 連続する同じ文字が3つ以上ない
- 英大文字を含む
- 数字を含む
- **数字の直後に記号がある箇所を含む**

---

## レベル5: 新しいテクニック

### 肯定後読み `(?<=パターン)`

```javascript
/(?<=\d)[$]/.test("5$"); // true (直前が数字)
```

- `(?<=\d)` : 直前が数字であることを確認（後読み）
- `[$]` : 記号 `$`にマッチ

---

## レベル5: 実装してみよう

```javascript
export function checkLevel5(password) {
  return /(?!)/.test(password); // TODO
```

- レベル4の条件に加えて
- **数字の直後に記号がある箇所を含む**

---

## レベル5: テストしてみよう

### ブラウザで確認

1. `deno run --allow-read --allow-net server.deno.js`
2. `localhost:8080/test-runner.html` にアクセス
3. 「テスト実行」をクリック、レベル5のテストが通る

### または Deno でテスト

```bash
deno test project/password-checker.test.js -- --level=5
```

---

## レベル5: 答え合わせ

```javascript
export function checkLevel5(password) {
  return /^(?!.*(.)\1\1)(?=.*[a-z])(?=.*[A-Z])(?=.*(?<=\d)[!@#$%^&*]).{8,}$/
    .test(password);
}
```

- `(?=.*(?<=\d)[!@#$%^&*])` : 数字の直後に記号がある箇所を含む
  - `(?=.*...)` : 先読みで存在確認
  - `(?<=\d)[!@#$%^&*]` : 直前が数字の記号
- 他はレベル4と同様

---

## レベル6: 先頭と末尾は英数字

- レベル5の全条件
- **先頭が英数字**
- **末尾が英数字**

### 例

- `aPassword1!b` ✅ (a...b)
- `!Password1` ❌ (先頭が記号)
- `Password1!` ❌ (末尾が記号)

---

## レベル6: アンカーと位置指定

### アンカー

```javascript
^     // 文字列の開始
$     // 文字列の終了
```

### 先頭と末尾を指定

```javascript
^[a-zA-Z0-9]  // 先頭が英数字
[a-zA-Z0-9]$  // 末尾が英数字
```

---

## レベル6: 正規表現

```javascript
/^(?!.*(.)\1\1)(?=.*[a-z])(?=.*[A-Z])(?=.*(?<=\d)[!@#$%^&*])(?=.{8,}$)[a-zA-Z0-9].*[a-zA-Z0-9]$/;
```

### ポイント

- アサーションを先に配置して全体をチェック
- `(?=.{8,}$)` : 全体が8文字以上
- `[a-zA-Z0-9]` : 先頭が英数字（実際にマッチ）
- `.*` : 任意の文字列
- `[a-zA-Z0-9]$` : 末尾が英数字（実際にマッチ）

---

## レベル6: 実装してみよう

```javascript
export function checkLevel6(password) {
  // TODO: ここに正規表現を実装
  return false;
}
```

### 実装

```javascript
export function checkLevel6(password) {
  return /^(?!.*(.)\1\1)(?=.*[a-z])(?=.*[A-Z])(?=.*(?<=\d)[!@#$%^&*])(?=.{8,}$)[a-zA-Z0-9].*[a-zA-Z0-9]$/
    .test(password);
}
```

---

## レベル6: テストしてみよう

### テストケース

```javascript
checkLevel6("Pass1!word"); // true  ✅
checkLevel6("aPassword1!b"); // true  ✅
checkLevel6("Password1!"); // false (末尾が記号)
checkLevel6("!Password1"); // false (先頭が記号)
```

### ブラウザで確認

1. `project/test-runner.html` を開く
2. 「テスト実行」をクリック
3. レベル6のテストが通るか確認

---

## 完成したチェッカー

```javascript
export function checkLevel1(password) {
  return /.{8,}/.test(password);
}

export function checkLevel2(password) {
  return /(?=.*[a-z]).{8,}/.test(password);
}

export function checkLevel3(password) {
  return /^(?!.*(.)\1\1)(?=.*[a-z]).{8,}$/.test(password);
}

export function checkLevel4(password) {
  return /^(?!.*(.)\1\1)(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

export function checkLevel5(password) {
  return /^(?!.*(.)\1\1)(?=.*[a-z])(?=.*[A-Z])(?=.*(?<=\d)[!@#$%^&*]).{8,}$/
    .test(password);
}

export function checkLevel6(password) {
  return /^(?!.*(.)\1\1)(?=.*[a-z])(?=.*[A-Z])(?=.*(?<=\d)[!@#$%^&*])(?=.{8,}$)[a-zA-Z0-9].*[a-zA-Z0-9]$/
    .test(password);
}
```

---

## 💻 ハンズオン (20分)

### やること

1. `checkLevel5` を実装
   - 後読みに挑戦！
2. `checkLevel6` を実装
   - 全ての条件を統合しよう
3. 全テストが通ることを確認
4. `index.html` で色々なパスワードを試してみよう！
   - 弱いパスワード → 強いパスワードへの変化
   - どの条件が足りないか視覚的に確認

---

<!-- _class: lead -->

# 6. まとめと応用

---

## 今日学んだこと

### 正規表現の基礎

- ✅ メタ文字と量指定子
- ✅ 文字クラス `[a-z]`, `[0-9]`、ショートハンド `\d`
- ✅ 先読み `(?=...)` と否定先読み `(?!...)`
- ✅ 後読み `(?<=...)`
- ✅ キャプチャグループ `(.)` と後方参照 `\1`
- ✅ アンカー `^` と `$`

### パスワード強度チェッカー

- ✅ 段階的な条件追加（6レベル）
- ✅ 複数のアサーションの組み合わせ
- ✅ 実践的なバリデーション

---

## 応用例: パスワード強度の点数化

```javascript
function getPasswordStrength(password) {
  let score = 0;
  if (/.{8,}/.test(password)) score++;
  if (/(?=.*[a-z])/.test(password)) score++;
  if (/(?=.*[A-Z])/.test(password)) score++;
  if (/(?=.*[0-9])/.test(password)) score++;
  if (/(?=.*[!@#$%^&*])/.test(password)) score++;

  const labels = ["非常に弱い", "弱い", "普通", "強い", "非常に強い"];
  return { score, label: labels[score] };
}

getPasswordStrength("password"); // { score: 1, label: '弱い' }
getPasswordStrength("Password1!"); // { score: 5, label: '非常に強い' }
```

---

## 応用例: NGパターンのチェック

```javascript
// 連続した文字のチェック
/(.)\1{2,}/.test("aaa")          // true (3文字以上連続)
/(.)\1{2,}/.test("password")     // false

// 連続した数字のチェック
/012|123|234/.test("abc123def")  // true
/012|123|234/.test("password")   // false

// 辞書攻撃対策
const commonPasswords = ['password', 'admin', '123456'];
commonPasswords.includes(password.toLowerCase())
```

---

## さらに学ぶには

### 📚 正規表現の学習リソース

- [MDN Web Docs - 正規表現](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Regular_Expressions)
- [regex101.com](https://regex101.com/) - 正規表現のテストツール
- [正規表現チェッカー](https://regexper.com/) - 視覚化ツール

### 🔐 セキュリティの学習

- OWASP パスワード管理ガイドライン
- 多要素認証 (MFA) の重要性

---

## よくある質問

### Q1: パスワードは何文字が適切？

**A:** 最低8文字、推奨は12文字以上

### Q2: 記号は必須？

**A:** 強度を上げるため推奨。ただし覚えやすさも重要

### Q3: 正規表現は難しい？

**A:** 慣れです！今日のように段階的に学べば理解できます

---

<!-- _class: lead -->

# お疲れさまでした！ 🎉

## 質問タイム

---

## 参考: 正規表現クイックリファレンス

| パターン  | 意味           |
| --------- | -------------- |
| `.`       | 任意の1文字    |
| `*`       | 0回以上        |
| `+`       | 1回以上        |
| `?`       | 0回または1回   |
| `{n,m}`   | n回以上m回以下 |
| `[a-z]`   | 英小文字       |
| `[A-Z]`   | 英大文字       |
| `[0-9]`   | 数字           |
| `(?=...)` | 肯定先読み     |

---

## 次のステップ

### 🚀 チャレンジ課題

1. 最小文字数を変更できるようにする
2. カスタム記号を許可する
3. パスワードの複雑さをスコアで表示
4. リアルタイムでヒントを表示

### 📱 実践

- 自分のプロジェクトに組み込んでみよう
- フォーム入力のバリデーションに応用

---

<!-- _class: lead -->

# ありがとうございました

**Happy Coding! 💻**
