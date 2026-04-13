import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Leaderboard } from '@/models/index'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const sortBy = searchParams.get('sortBy') || 'kills'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    const validSortFields = ['kills', 'deaths', 'coins', 'playtime']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'kills'

    const entries = await Leaderboard.find()
      .sort({ [sortField]: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ entries, sortBy: sortField })
  } catch (error) {
    console.error('Leaderboard GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN', 'OWNER'])
    await connectDB()

    const body = await req.json()
    const { playerName, kills = 0, deaths = 0, coins = 0, playtime = 0 } = body

    if (!playerName) {
      return NextResponse.json({ error: 'playerName is required' }, { status: 400 })
    }

    const entry = await Leaderboard.findOneAndUpdate(
      { playerName },
      { kills, deaths, coins, playtime },
      { upsert: true, new: true }
    )

    return NextResponse.json({ entry })
  } catch (error: unknown) {
    if (error instanceof Error && ['Unauthorized', 'Forbidden'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Failed to update leaderboard' }, { status: 500 })
  }
}
