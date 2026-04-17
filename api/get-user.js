export default async function handler(req, res) {
  const { id } = req.query;
  
  try {
    const response = await fetch(`https://spworlds.ru/api/public/users/${id}`, {
      headers: { 'Authorization': `Bearer ${process.env.SP_AUTH}` }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ error: 'Ошибка получения данных пользователя' });
  }
}