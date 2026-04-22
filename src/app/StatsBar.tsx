'use client'
import { useState, useEffect } from 'react'
import { Users, Swords, Crown, Zap } from 'lucide-react'

interface Stats { players: number; dailyBattles: number; ranks: number; uptime: string }

export default function StatsBar() {
  const [stats, setStats] = useState<Stats>({ players: 0, dailyBattles: 0, ranks: 8, uptime: '99.9%' })

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  const statCards = [
    { icon: Users,  label: 'Registered Players', value: stats.players > 0 ? `${stats.players.toLocaleString()}+` : '1,200+', color: 'text-hero-glow' },
    { icon: Swords, label: 'Total PvP Kills',     value: stats.dailyBattles > 0 ? `${stats.dailyBattles.toLocaleString()}+` : '5,000+', color: 'text-red-400' },
    { icon: Crown,  label: 'Ranks Available',      value: stats.ranks.toString(), color: 'text-yellow-400' },
    { icon: Zap,    label: 'Uptime',               value: stats.uptime, color: 'text-green-400' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto stagger">
      {statCards.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="glass-gold rounded-2xl p-5 text-center group hover:scale-105 transition-transform duration-300 animate-fade-in opacity-0">
          <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className={`font-display font-bold text-2xl mb-1 ${color}`}
            style={{ textShadow: '0 0 20px currentColor' }}>
            {value}
          </div>
          <div className="text-xs text-slate-500 font-medium tracking-wide uppercase">{label}</div>
        </div>
      ))}
    </div>
  )
}
