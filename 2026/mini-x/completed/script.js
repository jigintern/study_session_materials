// ミニX の動きを書くファイル。サーバーとポストをやりとりして、タイムラインに並べる
// API はサーバーの場所（URL）、ROOM は部屋の名前。同じ部屋の人どうしで、ポストが見える
const API = 'http://localhost:8000';
const ROOM = 'sample';

// サーバーにポストの一覧を「ください」と頼み、投稿カードにしてタイムラインに並べる（ミッション 1・2・4）
async function showPosts() {
  // サーバーからポストの一覧を取ってくる（ミッション 2）
  const res = await fetch(API + '/posts?room=' + ROOM);
  const posts = await res.json();

  // 並べる前にタイムラインを空にする（ミッション 1）
  const timeline = document.getElementById('timeline');
  const template = document.getElementById('post-template');
  timeline.textContent = '';

  // 1 件ずつ、見本の投稿カードをコピーして中身を入れ、タイムラインに入れる（ミッション 1）
  for (const post of posts) {
    const card = template.content.cloneNode(true);
    card.querySelector('.name').textContent = post.name;
    card.querySelector('.text').textContent = post.text;
    // いいねの数を出し、ハートが押されたらこのポストの id で addLike を呼ぶ（ミッション 4）
    card.querySelector('.like-count').textContent = post.likes;
    card.querySelector('.like-btn').addEventListener('click', function () {
      addLike(post.id);
    });
    timeline.appendChild(card);
  }
}

// 投稿欄の名前と本文を、サーバーに「このポストを保存して」と送る（ミッション 3）
async function addPost() {
  const name = document.getElementById('name-input').value;
  const text = document.getElementById('text-input').value;

  await fetch(API + '/posts?room=' + ROOM, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, text: text }),
  });

  // 送り終わったら本文の欄を空にして、タイムラインを取り直す
  document.getElementById('text-input').value = '';
  showPosts();
}

// サーバーに「この id のポストのいいねを 1 増やして」と頼み、タイムラインを取り直す（ミッション 4）
async function addLike(id) {
  await fetch(API + '/posts/' + id + '/like?room=' + ROOM, { method: 'POST' });
  showPosts();
}

// 「ポストする」ボタンでは addPost（ミッション 3）、更新ボタンでは showPosts（ミッション 2）を動かす
document.getElementById('post-btn').addEventListener('click', addPost);
document.getElementById('reload-btn').addEventListener('click', showPosts);

// ページを開いたときに 1 回、タイムラインを表示する
showPosts();
