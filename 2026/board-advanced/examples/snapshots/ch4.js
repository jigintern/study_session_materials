// Chapter 4 の終わりの public/script.js
// 接続先を自分のサーバーに変え、接続状態を画面に出している状態。

const API = location.origin; // Chapter 4 で自分のサーバーに向けた
const ROOM = '0000'; // 開催回ごとに差し替える

// ブラウザ側で持つ投稿。画面と同じ並び。
const posts = [];

// サーバーから全件取得して posts に入れる。開いたときに 1 回だけ呼ぶ。
async function loadPosts() {
  const res = await fetch(`${API}/posts?room=${ROOM}`);
  const loaded = await res.json();

  for (const post of loaded) {
    posts.push(post);
  }

  showPosts();
}

// posts を画面に並べ直す。サーバーからは取得しない。
function showPosts() {
  const list = document.getElementById('posts');
  list.textContent = '';

  for (const post of posts) {
    const item = document.createElement('li');
    const time = new Date(post.createdAt).toLocaleTimeString();
    item.textContent = `${post.name}: ${post.text} (${time})`;
    list.appendChild(item);
  }
}

async function addPost() {
  const name = document.getElementById('name-input').value;
  const text = document.getElementById('text-input').value;

  await fetch(`${API}/posts?room=${ROOM}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, text: text }),
  });

  document.getElementById('text-input').value = '';
}

document.getElementById('post-btn').addEventListener('click', addPost);
document.getElementById('reload-btn').remove();

loadPosts();

const source = new EventSource(`${API}/events?room=${ROOM}`);
function receivePost(e) {
  posts.push(JSON.parse(e.data));
  showPosts();
}
source.onmessage = receivePost;

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
