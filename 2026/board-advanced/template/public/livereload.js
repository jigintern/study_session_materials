// プレビュー更新用。講座の内容とは関係がないので、開かなくて大丈夫です。
//
// public/ のファイルを一定間隔で読み直し、中身が変わっていたらページを再読み込みする。
// StackBlitz は入力が止まると保存を待たずにファイルを書き込むので、保存しなくても反映される。
//
// 打っている途中のコードが動かないよう、最後に変化を見てから QUIET ミリ秒だけ待つ。
//
// server.js を保存したときは node --watch がサーバーを再起動するため、
// 応答が途切れて戻ってきたことを再起動の合図として扱う。

const TARGETS = ['/index.html', '/styles.css', '/script.js'];
const INTERVAL = 500;
const QUIET = 1000;

// 最後に受け取った中身。ファイル名をキーにする。
const snapshots = new Map();

// 最後に変化を見つけた時刻。0 なら、まだ一度も変化していない。
let lastChangeAt = 0;

// サーバーが応答しなかったか。戻ってきた時点で再読み込みする。
let wasDown = false;

// 確認が終わる前に次の確認を始めない。重なると取得の順序が入れ替わる。
let checking = false;

async function check() {
  if (checking) return;
  checking = true;

  try {
    for (const target of TARGETS) {
      // クエリを変えて、途中のキャッシュが古い中身を返すのを防ぐ。
      const res = await fetch(`${target}?_=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(res.status);
      const text = await res.text();

      if (snapshots.has(target) && snapshots.get(target) !== text) lastChangeAt = Date.now();
      snapshots.set(target, text);
    }
  } catch {
    wasDown = true;
    return;
  } finally {
    checking = false;
  }

  const settled = lastChangeAt !== 0 && Date.now() - lastChangeAt >= QUIET;
  if (settled || wasDown) {
    console.log('[livereload] プレビューを更新します');
    location.reload();
  }
}

setInterval(check, INTERVAL);
