import { useEffect, useState } from 'react';
import icon from './icon.svg';

const API = 'http://localhost:8000';
const ROOM = 'sample';

function PostCard(props) {
  return (
    <li className="post">
      <img className="avatar" src={icon} alt="" />
      <div className="post-body">
        <span className="name">{props.post.name}</span>
        <p className="text">{props.post.text}</p>
        <button
          className="like-btn"
          onClick={function () {
            props.onLike(props.post.id);
          }}
        >
          <span className="like-count">{props.post.likes}</span>
        </button>
      </div>
    </li>
  );
}

function Compose(props) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');

  async function handlePost() {
    await props.onPost(name, text);
    setText('');
  }

  return (
    <div className="compose">
      <img className="avatar" src={icon} alt="" />
      <div className="compose-body">
        <input
          id="name-input"
          type="text"
          placeholder="名前"
          value={name}
          onChange={function (event) {
            setName(event.target.value);
          }}
        />
        <textarea
          id="text-input"
          placeholder="いまどうしてる？"
          value={text}
          onChange={function (event) {
            setText(event.target.value);
          }}
        />
        <button id="post-btn" onClick={handlePost}>
          ポストする
        </button>
      </div>
    </div>
  );
}

export function App() {
  const [posts, setPosts] = useState([]);

  async function showPosts() {
    const res = await fetch(API + '/posts?room=' + ROOM);
    const data = await res.json();
    setPosts(data);
  }

  async function addPost(name, text) {
    await fetch(API + '/posts?room=' + ROOM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, text: text }),
    });
    showPosts();
  }

  async function addLike(id) {
    await fetch(API + '/posts/' + id + '/like?room=' + ROOM, { method: 'POST' });
    showPosts();
  }

  useEffect(function () {
    showPosts();
  }, []);

  const cards = [];
  for (const post of posts) {
    cards.push(<PostCard key={post.id} post={post} onLike={addLike} />);
  }

  return (
    <>
      <header className="header">
        <h1>ホーム</h1>
        <button id="reload-btn" onClick={showPosts}>
          更新
        </button>
      </header>
      <Compose onPost={addPost} />
      <ul id="timeline">{cards}</ul>
    </>
  );
}
