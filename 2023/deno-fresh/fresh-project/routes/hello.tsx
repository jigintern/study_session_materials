export default async function Hello() {
  const res = await fetch('http://localhost:8000/api/joke')
  const joke = await res.text()

  return (
    <>
        <h1>joke: { joke }</h1>
    </>
  );
}
