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
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: `${origin}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) return NextResponse.redirect(`${origin}/login?error=oauth_failed`)

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await userRes.json()

    await connectDB()
    const { user, isNew } = await upsertOAuthUser({
      provider: 'google',
      providerId: profile.id,
      email: profile.email,
      username: profile.name?.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').substring(0, 16) || `google_${profile.id.substring(0, 8)}`,
      avatar: profile.picture,
    })

    if (isNew) {
      Promise.all([
        sendWelcomeEmail(user.email, user.username),
        process.env.ADMIN_EMAIL ? sendNewPlayerNotification(process.env.ADMIN_EMAIL, user.username, user.email) : Promise.resolve(),
      ]).catch(() => {})
    }

    const token = signToken({ userId: user._id.toString(), username: user.username, email: user.email, role: user.role })
    const res = NextResponse.redirect(`${origin}/dashboard`)
    res.cookies.set('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 })
    // Pass user data to client via cookie (short-lived, readable)
    res.cookies.set('oauth-user', JSON.stringify({ _id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar, provider: 'google' }), { maxAge: 10, httpOnly: false })
    return res
  } catch (e) {
    console.error('Google OAuth error:', e)
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }
}

async function upsertOAuthUser({ provider, providerId, email, username, avatar }: { provider: string, providerId: string, email: string, username: string, avatar?: string }) {
  let user = await User.findOne({ provider, providerId })
  let isNew = false
  if (!user) {
    user = await User.findOne({ email: email.toLowerCase() })
    if (user) {
      user.provider = provider as 'google'
      user.providerId = providerId
      if (avatar) user.avatar = avatar
      await user.save()
    } else {
      isNew = true
      let finalUsername = username
      const exists = await User.findOne({ username: finalUsername })
      if (exists) finalUsername = finalUsername.substring(0, 12) + Math.floor(Math.random() * 9999)
      user = await User.create({ username: finalUsername, email: email.toLowerCase(), provider, providerId, avatar, role: 'USER' })
    }
  }
  return { user, isNew }
}
