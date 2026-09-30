// Chapter 5 の終わりの public/script.js
// Chapter 5 でサーバー側だけを直したので、Chapter 4 の終わりと同じ内容。

const API = location.origin; // Chapter 4 で自分のサーバーに向けた

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

  await fetch(`${API}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, text: text }),
  });

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
