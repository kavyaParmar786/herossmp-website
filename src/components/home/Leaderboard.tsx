'use client'
import { useState, useEffect } from 'react'
import { LeaderboardEntry } from '@/types'
import { Trophy, Sword, Coins, Clock, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const TABS = [
  { key: 'kills', label: 'Kills', icon: Sword },
  { key: 'coins', label: 'Coins', icon: Coins },
  { key: 'playtime', label: 'Playtime', icon: Clock },
]

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [sortBy, setSortBy] = useState('kills')
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard?sortBy=${sortBy}&limit=10`)
      const data = await res.json()
      setEntries(data.entries || [])
      setLastRefresh(new Date())
    } catch {
      console.error('Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchLeaderboard()
  }, [sortBy])

  useEffect(() => {
    const interval = setInterval(fetchLeaderboard, 10000)
    return () => clearInterval(interval)
  }, [sortBy])

  const getValue = (entry: LeaderboardEntry) => {
    if (sortBy === 'kills') return entry.kills.toLocaleString()
    if (sortBy === 'coins') return entry.coins.toLocaleString()
    if (sortBy === 'playtime') {
      const hours = Math.floor(entry.playtime / 60)
      return `${hours}h`
    }
    return '0'
  }

  const rankColors = [
    'text-yellow-400',
    'text-slate-300',
    'text-amber-600',
  ]

  const rankBg = [
    'bg-yellow-500/20 border-yellow-500/30',
    'bg-slate-400/10 border-slate-400/20',
    'bg-amber-700/20 border-amber-700/30',
  ]

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="font-display font-bold text-white">Leaderboard</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '10s' }} />
          Live
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3">
        {TABS.map(({ key, label, icon: Icon }) => (
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
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="p-4 space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 shimmer rounded-lg" />
          ))
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No data yet. Be the first on the leaderboard!
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={entry._id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200',
                index < 3 ? rankBg[index] : 'border-white/5 hover:border-white/10 hover:bg-white/3'
              )}
            >
              {/* Rank */}
              <div className={cn(
                'w-7 h-7 flex items-center justify-center font-bold text-sm rounded-full',
                index < 3 ? rankColors[index] : 'text-slate-500'
              )}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>

              {/* Avatar */}
              <img
                src={`https://mc-heads.net/avatar/${entry.playerName}/32`}
                alt={entry.playerName}
                className="w-8 h-8 rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://mc-heads.net/avatar/Steve/32`
                }}
              />

              {/* Name */}
              <span className={cn(
                'flex-1 font-semibold text-sm',
                index < 3 ? rankColors[index] : 'text-slate-300'
              )}>
                {entry.playerName}
              </span>

              {/* Value */}
              <span className="font-mono font-bold text-sm text-white">
                {getValue(entry)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="px-6 pb-4 text-center">
        <p className="text-xs text-slate-600">
          Auto-refreshes every 10 seconds · Last: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
