// Chapter 1 の終わりの public/script.js
// 10 秒ごとに読み込み直している状態。更新ボタンはそのまま残している。

const API = 'https://example.deno.net';

// ▼ 3章: ここに posts と loadPosts を追加する

async function showPosts() {
  const res = await fetch(`${API}/posts`);
  const posts = await res.json();

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
  showPosts();
}

document.getElementById('post-btn').addEventListener('click', addPost);
document.getElementById('reload-btn').addEventListener('click', showPosts);

showPosts();
setInterval(showPosts, 10000);
