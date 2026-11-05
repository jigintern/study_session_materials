const API = 'http://localhost:8000';
const ROOM = 'sample';

// ここから下に書いていきます
const posts = [
  { name: 'たろう', text: 'はじめまして！' },
  { name: 'はなこ', text: 'こんにちは〜' },
  { name: 'じろう', text: 'ミニX できた 🎉' },
  { name: 'さぶろう', text: '自分で足した 4 件目' },
];

console.log(posts);

function showPosts() {
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

showPosts();
