export default function handler(req, res) {
  const url = `https://discord.com{process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify`;
  res.redirect(url);
}
