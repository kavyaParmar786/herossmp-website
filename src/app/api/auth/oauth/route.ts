import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { signToken } from '@/lib/auth'
import { sendWelcomeEmail, sendNewPlayerNotification } from '@/lib/email'

// POST /api/auth/oauth
// Body: { provider, providerId, email, username, avatar }
// Called from client after OAuth popup callback
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { provider, providerId, email, username, avatar } = await req.json()

    if (!provider || !providerId || !email) {
      return NextResponse.json({ error: 'Missing OAuth data' }, { status: 400 })
    }

    // Check if user exists by providerId
    let user = await User.findOne({ provider, providerId })

    if (!user) {
      // Check by email (might have registered with email before)
      user = await User.findOne({ email: email.toLowerCase() })

      if (user) {
        // Link provider to existing account
        user.provider = provider
        user.providerId = providerId
        if (avatar) user.avatar = avatar
        await user.save()
      } else {
        // Create new user — ensure unique username
        let finalUsername = username || email.split('@')[0]
        finalUsername = finalUsername.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 16)
        const existing = await User.findOne({ username: finalUsername })
        if (existing) {
          finalUsername = finalUsername.substring(0, 12) + Math.floor(Math.random() * 9999)
        }

        user = await User.create({
          username: finalUsername,
          email: email.toLowerCase(),
          provider,
          providerId,
          avatar,
          role: 'USER',
        })

        // Send welcome + admin notification
        Promise.all([
          sendWelcomeEmail(email, finalUsername),
          process.env.ADMIN_EMAIL
            ? sendNewPlayerNotification(process.env.ADMIN_EMAIL, finalUsername, email)
            : Promise.resolve(),
        ]).catch(() => {})
      }
    }

    const token = signToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider,
      },
      token,
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.json({ error: 'OAuth authentication failed' }, { status: 500 })
  }
}
