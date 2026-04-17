export default async function handler(req, res) {
  const { code } = req.query;

  // 1. Обмениваем код на токен
  const tokenResponse = await fetch('https://discord.com', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.REDIRECT_URI,
      scope: 'identify',
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const tokenData = await tokenResponse.json();

  // 2. Получаем данные пользователя
  const userResponse = await fetch('https://discord.com', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = await userResponse.json();

  // 3. Редиректим обратно на сайт, передав ID и ник в параметрах (для простоты)
  res.redirect(`/?id=${userData.id}&nick=${userData.username}`);
}
