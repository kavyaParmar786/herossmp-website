'use client'
import { useState, useEffect, useCallback } from 'react'
import { LeaderboardEntry } from '@/types'
import { Trophy, Sword, Coins, Clock, Skull, RefreshCw, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'kills',    label: 'Kills',    icon: Sword,  color: 'text-red-400' },
  { key: 'deaths',   label: 'Deaths',   icon: Skull,  color: 'text-slate-400' },
  { key: 'coins',    label: 'Coins',    icon: Coins,  color: 'text-yellow-400' },
  { key: 'playtime', label: 'Playtime', icon: Clock,  color: 'text-cyan-400' },
]

const RANK_STYLES = [
  { bg: 'rank-gold',   text: 'text-yellow-300', icon: '👑', glow: '0 0 15px rgba(255,215,0,0.3)' },
  { bg: 'rank-silver', text: 'text-slate-300',  icon: '🥈', glow: '0 0 10px rgba(192,192,192,0.2)' },
  { bg: 'rank-bronze', text: 'text-amber-500',  icon: '🥉', glow: '0 0 10px rgba(205,127,50,0.2)' },
]

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [sortBy, setSortBy] = useState('kills')
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [error, setError] = useState(false)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setError(false)
      const res = await fetch(`/api/leaderboard?sortBy=${sortBy}&limit=10`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setEntries(data.entries || [])
      setLastRefresh(new Date())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [sortBy])

  useEffect(() => { setLoading(true); setEntries([]); fetchLeaderboard() }, [fetchLeaderboard])
  useEffect(() => { const i = setInterval(fetchLeaderboard, 15000); return () => clearInterval(i) }, [fetchLeaderboard])

  const getValue = (entry: LeaderboardEntry) => {
    switch (sortBy) {
      case 'kills':    return entry.kills?.toLocaleString() ?? '0'
      case 'deaths':   return entry.deaths?.toLocaleString() ?? '0'
      case 'coins':    return `⬡ ${entry.coins?.toLocaleString() ?? '0'}`
      case 'playtime': {
        const mins = entry.playtime ?? 0
        const h = Math.floor(mins / 60); const m = mins % 60
        return h > 0 ? `${h}h ${m}m` : `${m}m`
      }
      default: return '0'
    }
  }

  const activeTab = TABS.find(t => t.key === sortBy)!

  return (
    <div className="glass-gold rounded-2xl overflow-hidden h-full flex flex-col" style={{ boxShadow: '0 0 40px rgba(212,175,55,0.08), 0 8px 32px rgba(0,0,0,0.6)' }}>
      {/* Header */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(212,175,55,0.12)', background: 'rgba(212,175,55,0.03)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <Trophy className="w-4 h-4 text-gold-mid" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm tracking-wide">Hall of Fame</h3>
              <p className="text-xs text-slate-500">Top players this season</p>
            </div>
          </div>
          <button
            onClick={() => { setLoading(true); fetchLeaderboard() }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-gold-mid transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
            <span className="text-gold-dim font-medium">Live</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3 pb-1">
        {TABS.map(({ key, label, icon: Icon, color }) => (
          <button key={key} onClick={() => setSortBy(key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex-1 justify-center',
              sortBy === key
                ? 'text-gold-mid border'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            )}
            style={sortBy === key ? {
              background: 'rgba(212,175,55,0.08)',
              borderColor: 'rgba(212,175,55,0.25)',
              boxShadow: '0 0 10px rgba(212,175,55,0.1)',
            } : {}}>
            <Icon className={cn('w-3 h-3', sortBy === key ? 'text-gold-mid' : color)} />
            {label}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="p-4 space-y-2 flex-1 overflow-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 shimmer rounded-xl" />
          ))
        ) : error ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20 text-gold-mid" />
            <p className="mb-3">Could not reach leaderboard</p>
            <button onClick={fetchLeaderboard} className="text-gold-mid hover:text-gold-light text-xs underline">
              Retry
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            <Crown className="w-10 h-10 mx-auto mb-3 opacity-20 text-gold-mid" />
            <p>No warriors yet — be the first!</p>
          </div>
        ) : entries.map((entry, index) => {
          const rank = RANK_STYLES[index]
          return (
            <div key={entry._id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 cursor-default group',
                index < 3 ? rank.bg : 'border-white/5 hover:border-white/10 hover:bg-white/2'
              )}
              style={index < 3 ? { boxShadow: rank.glow } : {}}>

              {/* Rank */}
              <div className="w-7 text-center flex-shrink-0 font-bold text-sm">
                {index < 3
                  ? <span className="text-base">{rank.icon}</span>
                  : <span className="text-slate-600">{index + 1}</span>
                }
              </div>

              {/* MC Head */}
              <img
                src={`https://mc-heads.net/avatar/${encodeURIComponent(entry.playerName)}/32`}
                alt={entry.playerName}
                width={32} height={32}
                className="w-8 h-8 rounded-md flex-shrink-0 border border-white/10"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve/32' }}
              />

              {/* Name */}
              <span className={cn('flex-1 font-semibold text-sm truncate', index < 3 ? rank.text : 'text-slate-300 group-hover:text-white')}>
                {entry.playerName}
              </span>

              {/* Value */}
              <span className={cn('font-mono font-bold text-sm', index < 3 ? rank.text : activeTab.color)}>
                {getValue(entry)}
              </span>
            </div>
          )
        })}
      </div>

      <div className="px-6 pb-4 pt-2" style={{ borderTop: '1px solid rgba(212,175,55,0.06)' }}>
        <p className="text-xs text-slate-600 text-center">
          Updates every 15s · {lastRefresh.toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
