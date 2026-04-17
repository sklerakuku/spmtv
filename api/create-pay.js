export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const { amount, discordId } = req.body;

    // Формируем правильный токен авторизации
    const authString = process.env.SP_AUTH; // "ID:TOKEN"
    const base64Auth = Buffer.from(authString).toString('base64');

    console.log('Отправляем запрос в SPWorlds:', {
      amount,
      discordId,
      redirectUrl: `https://${req.headers.host}/success.html`,
      webhookUrl: `https://${req.headers.host}/api/webhook`
    });

    // ИСПРАВЛЕНО: Убрана кодировка URL в base64
    const response = await fetch('https://spworlds.ru/api/public/payments', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${base64Auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        items: [{ 
          name: "Покупка на сервере",
          count: 1, 
          price: parseInt(amount) 
        }],
        redirectUrl: `https://${req.headers.host}/success.html`,
        webhookUrl: `https://${req.headers.host}/api/webhook`,
        data: String(discordId)
      })
    });

    const responseText = await response.text();
    console.log('Статус ответа:', response.status);
    console.log('Ответ:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Ошибка парсинга JSON:', responseText);
      throw new Error(`SPWorlds вернул не JSON. Статус: ${response.status}`);
    }
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Ошибка:', error.message);
    res.status(500).json({ 
      error: 'Ошибка создания платежа', 
      details: error.message 
    });
  }
}