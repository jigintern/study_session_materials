const API = 'http://localhost:8000';
const ROOM = 'sample';
const colors = ['#1d9bf0', '#f91880', '#00ba7c', '#ffad1f', '#7856ff'];
const liked = [];

async function showPosts() {
  const res = await fetch(API + '/posts?room=' + ROOM);
  const posts = await res.json();

  const timeline = document.getElementById('timeline');
  const template = document.getElementById('post-template');
  timeline.textContent = '';

  for (const post of posts) {
    const card = template.content.cloneNode(true);
    const avatar = card.querySelector('.avatar');
    avatar.textContent = post.name[0];
    avatar.style.backgroundColor = colors[post.name.charCodeAt(0) % colors.length];
    card.querySelector('.name').textContent = post.name;
    card.querySelector('.time').textContent = new Date(post.createdAt).toLocaleTimeString();
    card.querySelector('.text').textContent = post.text;
    card.querySelector('.like-count').textContent = post.likes;
    if (liked.includes(post.id)) {
      card.querySelector('.like-btn').classList.add('liked');
    }
    card.querySelector('.like-btn').addEventListener('click', function () {
      addLike(post.id);
    });
    timeline.appendChild(card);
  }
}

async function addPost() {
  const name = document.getElementById('name-input').value;
  const text = document.getElementById('text-input').value;

  await fetch(API + '/posts?room=' + ROOM, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, text: text }),
  });

  document.getElementById('text-input').value = '';
  showCount();
  showPosts();
}

async function addLike(id) {
  liked.push(id);
  await fetch(API + '/posts/' + id + '/like?room=' + ROOM, { method: 'POST' });
  showPosts();
}

function showCount() {
  const text = document.getElementById('text-input').value;
  const count = document.getElementById('count');
  count.textContent = 140 - text.length;
  if (text.length > 140) {
    count.style.color = 'red';
  } else {
    count.style.color = '';
  }
}

document.getElementById('post-btn').addEventListener('click', addPost);
document.getElementById('reload-btn').addEventListener('click', showPosts);
document.getElementById('text-input').addEventListener('input', showCount);
document.getElementById('text-input').addEventListener('keydown', function (event) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    addPost();
  }
});

showPosts();
setInterval(showPosts, 10000);

const source = new EventSource(API + '/posts/events?room=' + ROOM);
source.addEventListener('message', showPosts);
