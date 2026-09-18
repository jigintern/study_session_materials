// 講座を通しで書き終えたときの public/script.js
// 共有サーバーにつなぎ、届いた 1 件だけを手元の配列に足している状態。

const API = 'https://example.deno.net'; // 当日の URL に差し替える
const ROOM = '0000'; // 開催回ごとに差し替える

// 手元の投稿。画面に出ているものと同じ並び。
const posts = [];

// サーバーから全部もらって、手元に入れる。開いたときに 1 回だけ呼ぶ。
async function loadPosts() {
  const res = await fetch(`${API}/posts?room=${ROOM}`);
  const loaded = await res.json();

  for (const post of loaded) {
    posts.push(post);
  }

  showPosts();
}

// 手元の投稿を並べ直す。サーバーには聞かない。
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
source.onmessage = (e) => {
  posts.push(JSON.parse(e.data));
  showPosts();
};

const status = document.getElementById('status');

source.addEventListener('open', () => {
  status.textContent = 'つながっています';
  status.className = 'status online';
});

source.addEventListener('error', () => {
  status.textContent = '切れています';
  status.className = 'status offline';
});
