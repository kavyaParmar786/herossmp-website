// Email utility using Resend (or any SMTP via nodemailer)
// Set RESEND_API_KEY in .env for Resend, or SMTP_* vars for nodemailer

export async function sendWelcomeEmail(to: string, username: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log('[Email] RESEND_API_KEY not set — skipping welcome email to', to)
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="background:#0a0a12;color:#e2e8f0;font-family:'Segoe UI',sans-serif;margin:0;padding:0;">
      <div style="max-width:600px;margin:40px auto;padding:40px;background:rgba(255,255,255,0.03);border:1px solid rgba(139,92,246,0.3);border-radius:16px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#a78bfa;font-size:28px;margin:0;">⚔️ Welcome to HeroS SMP</h1>
          <p style="color:#94a3b8;margin-top:8px;">The Ultimate Minecraft Survival Experience</p>
        </div>
        <p style="font-size:16px;">Hey <strong style="color:#c4b5fd;">${username}</strong>,</p>
        <p style="color:#94a3b8;line-height:1.6;">
          Your account has been created successfully! You're now part of the HeroS SMP community.
          Jump in, join battles, climb the leaderboard, and become a legend.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="https://herossmp.xyz" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
            🎮 Join the Server
          </a>
        </div>
        <p style="color:#64748b;font-size:13px;text-align:center;margin-top:32px;">
          Server IP: <strong style="color:#a78bfa;">play.herossmp.xyz</strong>
        </p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.05);margin:24px 0;" />
        <p style="color:#475569;font-size:12px;text-align:center;">
          © HeroS SMP · You received this because you registered on our platform.
        </p>
      </div>
    </body>
    </html>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'HeroS SMP <noreply@herossmp.xyz>',
        to,
        subject: '⚔️ Welcome to HeroS SMP!',
        html,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[Email] Resend error:', err)
    } else {
      console.log('[Email] Welcome email sent to', to)
    }
  } catch (e) {
    console.error('[Email] Failed to send welcome email:', e)
  }
}

export async function sendNewPlayerNotification(adminEmail: string, newUsername: string, newEmail: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !adminEmail) return

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="background:#0a0a12;color:#e2e8f0;font-family:'Segoe UI',sans-serif;margin:0;padding:0;">
      <div style="max-width:600px;margin:40px auto;padding:32px;background:rgba(255,255,255,0.03);border:1px solid rgba(139,92,246,0.3);border-radius:16px;">
        <h2 style="color:#a78bfa;">🆕 New Player Joined!</h2>
        <p style="color:#94a3b8;">A new player has registered on HeroS SMP:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr>
            <td style="padding:8px;color:#64748b;">Username:</td>
            <td style="padding:8px;color:#c4b5fd;font-weight:bold;">${newUsername}</td>
          </tr>
          <tr>
            <td style="padding:8px;color:#64748b;">Email:</td>
            <td style="padding:8px;color:#c4b5fd;">${newEmail}</td>
          </tr>
          <tr>
            <td style="padding:8px;color:#64748b;">Time:</td>
            <td style="padding:8px;color:#c4b5fd;">${new Date().toLocaleString()}</td>
          </tr>
        </table>
        <a href="https://herossmp.xyz/admin" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
          View in Admin Panel
        </a>
      </div>
    </body>
    </html>
  `

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'HeroS SMP <noreply@herossmp.xyz>',
        to: adminEmail,
        subject: `🆕 New player: ${newUsername}`,
        html,
      }),
    })
  } catch (e) {
    console.error('[Email] Failed to send admin notification:', e)
  }
}
