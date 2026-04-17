// Обновлённый get-user.js
export default async function handler(req, res) {
  const { id } = req.query;
  
  try {
    const authString = process.env.SP_AUTH;
    const base64Auth = Buffer.from(authString).toString('base64');
    
    console.log('Запрос пользователя:', id);
    
    const response = await fetch(`https://spworlds.ru/api/public/users/${id}`, {
      headers: { 
        'Authorization': `Bearer ${base64Auth}`,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; SPMTV-Bot/1.0)',
        'Origin': 'https://spworlds.ru',
        'Referer': 'https://spworlds.ru/'
      },
      keepalive: true
    });
    
    const responseText = await response.text();
    console.log('Статус:', response.status);
    
    // Проверка на капчу
    if (responseText.includes('Captcha')) {
      console.error('Обнаружена капча');
      return res.status(503).json({ 
        error: 'Сервис временно недоступен',
        username: null 
      });
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Не JSON:', responseText.substring(0, 100));
      return res.status(200).json({ username: null });
    }
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Ошибка:', error.message);
    res.status(200).json({ username: null });
  }
}