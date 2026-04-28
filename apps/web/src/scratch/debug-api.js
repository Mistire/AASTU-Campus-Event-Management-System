
async function test() {
  const res = await fetch('http://localhost:4000/api/venues');
  const json = await res.json();
  console.log('JSON:', JSON.stringify(json, null, 2));
}
test();
