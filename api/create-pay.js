export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const auth = Buffer.from(process.env.SP_AUTH).toString('base64');
  const { amount, discordId } = req.body;

  const response = await fetch('https://spworlds.ru', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${auth}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      items: [{ name: "Покупка товара", count: 1, price: parseInt(amount) }],
      redirectUrl: `https://${req.headers.host}/success.html`,
      webhookUrl: `https://${req.headers.host}/api/webhook`,
      data: discordId // Передаем ID дискорда, чтобы узнать кто купил в вебхуке
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}
