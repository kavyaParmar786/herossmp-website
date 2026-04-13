'use client'
import { useState, useEffect } from 'react'
import { ServerStatus } from '@/types'
import { Wifi, WifiOff, Users, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ServerStatusCard() {
  const [status, setStatus] = useState<ServerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/server-status')
      const data = await res.json()
      setStatus(data)
    } catch {
      setStatus({ online: false, players: { online: 0, max: 0, list: [] }, motd: 'Error', version: 'Unknown', ip: 'play.herossmp.xyz' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const copyIP = async () => {
    await navigator.clipboard.writeText(status?.ip || 'play.herossmp.xyz')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-32 mb-4" />
        <div className="h-8 bg-white/10 rounded w-48 mb-2" />
        <div className="h-4 bg-white/10 rounded w-full" />
      </div>
    )
  }

  return (
    <div className={cn(
      'glass rounded-2xl p-6 border transition-all duration-300',
      status?.online
        ? 'border-green-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
        : 'border-red-500/20'
    )}>
      {/* Status header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {status?.online ? (
            <Wifi className="w-5 h-5 text-green-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
          <span className="font-display font-semibold text-sm uppercase tracking-wider text-slate-300">
            Server Status
          </span>
        </div>
        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold',
          status?.online
            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        )}>
          <span className={cn(
            'w-2 h-2 rounded-full',
            status?.online ? 'bg-green-400 status-online' : 'bg-red-400'
          )} />
          {status?.online ? 'ONLINE' : 'OFFLINE'}
        </div>
      </div>

      {/* MOTD */}
      <p className="text-slate-300 text-sm mb-4 italic">"{status?.motd}"</p>

      {/* Server IP */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 glass rounded-lg px-3 py-2 font-mono text-sm text-hero-glow">
          {status?.ip}
        </div>
        <button
          onClick={copyIP}
          className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
          title="Copy IP"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Players */}
      {status?.online && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4" />
              Players Online
            </span>
            <span className="font-bold text-white">
              {status.players.online} / {status.players.max}
            </span>
          </div>

          {/* Player progress bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-hero-purple to-hero-cyan rounded-full transition-all duration-500"
              style={{ width: `${Math.min((status.players.online / status.players.max) * 100, 100)}%` }}
            />
          </div>

          {/* Player list */}
          {status.players.list.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Online Now</p>
              <div className="flex flex-wrap gap-1.5">
                {status.players.list.slice(0, 8).map((name) => (
                  <span key={name} className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-md text-xs text-slate-300 border border-white/10">
                    <img
                      src={`https://mc-heads.net/avatar/${name}/16`}
                      alt={name}
                      className="w-4 h-4 rounded-sm"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    {name}
                  </span>
                ))}
                {status.players.list.length > 8 && (
                  <span className="px-2 py-0.5 bg-white/5 rounded-md text-xs text-slate-400">
                    +{status.players.list.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
