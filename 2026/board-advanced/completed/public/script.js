// 講座を通しで書き終えたときの public/script.js
// 共有サーバーに接続し、受信した 1 件だけを配列 posts に追加している状態。

const API = 'https://example.deno.net';

// ブラウザ側で持つ投稿。画面と同じ並び。
const posts = [];

// サーバーから全件取得して posts に入れる。開いたときに 1 回だけ呼ぶ。
async function loadPosts() {
  const res = await fetch(`${API}/posts`);
  const loaded = await res.json();

  for (let i = 0; i < loaded.length; i++) {
    posts.push(loaded[i]);
  }

  showPosts();
}

// posts を画面に並べ直す。サーバーからは取得しない。
function showPosts() {
  const list = document.getElementById('posts');
  list.textContent = '';

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const item = document.createElement('li');
    const time = new Date(post.createdAt).toLocaleTimeString();
    item.textContent = `${post.name}: ${post.text} (${time})`;
    list.appendChild(item);
  }
}

async function addPost() {
  const name = document.getElementById('name-input').value;
  const text = document.getElementById('text-input').value;

  const res = await fetch(`${API}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, text: text }),
  });

  if (!res.ok) {
    const { message } = await res.json();
    alert(message);
    return;
  }

  document.getElementById('text-input').value = '';
}

document.getElementById('post-btn').addEventListener('click', addPost);
document.getElementById('reload-btn').addEventListener('click', showPosts);

loadPosts();

const source = new EventSource(`${API}/events`);
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
