import { assertEquals } from "jsr:@std/assert";

const { checkLevel1, checkLevel2, checkLevel3, checkLevel4, checkLevel5 } =
  await import("./password-checker.js");

// ====================================
// パラメータ化テストケース定義
// ====================================

// レベル1: 8文字以上
const level1TestCases = [
  { password: "abcdefgh", description: "ちょうど8文字", expected: true },
  { password: "abcdefg", description: "7文字", expected: false },
  { password: "", description: "空文字", expected: false },
  {
    password: "verylongpassword123",
    description: "長い文字列",
    expected: true,
  },
];

// レベル2: 8文字以上 AND 英小文字を含む
const level2TestCases = [
  { password: "abcdefgh", description: "8文字の英小文字のみ", expected: true },
  {
    password: "ABCDEFGH",
    description: "8文字の英大文字のみ（英小文字なし）",
    expected: false,
  },
  {
    password: "12345678",
    description: "8文字の数字のみ（英小文字なし）",
    expected: false,
  },
  {
    password: "abcdefg",
    description: "7文字の英小文字（8文字未満）",
    expected: false,
  },
  {
    password: "Abcdefgh",
    description: "8文字で英小文字を含む",
    expected: true,
  },
];

// レベル3: 8文字以上 AND 英小文字を含む AND 連続する同じ文字が3つ以上ない
const level3TestCases = [
  { password: "password", description: "連続なし", expected: true },
  { password: "Password111", description: "1が3回連続", expected: false },
  { password: "Paaaassword1", description: "aが4回連続", expected: false },
  { password: "Paaword11", description: "2回までOK", expected: true },
  { password: "aaa", description: "3文字連続（8文字未満）", expected: false },
  { password: "abcdefgh", description: "連続なしの8文字", expected: true },
];

// レベル4: レベル3 AND 英大文字を含む AND 数字を含む
const level4TestCases = [
  {
    password: "Password1",
    description: "英大文字+英小文字+数字",
    expected: true,
  },
  { password: "Password", description: "数字なし", expected: false },
  { password: "password1", description: "大文字なし", expected: false },
  { password: "Password111", description: "1が3回連続", expected: false },
  {
    password: "Pass1word",
    description: "すべての条件を満たす",
    expected: true,
  },
];

// レベル5: レベル4 AND 数字の直後に記号がある
const level5TestCases = [
  { password: "Pass1!word", description: "1の直後に!", expected: true },
  { password: "P1@ssword", description: "1の直後に@", expected: true },
  { password: "Password1!", description: "1の直後に!", expected: true },
  { password: "!Password1", description: "記号の後に数字", expected: false },
  { password: "Pass1word", description: "記号がない", expected: false },
  { password: "Pass1#word", description: "1の直後に#", expected: true },
];

// ====================================
// パラメータ化テストの実行
// ====================================

const testSuites = {
  level1: { cases: level1TestCases, checkFunc: checkLevel1 },
  level2: { cases: level2TestCases, checkFunc: checkLevel2 },
  level3: { cases: level3TestCases, checkFunc: checkLevel3 },
  level4: { cases: level4TestCases, checkFunc: checkLevel4 },
  level5: { cases: level5TestCases, checkFunc: checkLevel5 },
};

// コマンドライン引数の解析（Deno環境のみ）
let targetLevels = ["level1", "level2", "level3", "level4", "level5"];
if (Deno.args.length > 0) {
  for (let i = 0; i < Deno.args.length; i++) {
    const arg = Deno.args[i];
    // --level=N の形式をチェック
    const levelMatch = arg.match(/--level=(\d+)/);
    if (levelMatch) {
      const levelNum = levelMatch[1];
      targetLevels = [`level${levelNum}`];
      console.log(`レベル${levelNum}のテストのみを実行します\n`);
      break;
    }
  }
}

// レベルごとにパラメータ化テストを実行
targetLevels.forEach((level) => {
  const suite = testSuites[level];
  if (!suite) return;

  const levelNum = level.replace("level", "");
  const { cases, checkFunc } = suite;

  cases.forEach(({ password, description, expected }) => {
    Deno.test(
      `【レベル${levelNum}】"${password}" (${description}): ${
        expected ? "true" : "false"
      }`,
      () => {
        assertEquals(
          checkFunc(password),
          expected,
          `"${password}" (${description}) のレベル${levelNum}チェック`,
        );
      },
    );
  });
});
