// パスワード強度チェッカー
// 正規表現を使って段階的にパスワードの強度をチェックする

/**
 * レベル1: 8文字以上かチェック
 * @param {string} password - チェックするパスワード
 * @returns {boolean} - 条件を満たす場合true
 */
export function checkLevel1(password) {
  return /(?!)/.test(password); // TODO
}

/**
 * レベル2: 8文字以上 + 英小文字を含む
 * @param {string} password - チェックするパスワード
 * @returns {boolean} - 条件を満たす場合true
 */
export function checkLevel2(password) {
  return /(?!)/.test(password); // TODO
}

/**
 * レベル3: 8文字以上 + 英小文字を含む + 連続する同じ文字が3つ以上ない
 * @param {string} password - チェックするパスワード
 * @returns {boolean} - 条件を満たす場合true
 */
export function checkLevel3(password) {
  return /(?!)/.test(password); // TODO
}

/**
 * レベル4: 8文字以上 + 英小文字を含む + 連続する同じ文字が3つ以上ない + 英大文字と数字を両方含む
 * @param {string} password - チェックするパスワード
 * @returns {boolean} - 条件を満たす場合true
 */
export function checkLevel4(password) {
  return /(?!)/.test(password); // TODO
}

/**
 * レベル5: レベル4の条件 + 数字の直後に記号がある箇所を含む
 * @param {string} password - チェックするパスワード
 * @returns {boolean} - 条件を満たす場合true
 */
export function checkLevel5(password) {
  return /(?!)/.test(password); // TODO
}

/**
 * 統合チェック: 全レベルの結果を返す
 * @param {string} password - チェックするパスワード
 * @returns {object} - 各レベルの結果
 */
export function checkAllLevels(password) {
  return {
    level1: checkLevel1(password),
    level2: checkLevel2(password),
    level3: checkLevel3(password),
    level4: checkLevel4(password),
    level5: checkLevel5(password),
  };
}
