export default function handler(req, res) {
  // Добавляем проверку, чтобы код не падал, если переменная не задана
  if (!process.env.DISCORD_CLIENT_ID || !process.env.REDIRECT_URI) {
    return res.status(500).send("Ошибка: Не настроены переменные окружения на Vercel");
  }

  const url = `https://discord.com{process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify`;
  
  res.redirect(url);
}
