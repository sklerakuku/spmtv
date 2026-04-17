// create-pay.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const { amount, discordId } = req.body;

    const authString = process.env.SP_AUTH;
    const base64Auth = Buffer.from(authString).toString('base64');

    console.log('Создание платежа для:', discordId, 'сумма:', amount);

    // Добавляем User-Agent как обычный браузер
    const response = await fetch('https://spworlds.ru/api/public/payments', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${base64Auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://spworlds.ru',
        'Referer': 'https://spworlds.ru/'
      },
      body: JSON.stringify({
        items: [{ 
          name: "Поддержка SPMTV", 
          count: 1, 
          price: parseInt(amount) 
        }],
        redirectUrl: `https://${req.headers.host}/success.html`,
        webhookUrl: `https://${req.headers.host}/api/webhook`,
        data: String(discordId)
      })
    });

    const responseText = await response.text();
    console.log('Статус:', response.status);
    
    // Проверяем на капчу
    if (responseText.includes('Captcha') || responseText.includes('captcha')) {
      console.error('SPWorlds требует капчу');
      throw new Error('SPWorlds требует верификацию. Попробуйте позже или обратитесь к администратору.');
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Ответ не JSON:', responseText.substring(0, 200));
      throw new Error(`Ошибка ответа SPWorlds. Возможно требуется капча.`);
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