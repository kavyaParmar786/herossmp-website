'use client'
import { useState, useEffect, useCallback } from 'react'
import { LeaderboardEntry } from '@/types'
import { Trophy, Sword, Coins, Clock, Skull, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'kills',    label: 'Kills',    icon: Sword,  color: 'text-red-400',    unit: '' },
  { key: 'deaths',   label: 'Deaths',   icon: Skull,  color: 'text-slate-400',  unit: '' },
  { key: 'coins',    label: 'Coins',    icon: Coins,  color: 'text-yellow-400', unit: '' },
  { key: 'playtime', label: 'Playtime', icon: Clock,  color: 'text-cyan-400',   unit: '' },
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

  useEffect(() => {
    setLoading(true)
    setEntries([])
    fetchLeaderboard()
  }, [fetchLeaderboard])

  useEffect(() => {
    const interval = setInterval(fetchLeaderboard, 10000)
    return () => clearInterval(interval)
  }, [fetchLeaderboard])

  const getValue = (entry: LeaderboardEntry) => {
    switch (sortBy) {
      case 'kills':    return entry.kills?.toLocaleString() ?? '0'
      case 'deaths':   return entry.deaths?.toLocaleString() ?? '0'
      case 'coins':    return entry.coins?.toLocaleString() ?? '0'
      case 'playtime': {
        const mins = entry.playtime ?? 0
        const h = Math.floor(mins / 60)
        const m = mins % 60
        return h > 0 ? `${h}h ${m}m` : `${m}m`
      }
      default: return '0'
    }
  }

  const rankBg = [
    'bg-yellow-500/20 border-yellow-500/30',
    'bg-slate-400/10 border-slate-400/20',
    'bg-amber-700/20 border-amber-700/30',
  ]
  const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-500']

  const activeTab = TABS.find(t => t.key === sortBy)!

  return (
    <div className="glass rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="font-display font-bold text-white">Leaderboard</h3>
        </div>
        <button
          onClick={() => { setLoading(true); fetchLeaderboard() }}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          title="Refresh now"
        >
          <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
          Live
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3 flex-wrap">
        {TABS.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
              sortBy === key
                ? 'bg-hero-purple/30 text-hero-glow border border-hero-violet/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon className={cn('w-3.5 h-3.5', sortBy === key ? 'text-hero-glow' : color)} />
            {label}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="p-4 space-y-2 flex-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 shimmer rounded-lg" />
          ))
        ) : error ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            <p className="mb-2">Could not load leaderboard</p>
            <button onClick={fetchLeaderboard} className="text-hero-glow hover:underline text-xs">
              Try again
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No data yet — add players via Admin Panel
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={entry._id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200',
                index < 3
                  ? rankBg[index]
                  : 'border-white/5 hover:border-white/10'
              )}
            >
              {/* Rank badge */}
              <div className="w-7 text-center font-bold text-sm flex-shrink-0">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (
                  <span className="text-slate-500">{index + 1}</span>
                )}
              </div>

              {/* MC head */}
              <img
                src={`https://mc-heads.net/avatar/${encodeURIComponent(entry.playerName)}/32`}
                alt={entry.playerName}
                width={32}
                height={32}
                className="w-8 h-8 rounded-md flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve/32'
                }}
              />

              {/* Name */}
              <span className={cn(
                'flex-1 font-semibold text-sm truncate',
                index < 3 ? rankColors[index] : 'text-slate-300'
              )}>
                {entry.playerName}
              </span>

              {/* Value */}
              <span className={cn('font-mono font-bold text-sm', activeTab.color)}>
                {getValue(entry)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="px-6 pb-4 text-center">
        <p className="text-xs text-slate-600">
          Refreshes every 10s · {lastRefresh.toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
