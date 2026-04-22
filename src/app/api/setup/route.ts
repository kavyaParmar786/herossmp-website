import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  // Security: only works if this secret matches
  const { secret, username, email, password } = await req.json()

  if (secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  await connectDB()

  const existing = await User.findOne({ $or: [{ email }, { username }] })
  if (existing) {
    await User.updateOne({ $or: [{ email }, { username }] }, { role: 'OWNER' })
    return NextResponse.json({ message: `${existing.username} is now OWNER` })
  }

  const user = await User.create({ username, email, password, role: 'OWNER' })
  return NextResponse.json({ message: `Created: ${user.username}` })
}
