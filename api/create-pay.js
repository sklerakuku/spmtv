export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const { amount, discordId } = req.body;

    const response = await fetch('https://spworlds.ru/api/public/payments', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.SP_AUTH}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        items: [{ name: "Покупка товара", count: 1, price: parseInt(amount) }],
        redirectUrl: `https://${req.headers.host}/success.html`,
        webhookUrl: `https://${req.headers.host}/api/webhook`,
        data: discordId
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    res.status(500).json({ error: 'Ошибка создания платежа' });
  }
}