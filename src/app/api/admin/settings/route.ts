import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { SiteSettings } from '@/models/index'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    let settings = await SiteSettings.findOne({ key: 'global' })
    if (!settings) {
      settings = await SiteSettings.create({ key: 'global' })
    }
    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return PUT(req)
}

export async function PUT(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN', 'OWNER'])
    await connectDB()

    const body = await req.json()
    const settings = await SiteSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: body },
      { upsert: true, new: true }
    )
    return NextResponse.json({ settings })
  } catch (error: unknown) {
    if (error instanceof Error && ['Unauthorized', 'Forbidden'].includes(error.message)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
