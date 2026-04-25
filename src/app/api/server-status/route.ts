import { NextResponse } from 'next/server'

export const revalidate = 30

interface MCPlayer { name: string; id?: string }

async function tryMcsrvstat(ip: string) {
  // v3 API — most reliable for online/count
  const res = await fetch(`https://api.mcsrvstat.us/3/${ip}`, { next: { revalidate: 30 } })
  if (!res.ok) return null
  const data = await res.json()
  return {
    online: data.online || false,
    players: {
      online: data.players?.online || 0,
      max: data.players?.max || 0,
      // mcsrvstat only returns names if query is enabled on the server
      list: (data.players?.list as MCPlayer[] || []).map(p => p.name).filter(Boolean),
    },
    motd: data.motd?.clean?.[0] || 'HeroS SMP',
    version: data.version || 'Unknown',
  }
}

async function tryMcstatus(ip: string) {
  // mcstatus.io — sometimes returns player list when mcsrvstat doesn't
  const res = await fetch(`https://api.mcstatus.io/v2/status/java/${ip}`, { next: { revalidate: 30 } })
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
  }
}

export async function GET() {
  const serverIP = process.env.MINECRAFT_SERVER_IP || 'play.herossmp.xyz'

  try {
    // Try both APIs in parallel, prefer whichever returns player names
    const [a, b] = await Promise.allSettled([
      tryMcsrvstat(serverIP),
      tryMcstatus(serverIP),
    ])

    const resultA = a.status === 'fulfilled' ? a.value : null
    const resultB = b.status === 'fulfilled' ? b.value : null

    // Pick the result that has player names if possible
    const best = (resultB?.players.list.length ?? 0) > (resultA?.players.list.length ?? 0)
      ? resultB
      : resultA

    if (!best) {
      return NextResponse.json({
        online: false, players: { online: 0, max: 0, list: [] },
        motd: 'Server status unavailable', version: 'Unknown', ip: serverIP,
      })
    }

    return NextResponse.json({ ...best, ip: serverIP })
  } catch (error) {
    console.error('Server status error:', error)
    return NextResponse.json({
      online: false, players: { online: 0, max: 0, list: [] },
      motd: 'Could not reach server', version: 'Unknown', ip: serverIP,
    })
  }
}
