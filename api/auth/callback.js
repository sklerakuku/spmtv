export default async function handler(req, res) {
  const { code } = req.query;

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
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

    if (!tokenData.access_token) {
      throw new Error('Не удалось получить access_token');
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    // Формируем URL аватара
    let avatarUrl = null;
    if (userData.avatar) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
    }

    // Передаем аватар в параметрах
    const avatarParam = avatarUrl ? `&avatar=${encodeURIComponent(avatarUrl)}` : '';
    res.redirect(`/?id=${userData.id}&nick=${userData.username}${avatarParam}`);
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).send('Ошибка авторизации через Discord');
  }
}