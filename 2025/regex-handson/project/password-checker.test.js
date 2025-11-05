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
  // 基本的な8文字チェック
  {
    password: "password",
    description: "8文字の英小文字のみ",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "abcdefgh",
    description: "8文字の英小文字のみ",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "pass",
    description: "8文字未満の英小文字",
    expected: {
      level1: false,
      level2: false,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "abc",
    description: "8文字未満の英小文字",
    expected: {
      level1: false,
      level2: false,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "12345678",
    description: "ちょうど8文字の数字のみ",
    expected: {
      level1: true,
      level2: false,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "",
    description: "空文字",
    expected: {
      level1: false,
      level2: false,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
    },
  },

  // 英小文字を含むパターン
  {
    password: "12345678a",
    description: "8文字以上の数字+英小文字",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "PASSWORD",
    description: "8文字の英大文字のみ",
    expected: {
      level1: true,
      level2: false,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
    },
  },

  // 英大文字+英小文字を含むパターン
  {
    password: "Password",
    description: "8文字の英大文字+英小文字",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "PASSword",
    description: "8文字の英大文字+英小文字",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "AbCdEfGh",
    description: "8文字の英大文字+英小文字（複数）",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "Pass",
    description: "8文字未満の英大文字+英小文字",
    expected: {
      level1: false,
      level2: false,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
    },
  },

  // 数字を含むパターン
  {
    password: "Password1",
    description: "9文字の英大文字+英小文字+数字",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: false,
      level6: false,
    },
  },
  {
    password: "Pass1234",
    description: "8文字の英大文字+英小文字+数字",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: false,
      level6: false,
    },
  },
  {
    password: "password1",
    description: "9文字の英小文字+数字（英大文字なし）",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "PASSWORD1",
    description: "9文字の英大文字+数字（英小文字なし）",
    expected: {
      level1: true,
      level2: false,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "Pass1",
    description: "8文字未満の英大文字+英小文字+数字",
    expected: {
      level1: false,
      level2: false,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "1Password",
    description: "9文字の数字+英大文字+英小文字（数字が先頭）",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: false,
      level6: false,
    },
  },

  // 記号を含むパターン
  {
    password: "Password1!",
    description: "10文字の英大文字+英小文字+数字+記号",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: true,
      level6: false,
    },
  },
  {
    password: "Pass1@#$",
    description: "8文字の英大文字+英小文字+数字+記号（複数記号）",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: true,
      level6: false,
    },
  },
  {
    password: "Password!",
    description: "9文字の英大文字+英小文字+記号（数字なし）",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "password1!",
    description: "10文字の英小文字+数字+記号（英大文字なし）",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "PASSWORD1!",
    description: "10文字の英大文字+数字+記号（英小文字なし）",
    expected: {
      level1: true,
      level2: false,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "Pass1!",
    description: "6文字の英大文字+英小文字+数字+記号（8文字未満）",
    expected: {
      level1: false,
      level2: false,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "Aa1!@#$%",
    description: "8文字の全種類含む",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: true,
      level6: false,
    },
  },
  {
    password: "!Password1",
    description: "10文字の記号+英大文字+英小文字+数字（記号が先頭）",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: false,
      level6: false,
    },
  },
  {
    password: "MyP@ssw0rd!",
    description: "11文字の複雑なパスワード",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: false,
      level6: false,
    },
  },

  // レベル3: 連続する同じ文字のテスト
  {
    password: "Paaassword1",
    description: "連続する同じ文字が4つ（aが4つ）",
    expected: {
      level1: true,
      level2: true,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "Password111",
    description: "連続する同じ文字が3つ（1が3つ）",
    expected: {
      level1: true,
      level2: true,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
    },
  },
  {
    password: "Paaword11",
    description: "連続する同じ文字が2つまで（OK）",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: false,
      level6: false,
    },
  },

  // レベル5: 数字の直後に記号があるパターン
  {
    password: "Pass1!word",
    description: "数字1の直後に記号!がある",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: true,
      level6: true,
    },
  },
  {
    password: "P1@ssword",
    description: "数字1の直後に記号@がある",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: true,
      level6: true,
    },
  },

  // レベル6: 先頭と末尾が英数字（追加パターン）
  {
    password: "aPassword1!b",
    description: "先頭a、末尾b（両方英数字）",
    expected: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: true,
      level6: true,
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
