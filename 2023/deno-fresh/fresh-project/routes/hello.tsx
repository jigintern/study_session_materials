export default async function Hello() {
  const res = await fetch('http://localhost:8000/api/wellcome')
  const wellcomeMeg = await res.text()

  return (
    <>
        <h1>{ wellcomeMeg }</h1>
    </>
  );
}
