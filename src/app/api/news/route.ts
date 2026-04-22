import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { News } from '@/models/index'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const news = await News.find().sort({ createdAt: -1 }).limit(limit)
    return NextResponse.json({ news })
  } catch (error) {
    console.error('News GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireRole(req, ['ADMIN', 'OWNER', 'STAFF'])
    await connectDB()

    const body = await req.json()
    const news = await News.create({ ...body, author: user.username })

    return NextResponse.json({ news }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && ['Unauthorized', 'Forbidden'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 })
  }
}
