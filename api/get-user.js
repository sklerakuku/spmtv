export default async function handler(req, res) {
  const { id } = req.query;
  
  try {
    const authString = process.env.SP_AUTH;
    const base64Auth = Buffer.from(authString).toString('base64');
    
    console.log('Запрос пользователя через прокси:', id);
    
    // --- НОВАЯ ЧАСТЬ: Запрос через наш Worker-прокси ---
    const proxyResponse = await fetch(`${process.env.PROXY_URL}/api/public/users/${id}`, {
      headers: { 
        'Accept': 'application/json',
        'X-Proxy-Auth': process.env.PROXY_SECRET,
        'X-SP-Auth': `Bearer ${base64Auth}`
      }
    });
    
    const responseText = await proxyResponse.text();
    console.log('Статус ответа прокси:', proxyResponse.status);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Worker proxy error:', responseText);
      return res.status(200).json({ username: null });
    }
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Ошибка:', error.message);
    res.status(200).json({ username: null });
  }
}