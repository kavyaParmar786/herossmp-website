import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { signToken } from '@/lib/auth'
import { sendWelcomeEmail, sendNewPlayerNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { username, email, password } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return NextResponse.json(
        { error: existingUser.email === email ? 'Email already in use' : 'Username already taken' },
        { status: 409 }
      )
    }

    const user = await User.create({ username, email, password, role: 'USER', provider: 'email' })

    const token = signToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    })

    // Send emails in background (don't block response)
    Promise.all([
      sendWelcomeEmail(email, username),
      process.env.ADMIN_EMAIL
        ? sendNewPlayerNotification(process.env.ADMIN_EMAIL, username, email)
        : Promise.resolve(),
    ]).catch(() => {})

    const response = NextResponse.json({
      success: true,
      user: { _id: user._id, username: user.username, email: user.email, role: user.role },
      token,
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error: unknown) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
