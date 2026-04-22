import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Ticket from '@/models/Ticket'
import { requireAuth, getUserFromRequest, hasPermission } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)
    await connectDB()

    let tickets
    if (hasPermission(user.role, 'STAFF')) {
      tickets = await Ticket.find().sort({ updatedAt: -1 }).select('-messages')
    } else {
      tickets = await Ticket.find({ userId: user.userId }).sort({ updatedAt: -1 }).select('-messages')
    }

    return NextResponse.json({ tickets })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)
    await connectDB()

    const { subject, category, message } = await req.json()

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    const ticket = await Ticket.create({
      userId: user.userId,
      username: user.username,
      subject,
      category: category || 'GENERAL',
      status: 'OPEN',
      messages: [
        {
          userId: user.userId,
          username: user.username,
          role: user.role,
          content: message,
        },
      ],
    })

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Ticket create error:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
