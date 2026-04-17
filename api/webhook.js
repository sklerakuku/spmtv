import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const signature = req.headers['x-body-hash'];
    
    // Логируем что пришло
    console.log('Получен вебхук:', {
      signature,
      body: req.body,
      headers: req.headers
    });

    const hmac = crypto.createHmac('sha256', process.env.SP_TOKEN);
    hmac.update(JSON.stringify(req.body));
    const myHash = hmac.digest('base64');

    if (myHash !== signature) {
      console.error('Неверная подпись вебхука');
      return res.status(401).send('Fake');
    }

    // ОПЛАТА ПОДТВЕРЖДЕНА
    console.log('✅ ОПЛАТА ПОДТВЕРЖДЕНА!');
    console.log('Оплатил:', req.body.payer);
    console.log('Сумма:', req.body.amount);
    console.log('Discord ID:', req.body.data);
    
    // Здесь можно добавить логику выдачи товара
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error);
    res.status(500).send('Error');
  }
}