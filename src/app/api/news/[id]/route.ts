import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { News } from '@/models/index'
import { requireAuth, hasPermission } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = requireAuth(req)
    if (!hasPermission(user.role, 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await connectDB()
    const body = await req.json()
    const news = await News.findByIdAndUpdate(id, body, { new: true })
    if (!news) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ news })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = requireAuth(req)
    if (!hasPermission(user.role, 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await connectDB()
    await News.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
