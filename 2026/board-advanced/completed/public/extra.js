// 応用課題はこのファイルに書く。
//
// script.js のあとに読み込むので、script.js の source や posts をそのまま使える。
// このファイルが途中で止まっても、script.js は動き続ける。

// 2章の応用課題: 見ていない間に届いた件数をタブに出す
const title = document.title;
let unread = 0;

function countUnread() {
  if (!document.hidden) return;
  unread = unread + 1;
  document.title = `(${unread}) ${title}`;
}
function resetTitle() {
  if (document.hidden) return;
  unread = 0;
  document.title = title;
}

source.addEventListener('message', countUnread);
document.addEventListener('visibilitychange', resetTitle);

// 4章の応用課題: 接続状態を画面に出す
const status = document.getElementById('status');

function showOnline() {
  status.textContent = 'つながっています';
  status.className = 'status online';
}
function showOffline() {
  status.textContent = '切れています';
  status.className = 'status offline';
}

source.addEventListener('open', showOnline);
source.addEventListener('error', showOffline);
