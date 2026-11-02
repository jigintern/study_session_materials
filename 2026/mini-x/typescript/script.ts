const API = 'http://localhost:8000';
const ROOM = 'sample';

type Post = {
  id: string;
  name: string;
  text: string;
  likes: number;
  createdAt: string;
};

async function showPosts(): Promise<void> {
  const res = await fetch(API + '/posts?room=' + ROOM);
  const posts: Post[] = await res.json();

  const timeline = document.getElementById('timeline') as HTMLUListElement;
  const template = document.getElementById('post-template') as HTMLTemplateElement;
  timeline.textContent = '';

  for (const post of posts) {
    const card = template.content.cloneNode(true) as DocumentFragment;
    (card.querySelector('.name') as HTMLSpanElement).textContent = post.name;
    (card.querySelector('.text') as HTMLParagraphElement).textContent = post.text;
    (card.querySelector('.like-count') as HTMLSpanElement).textContent = String(post.likes);
    (card.querySelector('.like-btn') as HTMLButtonElement).addEventListener('click', function () {
      addLike(post.id);
    });
    timeline.appendChild(card);
  }
}

async function addPost(): Promise<void> {
  const name = (document.getElementById('name-input') as HTMLInputElement).value;
  const text = (document.getElementById('text-input') as HTMLTextAreaElement).value;

  await fetch(API + '/posts?room=' + ROOM, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, text: text }),
  });

  (document.getElementById('text-input') as HTMLTextAreaElement).value = '';
  showPosts();
}

async function addLike(id: string): Promise<void> {
  await fetch(API + '/posts/' + id + '/like?room=' + ROOM, { method: 'POST' });
  showPosts();
}

(document.getElementById('post-btn') as HTMLButtonElement).addEventListener('click', addPost);
(document.getElementById('reload-btn') as HTMLButtonElement).addEventListener('click', showPosts);

showPosts();
