import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Leaderboard } from '@/models/index'

// Demo data shown when the leaderboard is empty (no Minecraft plugin connected yet)
const DEMO_ENTRIES = [
  { playerName: 'Technoblade', kills: 4821, deaths: 3,   coins: 115000, playtime: 6100 },
  { playerName: 'Dream',       kills: 3902, deaths: 44,  coins: 98420,  playtime: 5420 },
  { playerName: 'Notch',       kills: 3201, deaths: 12,  coins: 72100,  playtime: 4310 },
  { playerName: 'Herobrine',   kills: 2987, deaths: 78,  coins: 64850,  playtime: 3950 },
  { playerName: 'xIsuma',      kills: 2450, deaths: 105, coins: 55200,  playtime: 2800 },
  { playerName: 'GoodTimesScar', kills: 1980, deaths: 201, coins: 42000, playtime: 2200 },
  { playerName: 'Mumbo',       kills: 1450, deaths: 320, coins: 33500,  playtime: 1850 },
  { playerName: 'Grian',       kills: 1200, deaths: 480, coins: 28000,  playtime: 1600 },
  { playerName: 'PearlescentMoon', kills: 980, deaths: 210, coins: 21000, playtime: 1200 },
  { playerName: 'ImpulseSV',   kills: 750,  deaths: 180, coins: 18500,  playtime: 980  },
]

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const sortBy = searchParams.get('sortBy') || 'kills'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    const validSortFields = ['kills', 'deaths', 'coins', 'playtime']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'kills'

    let entries = await Leaderboard.find()
      .sort({ [sortField]: -1 })
      .limit(limit)
      .lean()

    // If DB is empty, auto-seed demo data and return it
    if (entries.length === 0) {
      for (const p of DEMO_ENTRIES) {
        await Leaderboard.findOneAndUpdate(
          { playerName: p.playerName },
          p,
          { upsert: true, new: true }
        )
      }
      entries = await Leaderboard.find()
        .sort({ [sortField]: -1 })
        .limit(limit)
        .lean()
    }

    return NextResponse.json({ entries, sortBy: sortField })
  } catch (error) {
    console.error('Leaderboard GET error:', error)
    // Return demo data even if DB is down
    const sortBy = new URL(req.url).searchParams.get('sortBy') || 'kills'
    const sorted = [...DEMO_ENTRIES].sort((a, b) => 
      (b[sortBy as keyof typeof b] as number) - (a[sortBy as keyof typeof a] as number)
    )
    return NextResponse.json({ entries: sorted.map((e, i) => ({ ...e, _id: String(i) })), sortBy, demo: true })
  }
}

// DELETE used by admin panel
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

// POST used by Minecraft plugin (plugin_key auth) OR admin panel (JWT)
export async function POST(req: NextRequest) {
  try {
    // Check plugin key first (simpler auth for Minecraft plugins)
    const pluginKey = req.headers.get('x-plugin-key')
    const isPlugin = pluginKey && pluginKey === process.env.PLUGIN_API_KEY

    // Fallback: JWT admin auth
    if (!isPlugin) {
      const { requireRole } = await import('@/lib/auth')
      try {
        requireRole(req, ['ADMIN', 'OWNER'])
      } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    await connectDB()
    const body = await req.json()

    // Support both single entry and bulk array
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
