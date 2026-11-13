const API = 'http://localhost:8000';
const ROOM = 'sample';

// ここから下に書いていきます
async function showPosts() {
  const res = await fetch(API + '/posts?room=' + ROOM);
  const posts = await res.json();

  const timeline = document.getElementById('timeline');
  const template = document.getElementById('post-template');
  timeline.textContent = '';

  for (const post of posts) {
    const card = template.content.cloneNode(true);
    card.querySelector('.name').textContent = post.name;
    card.querySelector('.text').textContent = post.text;
    timeline.appendChild(card);
  }
}

document.getElementById('reload-btn').addEventListener('click', showPosts);

showPosts();
