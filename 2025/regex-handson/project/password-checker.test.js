// テストケース: パスワード強度チェッカー
// Deno と ブラウザの両方で実行可能

// Deno環境の場合のみimport
const isDeno = typeof Deno !== "undefined";
if (isDeno) {
  const {
    checkLevel1,
    checkLevel2,
    checkLevel3,
    checkLevel4,
    checkLevel5,
    checkLevel6,
  } = await import("./password-checker.js");
  globalThis.checkLevel1 = checkLevel1;
  globalThis.checkLevel2 = checkLevel2;
  globalThis.checkLevel3 = checkLevel3;
  globalThis.checkLevel4 = checkLevel4;
  globalThis.checkLevel5 = checkLevel5;
  globalThis.checkLevel6 = checkLevel6;
}

// テスト結果を格納
const testResults = [];

function test(description, fn) {
  try {
    fn();
    testResults.push({ description, passed: true, error: null });
    if (isDeno) {
      console.log(`✓ ${description}`);
    }
  } catch (error) {
    testResults.push({ description, passed: false, error: error.message });
    if (isDeno) {
      console.error(`✗ ${description}`);
      console.error(`  ${error.message}`);
    }
  }
}

function assertEquals(actual, expected, message = "") {
  if (actual !== expected) {
    throw new Error(`${message}\n  期待値: ${expected}\n  実際の値: ${actual}`);
  }
}

// ====================================
// パラメータ化テストケース定義
// ====================================

const testCases = [
  // レベル1: 8文字以上
  {
    password: "abcdefgh",
    description: "ちょうど8文字",
    expected: {
      level1: true,
    },
  },
  {
    password: "abcdefg",
    description: "7文字",
    expected: {
      level1: false,
    },
  },
  {
    password: "",
    description: "空文字",
    expected: {
      level1: false,
    },
  },

  // レベル2: 8文字以上 AND 英小文字を含む
  {
    password: "abcdefgh",
    description: "8文字の英小文字のみ",
    expected: {
      level2: true,
    },
  },
  {
    password: "ABCDEFGH",
    description: "8文字の英大文字のみ（英小文字なし）",
    expected: {
      level2: false,
    },
  },
  {
    password: "12345678",
    description: "8文字の数字のみ（英小文字なし）",
    expected: {
      level2: false,
    },
  },
  {
    password: "abcdefg",
    description: "7文字の英小文字（8文字未満）",
    expected: {
      level2: false,
    },
  },

  // レベル3: 8文字以上 AND 英小文字を含む AND 連続する同じ文字が3つ以上ない
  {
    password: "password",
    description: "連続なし",
    expected: {
      level3: true,
    },
  },
  {
    password: "Password111",
    description: "1が3回連続",
    expected: {
      level3: false,
    },
  },
  {
    password: "Paaassword1",
    description: "aが4回連続",
    expected: {
      level3: false,
    },
  },
  {
    password: "Paaword11",
    description: "2回までOK",
    expected: {
      level3: true,
    },
  },

  // レベル4: レベル3 AND 英大文字を含む AND 数字を含む
  {
    password: "Password1",
    description: "英大文字+英小文字+数字",
    expected: {
      level4: true,
    },
  },
  {
    password: "Password",
    description: "数字なし",
    expected: {
      level4: false,
    },
  },
  {
    password: "password1",
    description: "大文字なし",
    expected: {
      level4: false,
    },
  },
  {
    password: "Password111",
    description: "1が3回連続",
    expected: {
      level4: false,
    },
  },

  // レベル5: レベル4 AND 数字の直後に記号がある
  {
    password: "Pass1!word",
    description: "1の直後に!",
    expected: {
      level5: true,
    },
  },
  {
    password: "P1@ssword",
    description: "1の直後に@",
    expected: {
      level5: true,
    },
  },
  {
    password: "Password1!",
    description: "1の直後に!",
    expected: {
      level5: true,
    },
  },
  {
    password: "!Password1",
    description: "記号の後に数字",
    expected: {
      level5: false,
    },
  },

  // レベル6: レベル5 AND 先頭と末尾は英数字
  {
    password: "Pass1!word",
    description: "P...d",
    expected: {
      level6: true,
    },
  },
  {
    password: "aPassword1!b",
    description: "a...b",
    expected: {
      level6: true,
    },
  },
  {
    password: "!Password1",
    description: "先頭が記号",
    expected: {
      level6: false,
    },
  },
  {
    password: "Password1!",
    description: "末尾が記号",
    expected: {
      level6: false,
    },
  },
];

// ====================================
// パラメータ化テストの実行
// ====================================

const checkFunctions = {
  level1: checkLevel1,
  level2: checkLevel2,
  level3: checkLevel3,
  level4: checkLevel4,
  level5: checkLevel5,
  level6: checkLevel6,
};

// コマンドライン引数の解析（Deno環境のみ）
let targetLevels = ["level1", "level2", "level3", "level4", "level5", "level6"];
if (isDeno && Deno.args.length > 0) {
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

// 各テストケースに対して全レベルのチェックを実行
testCases.forEach((testCase) => {
  const { password, description, expected } = testCase;

  // 各レベルのチェック関数を実行
  targetLevels.forEach((level) => {
    const checkFunc = checkFunctions[level];
    const expectedResult = expected[level];
    const levelNum = level.replace("level", "");

    // expected が undefined の場合はテストをスキップ
    if (expectedResult === undefined) {
      return;
    }

    test(`【レベル${levelNum}】"${password}" (${description}): ${expectedResult ? "true" : "false"}`, () => {
      assertEquals(
        checkFunc(password),
        expectedResult,
        `"${password}" (${description}) のレベル${levelNum}チェック`,
      );
    });
  });
});

// ブラウザ環境用にエクスポート
if (typeof window !== "undefined") {
  window.testResults = testResults;
  window.runTests = () => {
    testResults.length = 0; // リセット
    // 全テストを再実行（上記のtestが自動的に実行される）
  };
}

// Deno環境: テスト結果のサマリーを表示
if (isDeno) {
  const total = testResults.length;
  const passed = testResults.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log("\n========================================");
  console.log(`テスト結果: ${passed}/${total} passed`);
  if (failed > 0) {
    console.log(`Failed: ${failed}`);
    Deno.exit(1);
  }
  console.log("========================================");
}
