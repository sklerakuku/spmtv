export default function handler(req, res) {
  // Проверка переменных
  if (!process.env.DISCORD_CLIENT_ID || !process.env.REDIRECT_URI) {
    return res.status(500).send("Ошибка: Не настроены переменные окружения на Vercel");
  }

  // ВНИМАТЕЛЬНО: добавлена часть пути и знак $ перед скобками
  const url = `https://discord.com/oauth2/authorize?client_id=1266297754674790420&response_type=code&redirect_uri=https%3A%2F%2Fspmtv.vercel.app%2Fapi%2Fauth%2Fcallback&scope=identify`;
  
  res.redirect(url);
}
