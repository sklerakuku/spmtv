export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const { amount, discordId, turnstileToken } = req.body;

    // Проверка Turnstile (как и раньше)
    if (turnstileToken) {
      const turnstileCheck = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken
        })
      });
      const turnstileData = await turnstileCheck.json();
      if (!turnstileData.success) {
        return res.status(403).json({ error: 'Проверка капчи не пройдена' });
      }
    }

    const authString = process.env.SP_AUTH;
    const base64Auth = Buffer.from(authString).toString('base64');
    const requestBody = {
      items: [{ name: "Поддержка SPMTV", count: 1, price: parseInt(amount) }],
      redirectUrl: `https://${req.headers.host}/success.html`,
      webhookUrl: `https://${req.headers.host}/api/webhook`,
      data: String(discordId)
    };

    // --- НОВАЯ ЧАСТЬ: Запрос через наш Worker-прокси ---
    const proxyResponse = await fetch(`${process.env.PROXY_URL}/api/public/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Auth': process.env.PROXY_SECRET, // Секрет для Worker'а
        'X-SP-Auth': `Bearer ${base64Auth}`       // Авторизация для SPWorlds
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await proxyResponse.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Worker proxy error:', responseText);
      throw new Error('Ошибка ответа от прокси-сервера');
    }
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Ошибка:', error.message);
    res.status(500).json({ error: error.message });
  }
}