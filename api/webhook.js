import crypto from 'crypto';

export default async function handler(req, res) {
  const signature = req.headers['x-body-hash'];
  const hmac = crypto.createHmac('sha256', process.env.SP_TOKEN);
  hmac.update(JSON.stringify(req.body));
  const myHash = hmac.digest('base64');

  if (myHash !== signature) return res.status(401).send('Fake');

  // ОПЛАТА ПОДТВЕРЖДЕНА
  console.log('Оплатил:', req.body.payer, 'Сумма:', req.body.amount);
  
  // Тут можно отправить сообщение в Discord через Webhook или сохранить в БД
  res.status(200).send('OK');
}
