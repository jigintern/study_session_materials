// 応用課題はこのファイルに書く。
//
// script.js のあとに読み込むので、script.js の source や posts をそのまま使える。
// このファイルが途中で止まっても、script.js は動き続ける。

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
