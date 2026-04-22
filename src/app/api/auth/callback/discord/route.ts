import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { signToken } from '@/lib/auth'
import { sendWelcomeEmail, sendNewPlayerNotification } from '@/lib/email'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const origin = req.nextUrl.origin
  if (!code) return NextResponse.redirect(`${origin}/login?error=oauth_cancelled`)

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.DISCORD_CLIENT_ID || '',
        client_secret: process.env.DISCORD_CLIENT_SECRET || '',
        redirect_uri: `${origin}/api/auth/callback/discord`,
        grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) return NextResponse.redirect(`${origin}/login?error=oauth_failed`)

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await userRes.json()
    const avatar = profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined

    await connectDB()
    const username = (profile.username || `discord_${profile.id.substring(0, 8)}`).replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 16)
    const email = profile.email || `${profile.id}@discord.herossmp.xyz`

    let user = await User.findOne({ provider: 'discord', providerId: profile.id })
    let isNew = false
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() })
      if (user) { user.provider = 'discord'; user.providerId = profile.id; if (avatar) user.avatar = avatar; await user.save() }
      else {
        isNew = true
        let u = username
        const ex = await User.findOne({ username: u })
        if (ex) u = u.substring(0, 12) + Math.floor(Math.random() * 9999)
        user = await User.create({ username: u, email: email.toLowerCase(), provider: 'discord', providerId: profile.id, avatar, role: 'USER' })
      }
    }
    if (isNew) {
      Promise.all([
        sendWelcomeEmail(user.email, user.username),
        process.env.ADMIN_EMAIL ? sendNewPlayerNotification(process.env.ADMIN_EMAIL, user.username, user.email) : Promise.resolve(),
      ]).catch(() => {})
    }

    const token = signToken({ userId: user._id.toString(), username: user.username, email: user.email, role: user.role })
    const res = NextResponse.redirect(`${origin}/dashboard`)
    res.cookies.set('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 })
    res.cookies.set('oauth-user', JSON.stringify({ _id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar, provider: 'discord' }), { maxAge: 10, httpOnly: false })
    return res
  } catch (e) {
    console.error('Discord OAuth error:', e)
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }
}
