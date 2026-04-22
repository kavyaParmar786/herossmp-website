'use client'
import { useState, useEffect } from 'react'
import { ServerStatus } from '@/types'
import { Wifi, WifiOff, Users, Copy, Check, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ServerStatusCard() {
  const [status, setStatus] = useState<ServerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/server-status')
      setStatus(await res.json())
    } catch {
      setStatus({ online: false, players: { online: 0, max: 0, list: [] }, motd: 'Error', version: 'Unknown', ip: 'play.herossmp.xyz' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStatus(); const i = setInterval(fetchStatus, 60000); return () => clearInterval(i) }, [])

  const copyIP = async () => {
    await navigator.clipboard.writeText(status?.ip || 'play.herossmp.xyz')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="glass-gold rounded-2xl p-6" style={{ boxShadow: '0 0 40px rgba(212,175,55,0.05), 0 8px 32px rgba(0,0,0,0.6)' }}>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-white/8 rounded w-36" />
          <div className="h-10 bg-white/5 rounded-xl" />
          <div className="h-3 bg-white/5 rounded w-2/3" />
        </div>
      </div>
    )
  }

  return (
    <div className="glass-gold rounded-2xl overflow-hidden flex flex-col"
      style={{
        boxShadow: status?.online
          ? '0 0 40px rgba(16,185,129,0.08), 0 0 40px rgba(212,175,55,0.05), 0 8px 32px rgba(0,0,0,0.6)'
          : '0 0 40px rgba(212,175,55,0.05), 0 8px 32px rgba(0,0,0,0.6)',
      }}>

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(212,175,55,0.1)', background: 'rgba(212,175,55,0.03)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <Zap className="w-4 h-4 text-gold-mid" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-sm tracking-wide">Server Status</h3>
            <p className="text-xs text-slate-500">play.herossmp.xyz</p>
          </div>
        </div>
        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border',
          status?.online
            ? 'text-green-300'
            : 'text-red-300'
        )}
        style={{
          background: status?.online ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          borderColor: status?.online ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)',
        }}>
          <span className={cn('w-2 h-2 rounded-full', status?.online ? 'bg-green-400 status-online' : 'bg-red-400')} />
          {status?.online ? 'ONLINE' : 'OFFLINE'}
        </div>
      </div>

      <div className="p-6 space-y-5 flex-1">
        {/* MOTD */}
        <p className="text-slate-400 text-sm italic leading-relaxed"
          style={{ textShadow: '0 0 20px rgba(212,175,55,0.1)' }}>
          "{status?.motd}"
        </p>

        {/* IP copy */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-sm"
            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <span className="text-gold-mid font-bold tracking-wide">{status?.ip}</span>
          </div>
          <button onClick={copyIP}
            className="p-2.5 rounded-xl transition-all duration-200 gold-ring"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}
            title="Copy IP">
            {copied
              ? <Check className="w-4 h-4 text-green-400" />
              : <Copy className="w-4 h-4 text-gold-mid" />}
          </button>
        </div>

        {/* Players */}
        {status?.online && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Users className="w-4 h-4 text-gold-dim" />
                <span>Players Online</span>
              </div>
              <span className="font-bold text-white font-mono">
                <span className="text-gold-mid">{status.players.online}</span>
                <span className="text-slate-600"> / {status.players.max}</span>
              </span>
            </div>

            {/* Player bar */}
            <div className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((status.players.online / status.players.max) * 100, 100)}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #D4AF37)',
                  boxShadow: '0 0 8px rgba(212,175,55,0.4)',
                }}
              />
            </div>

            {/* Player list */}
            {status.players.list.length > 0 && (
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-widest mb-2 font-semibold">Online Now</p>
                <div className="flex flex-wrap gap-1.5">
                  {status.players.list.slice(0, 8).map((name) => (
                    <span key={name}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-300 border"
                      style={{ background: 'rgba(212,175,55,0.04)', borderColor: 'rgba(212,175,55,0.1)' }}>
                      <img src={`https://mc-heads.net/avatar/${name}/16`} alt={name}
                        className="w-4 h-4 rounded-sm"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      {name}
                    </span>
                  ))}
                  {status.players.list.length > 8 && (
                    <span className="px-2.5 py-1 text-xs text-slate-500 border border-white/5 rounded-lg">
                      +{status.players.list.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!status?.online && (
          <div className="text-center py-6">
            <WifiOff className="w-10 h-10 mx-auto mb-3 text-slate-700" />
            <p className="text-slate-500 text-sm">Server is currently offline</p>
            <p className="text-slate-600 text-xs mt-1">Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
