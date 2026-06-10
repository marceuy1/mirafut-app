export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { to, name } = req.body;
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'MiraFut <noreply@mirafut.com>',
      to: [to],
      subject: '¡Bienvenido a MiraFut! 🎉⚽',
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0e14;color:#ECEFF4;padding:40px;border-radius:16px">
        <h1 style="color:#00E676;font-size:32px;margin-bottom:8px">MiraFut</h1>
        <p style="color:#8899A6;font-size:14px;margin-bottom:32px">TALENTO SIN FRONTERAS</p>
        <h2 style="font-size:24px;margin-bottom:16px">¡Hola ${name}! 👋</h2>
        <p style="font-size:16px;line-height:1.6;margin-bottom:24px">Bienvenido a MiraFut, la red social para jóvenes futbolistas de todo el mundo.</p>
        <p style="font-size:16px;line-height:1.6;margin-bottom:32px">Ya puedes acceder a tu AI Coach 24/7, conectar con otros jugadores y compartir tu talento.</p>
        <a href="https://www.mirafut.com" style="background:#00E676;color:#0a0e14;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;white-space:nowrap">Ir a MiraFut →</a>
        <p style="color:#556677;font-size:12px;margin-top:40px">© 2026 MiraFut. Todos los derechos reservados.</p>
      </div>`
    })
  });

  const data = await response.json();
  if (!response.ok) return res.status(400).json({ error: data });
  return res.status(200).json({ success: true });
}
