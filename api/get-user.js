// Обновлённый get-user.js с подробными логами
export default async function handler(req, res) {
  const { id } = req.query;
  
  console.log('═══════════════════════════════════');
  console.log('📥 GET-USER: Начало запроса');
  console.log('⏰ Время:', new Date().toISOString());
  console.log('🆔 Discord ID:', id);
  
  try {
    const authString = process.env.SP_AUTH;
    const base64Auth = Buffer.from(authString).toString('base64');
    
    console.log('🔑 Токен авторизации (первые 30 символов):', base64Auth.substring(0, 30) + '...');
    
    const url = `https://spworlds.ru/api/public/users/${id}`;
    console.log('🌐 URL запроса:', url);
    
    const response = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${base64Auth}`,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://spworlds.ru',
        'Referer': 'https://spworlds.ru/',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache'
      },
      keepalive: true
    });
    
    console.log('📊 Статус ответа:', response.status, response.statusText);
    console.log('📋 Заголовки ответа:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Длина ответа:', responseText.length, 'символов');
    console.log('📄 Первые 300 символов ответа:', responseText.substring(0, 300));
    
    // Проверка на капчу
    if (responseText.includes('Captcha') || responseText.includes('captcha')) {
      console.error('❌ Обнаружена капча!');
      console.error('⚠️ IP Vercel заблокирован Cloudflare');
      console.log('═══════════════════════════════════');
      return res.status(503).json({ 
        error: 'IP заблокирован, требуется капча',
        username: null,
        uuid: null
      });
    }
    
    // Проверка на HTML ответ
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error('❌ Получен HTML вместо JSON');
      console.error('⚠️ Возможно редирект на страницу входа');
      console.log('═══════════════════════════════════');
      return res.status(200).json({ 
        username: null, 
        uuid: null,
        error: 'HTML ответ'
      });
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ JSON успешно распарсен');
      console.log('📦 Данные пользователя:', data);
    } catch (e) {
      console.error('❌ Ошибка парсинга JSON:', e.message);
      console.log('═══════════════════════════════════');
      return res.status(200).json({ 
        username: null, 
        uuid: null,
        error: 'Невалидный JSON'
      });
    }
    
    console.log('✅ Запрос успешно завершён');
    console.log('═══════════════════════════════════');
    res.status(200).json(data);
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    console.error('📚 Стек ошибки:', error.stack);
    console.log('═══════════════════════════════════');
    res.status(200).json({ 
      username: null, 
      uuid: null,
      error: error.message 
    });
  }
}