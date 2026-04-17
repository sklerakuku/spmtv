export default function handler(req, res) {
  // Проверка переменных
  if (!process.env.DISCORD_CLIENT_ID || !process.env.REDIRECT_URI) {
    return res.status(500).send("Ошибка: Не настроены переменные окружения на Vercel");
  }

  const url = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&scope=identify`;
  
  res.redirect(url);
}