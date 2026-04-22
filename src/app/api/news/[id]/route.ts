import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { News } from '@/models/index'
import { requireRole } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['ADMIN', 'OWNER', 'STAFF'])
    await connectDB()

    const body = await req.json()
    const news = await News.findByIdAndUpdate(params.id, body, { new: true })
    if (!news) return NextResponse.json({ error: 'News not found' }, { status: 404 })

    return NextResponse.json({ news })
  } catch (error: unknown) {
    if (error instanceof Error && ['Unauthorized', 'Forbidden'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Failed to update news' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['ADMIN', 'OWNER'])
    await connectDB()

    await News.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error && ['Unauthorized', 'Forbidden'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 })
  }
}
