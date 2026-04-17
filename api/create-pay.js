export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const { amount, discordId } = req.body;

    // Логируем что отправляем
    console.log('Отправляем запрос в SPWorlds:', {
      amount,
      discordId,
      redirectUrl: `https://${req.headers.host}/success.html`,
      webhookUrl: `https://${req.headers.host}/api/webhook`
    });

    const response = await fetch(Buffer.from('https://spworlds.ru/api/public/payments').toString('base64'), {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.SP_AUTH}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        items: [{ 
          name: "Покупка на сервере", // Имя от 3 до 32 символов
          count: 1, 
          price: parseInt(amount) 
        }],
        redirectUrl: `https://${req.headers.host}/success.html`,
        webhookUrl: `https://${req.headers.host}/api/webhook`,
        data: String(discordId) // Убеждаемся что это строка
      })
    });

    // Проверяем статус ответа
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка от SPWorlds:', response.status, errorText);
      throw new Error(`SPWorlds вернул статус ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Ответ от SPWorlds:', data);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Ошибка создания платежа:', error.message);
    res.status(500).json({ 
      error: 'Ошибка создания платежа', 
      details: error.message 
    });
  }
}