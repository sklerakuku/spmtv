export default async function handler(req, res) {
  const { id } = req.query;
  const auth = Buffer.from(process.env.SP_AUTH).toString('base64');
  
  const response = await fetch(`https://spworlds.ru/{id}`, {
    headers: { 'Authorization': `Bearer ${auth}` }
  });
  const data = await response.json();
  res.status(200).json(data);
}
