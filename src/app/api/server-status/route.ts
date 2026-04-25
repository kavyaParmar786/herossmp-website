import { NextResponse } from 'next/server'

export const revalidate = 30

interface MCPlayer { name: string; name_clean?: string; id?: string }

async function tryMcsrvstat(gameIP: string, queryIP: string) {
  // Use query port for mcsrvstat so it can fetch player names
  const res = await fetch(`https://api.mcsrvstat.us/3/${queryIP}`, { next: { revalidate: 30 } })
  if (!res.ok) return null
  const data = await res.json()
  return {
    online: data.online || false,
    players: {
      online: data.players?.online || 0,
      max: data.players?.max || 0,
      list: (data.players?.list as MCPlayer[] || []).map(p => p.name).filter(Boolean),
    },
    motd: data.motd?.clean?.[0] || 'HeroS SMP',
    version: data.version || 'Unknown',
    ip: gameIP, // always show the game IP to players
  }
}

async function tryMcstatus(gameIP: string, queryIP: string) {
  const res = await fetch(`https://api.mcstatus.io/v2/status/java/${queryIP}`, { next: { revalidate: 30 } })
  if (!res.ok) return null
  const data = await res.json()
  return {
    online: data.online || false,
    players: {
      online: data.players?.online || 0,
      max: data.players?.max || 0,
      list: (data.players?.list as MCPlayer[] || []).map(p => p.name_clean || p.name).filter(Boolean),
    },
    motd: data.motd?.clean || 'HeroS SMP',
    version: data.version?.name_clean || 'Unknown',
    ip: gameIP,
  }
}

export async function GET() {
  // Game IP — what players type to connect
  const gameIP  = process.env.MINECRAFT_SERVER_IP    || 'play.herossmp.xyz:25591'
  // Query IP — the port with enable-query=true (for fetching player names)
  const queryIP = process.env.MINECRAFT_QUERY_IP     || 'play.herossmp.xyz:25565'

  try {
    const [a, b] = await Promise.allSettled([
      tryMcsrvstat(gameIP, queryIP),
      tryMcstatus(gameIP, queryIP),
    ])

    const resultA = a.status === 'fulfilled' ? a.value : null
    const resultB = b.status === 'fulfilled' ? b.value : null

    // Pick whichever result has more player names
    const best = (resultB?.players.list.length ?? 0) > (resultA?.players.list.length ?? 0)
      ? resultB : resultA

    if (!best) {
      return NextResponse.json({
        online: false, players: { online: 0, max: 0, list: [] },
        motd: 'Server status unavailable', version: 'Unknown', ip: gameIP,
      })
    }

    return NextResponse.json(best)
  } catch (error) {
    console.error('Server status error:', error)
    return NextResponse.json({
      online: false, players: { online: 0, max: 0, list: [] },
      motd: 'Could not reach server', version: 'Unknown', ip: gameIP,
    })
  }
}
