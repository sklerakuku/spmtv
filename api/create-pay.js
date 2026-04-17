export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  console.log('═══════════════════════════════════');
  console.log('💳 CREATE-PAY: Начало запроса');
  console.log('⏰ Время:', new Date().toISOString());
  
  try {
    const { amount, discordId, turnstileToken } = req.body;
    
    console.log('📥 Полученные данные:');
    console.log('  • Сумма:', amount);
    console.log('  • Discord ID:', discordId);
    console.log('  • Turnstile токен:', turnstileToken ? 'Присутствует' : 'ОТСУТСТВУЕТ');

    // Проверяем Turnstile токен
    if (turnstileToken) {
      console.log('🔐 Проверка Turnstile токена...');
      const turnstileCheck = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken
        })
      });

      const turnstileData = await turnstileCheck.json();
      console.log('📊 Turnstile ответ:', turnstileData);
      
      if (!turnstileData.success) {
        console.error('❌ Turnstile проверка не пройдена');
        console.log('═══════════════════════════════════');
        return res.status(403).json({ error: 'Проверка капчи не пройдена' });
      }
      console.log('✅ Turnstile проверка пройдена');
    }

    const authString = process.env.SP_AUTH;
    const base64Auth = Buffer.from(authString).toString('base64');
    
    console.log('🔑 Токен авторизации (первые 30 символов):', base64Auth.substring(0, 30) + '...');
    console.log('🌐 URL запроса: https://spworlds.ru/api/public/payments');
    
    const requestBody = {
      items: [{ 
        name: "Поддержка SPMTV", 
        count: 1, 
        price: parseInt(amount) 
      }],
      redirectUrl: `https://${req.headers.host}/success.html`,
      webhookUrl: `https://${req.headers.host}/api/webhook`,
      data: String(discordId)
    };
    
    console.log('📤 Тело запроса:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://spworlds.ru/api/public/payments', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${base64Auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://spworlds.ru',
        'Referer': 'https://spworlds.ru/',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📊 Статус ответа SPWorlds:', response.status, response.statusText);
    console.log('📋 Заголовки ответа:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📄 Длина ответа:', responseText.length, 'символов');
    console.log('📄 Первые 500 символов ответа:', responseText.substring(0, 500));
    
    // Проверка на капчу
    if (responseText.includes('Captcha') || responseText.includes('captcha')) {
      console.error('❌ SPWorlds требует капчу!');
      console.error('⚠️ IP Vercel заблокирован, несмотря на Turnstile');
      console.log('═══════════════════════════════════');
      return res.status(503).json({ 
        error: 'Сервис временно недоступен. Попробуйте позже.'
      });
    }
    
    // Проверка на HTML ответ
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error('❌ Получен HTML вместо JSON');
      console.log('═══════════════════════════════════');
      throw new Error('SPWorlds вернул HTML вместо JSON');
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ JSON успешно распарсен');
      console.log('📦 Ответ SPWorlds:', data);
    } catch (e) {
      console.error('❌ Ошибка парсинга JSON:', e.message);
      console.log('═══════════════════════════════════');
      throw new Error('Невалидный JSON от SPWorlds');
    }
    
    if (data.url) {
      console.log('✅ Платёж создан успешно');
      console.log('🔗 URL оплаты:', data.url);
    } else {
      console.error('⚠️ В ответе нет URL оплаты');
    }
    
    console.log('═══════════════════════════════════');
    res.status(200).json(data);
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    console.error('📚 Стек ошибки:', error.stack);
    console.log('═══════════════════════════════════');
    res.status(500).json({ error: error.message });
  }
}