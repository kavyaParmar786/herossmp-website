import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Ticket from '@/models/Ticket'
import { requireAuth, hasPermission } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(req)
    await connectDB()

    const ticket = await Ticket.findById(params.id)
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    const canView = hasPermission(user.role, 'STAFF') || ticket.userId.toString() === user.userId
    if (!canView) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    return NextResponse.json({ ticket })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(req)
    await connectDB()

    const { content } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const ticket = await Ticket.findById(params.id)
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    const canReply = hasPermission(user.role, 'STAFF') || ticket.userId.toString() === user.userId
    if (!canReply) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (ticket.status === 'CLOSED') {
      return NextResponse.json({ error: 'Cannot reply to a closed ticket' }, { status: 400 })
    }

    ticket.messages.push({
      userId: user.userId as unknown as import('mongoose').Types.ObjectId,
      username: user.username,
      role: user.role,
      content: content.trim(),
      createdAt: new Date(),
      _id: new (require('mongoose').Types.ObjectId)(),
    })

    if (hasPermission(user.role, 'STAFF') && ticket.status === 'OPEN') {
      ticket.status = 'IN_PROGRESS'
    }

    await ticket.save()
    return NextResponse.json({ ticket })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Reply error:', error)
    return NextResponse.json({ error: 'Failed to reply' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(req)
    if (!hasPermission(user.role, 'STAFF')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await connectDB()

    const { status } = await req.json()
    const ticket = await Ticket.findByIdAndUpdate(params.id, { status }, { new: true })
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    return NextResponse.json({ ticket })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}
