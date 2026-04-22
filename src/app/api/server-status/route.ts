import { NextResponse } from 'next/server'

export const revalidate = 30 // Cache for 30 seconds

export async function GET() {
  try {
    const serverIP = process.env.MINECRAFT_SERVER_IP || 'play.herossmp.xyz'

    const response = await fetch(`https://api.mcsrvstat.us/3/${serverIP}`, {
      next: { revalidate: 30 },
    })

    if (!response.ok) {
      return NextResponse.json({
        online: false,
        players: { online: 0, max: 0, list: [] },
        motd: 'Server status unavailable',
        version: 'Unknown',
        ip: serverIP,
      })
    }

    const data = await response.json()

    return NextResponse.json({
      online: data.online || false,
      players: {
        online: data.players?.online || 0,
        max: data.players?.max || 0,
        list: data.players?.list?.map((p: { name: string }) => p.name) || [],
      },
      motd: data.motd?.clean?.[0] || 'HeroS SMP - The Ultimate Survival Experience',
      version: data.version || 'Unknown',
      ip: serverIP,
    })
  } catch (error) {
    console.error('Server status error:', error)
    return NextResponse.json({
      online: false,
      players: { online: 0, max: 0, list: [] },
      motd: 'Could not reach server',
      version: 'Unknown',
      ip: process.env.MINECRAFT_SERVER_IP || 'play.herossmp.xyz',
    })
  }
}
