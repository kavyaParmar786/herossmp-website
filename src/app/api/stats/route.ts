import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { Leaderboard } from '@/models/index'

export async function GET() {
  try {
    await connectDB()

    const [totalPlayers, leaderboardStats] = await Promise.all([
      User.countDocuments(),
      Leaderboard.aggregate([
        {
          $group: {
            _id: null,
            totalKills: { $sum: '$kills' },
            totalPlaytime: { $sum: '$playtime' },
          },
        },
      ]),
    ])

    const stats = leaderboardStats[0] || { totalKills: 0, totalPlaytime: 0 }

    return NextResponse.json({
      players: totalPlayers,
      dailyBattles: stats.totalKills,
      ranks: 8,
      uptime: '99.9%',
    })
  } catch (error) {
    console.error('Stats error:', error)
    // Return fallback so homepage never breaks
    return NextResponse.json({
      players: 0,
      dailyBattles: 0,
      ranks: 8,
      uptime: '99.9%',
    })
  }
}
