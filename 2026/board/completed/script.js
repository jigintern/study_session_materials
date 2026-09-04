const API = 'https://example.deno.dev'; // URL を差し替える
const ROOM = '0000'; // 開催回ごとに差し替える

async function showPosts() {
  const res = await fetch(`${API}/posts?room=${ROOM}`);
  const posts = await res.json();

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
  showPosts();
}

document.getElementById('post-btn').addEventListener('click', addPost);
document.getElementById('reload-btn').addEventListener('click', showPosts);

showPosts();
