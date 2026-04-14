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
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        redirect_uri: `${origin}/api/auth/callback/twitter`,
        grant_type: 'authorization_code',
        code_verifier: 'challenge',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) return NextResponse.redirect(`${origin}/login?error=oauth_failed`)

    const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const { data: profile } = await userRes.json()

    await connectDB()
    const username = (profile.username || `twitter_${profile.id.substring(0, 8)}`).replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 16)
    const email = `${profile.id}@twitter.herossmp.xyz`
    const avatar = profile.profile_image_url?.replace('_normal', '_bigger')

    let user = await User.findOne({ provider: 'twitter', providerId: profile.id })
    let isNew = false
    if (!user) {
      user = await User.findOne({ email })
      if (user) { user.provider = 'twitter'; user.providerId = profile.id; if (avatar) user.avatar = avatar; await user.save() }
      else {
        isNew = true
        let u = username
        const ex = await User.findOne({ username: u })
        if (ex) u = u.substring(0, 12) + Math.floor(Math.random() * 9999)
        user = await User.create({ username: u, email, provider: 'twitter', providerId: profile.id, avatar, role: 'USER' })
      }
    }
    if (isNew) sendWelcomeEmail(user.email, user.username).catch(() => {})

    const token = signToken({ userId: user._id.toString(), username: user.username, email: user.email, role: user.role })
    const res = NextResponse.redirect(`${origin}/dashboard`)
    res.cookies.set('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 })
    res.cookies.set('oauth-user', JSON.stringify({ _id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar, provider: 'twitter' }), { maxAge: 10, httpOnly: false })
    return res
  } catch (e) {
    console.error('Twitter OAuth error:', e)
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }
}
