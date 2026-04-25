import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Leaderboard } from '@/models/index'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const sortBy = searchParams.get('sortBy') || 'kills'
    const limit  = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    const validSortFields = ['kills', 'deaths', 'coins', 'playtime']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'kills'

    const entries = await Leaderboard.find()
      .sort({ [sortField]: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ entries, sortBy: sortField })
  } catch (error) {
    console.error('Leaderboard GET error:', error)
    return NextResponse.json({ entries: [], sortBy: 'kills' }, { status: 500 })
  }
}

// DELETE — admin panel removes a player entry
export async function DELETE(req: NextRequest) {
  try {
    const { requireRole } = await import('@/lib/auth')
    requireRole(req, ['ADMIN', 'OWNER'])
    await connectDB()
    const { searchParams } = new URL(req.url)
    const playerName = searchParams.get('playerName')
    if (!playerName) return NextResponse.json({ error: 'playerName required' }, { status: 400 })
    await Leaderboard.deleteOne({ playerName })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error && ['Unauthorized', 'Forbidden'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

// POST — Minecraft plugin (x-plugin-key) OR admin panel (JWT) upserts stats
export async function POST(req: NextRequest) {
  try {
    const pluginKey = req.headers.get('x-plugin-key')
    const isPlugin  = pluginKey && pluginKey === process.env.PLUGIN_API_KEY

    if (!isPlugin) {
      const { requireRole } = await import('@/lib/auth')
      try { requireRole(req, ['ADMIN', 'OWNER']) }
      catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }

    await connectDB()
    const body = await req.json()

    if (Array.isArray(body)) {
      const results = []
      for (const item of body) {
        const { playerName, kills = 0, deaths = 0, coins = 0, playtime = 0 } = item
        if (!playerName) continue
        const entry = await Leaderboard.findOneAndUpdate(
          { playerName },
          { kills, deaths, coins, playtime },
          { upsert: true, new: true }
        )
        results.push(entry)
      }
      return NextResponse.json({ success: true, updated: results.length })
    }

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
    console.error('Leaderboard POST error:', error)
    return NextResponse.json({ error: 'Failed to update leaderboard' }, { status: 500 })
  }
}
