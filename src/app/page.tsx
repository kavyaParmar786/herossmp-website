'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ArrowRight, Shield, Users, Swords, Zap, Crown, ClipboardList } from 'lucide-react'
import ServerStatusCard from '@/components/home/ServerStatus'
import Leaderboard from '@/components/home/Leaderboard'
import HomepageClient from './HomepageClient'

interface Stats { players: number; dailyBattles: number; ranks: number; uptime: string }

export default function HomePage() {
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
    <div className="relative min-h-screen">

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.5) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)' }} />
      </div>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">

          {/* Live badge */}
          <div className="hero-reveal hero-reveal-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8"
            style={{
              background: 'rgba(10,8,20,0.8)',
              border: '1px solid rgba(212,175,55,0.3)',
              boxShadow: '0 0 20px rgba(212,175,55,0.1), inset 0 1px 0 rgba(255,215,0,0.08)',
            }}>
            <span className="w-2 h-2 bg-green-400 rounded-full status-online" />
            <span className="text-gold-mid">Server is Live</span>
            <span className="text-slate-500">—</span>
            <span className="text-slate-300">Join Now!</span>
          </div>

          {/* Logo */}
          <div className="hero-reveal hero-reveal-2 flex justify-center mb-8 animate-float">
            <Image
              src="/logo.png"
              alt="HeroS SMP"
              width={320}
              height={210}
              priority
              className="object-contain"
              style={{ filter: 'drop-shadow(0 0 40px rgba(212,175,55,0.5)) drop-shadow(0 0 80px rgba(124,58,237,0.3))' }}
            />
          </div>

          {/* Tagline */}
          <p className="hero-reveal hero-reveal-3 text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-4 font-light leading-relaxed">
            The Ultimate Minecraft Survival Experience.
          </p>
          <p className="hero-reveal hero-reveal-3 text-base text-slate-500 max-w-xl mx-auto mb-12">
            Battle, build, and conquer with thousands of players. Rise to the top.
          </p>

          {/* CTA Buttons */}
          <div className="hero-reveal hero-reveal-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/store"
              className="btn-gold flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-200"
              style={{ fontFamily: 'var(--font-display)' }}>
              <Crown className="w-5 h-5" />
              Visit Store
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="minecraft://play.herossmp.xyz"
              className="glass glass-hover flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg transition-all duration-300"
              style={{ fontFamily: 'var(--font-display)' }}>
              <Swords className="w-5 h-5 text-yellow-400" />
              Join Server
            </a>
            <Link href="/apply"
              className="glass glass-hover flex items-center gap-2 px-6 py-4 rounded-xl text-white font-bold transition-all duration-300 border border-hero-violet/30"
              style={{ fontFamily: 'var(--font-display)' }}>
              <ClipboardList className="w-5 h-5 text-hero-glow" />
              Apply for Staff
            </Link>
          </div>

          {/* Divider */}
          <div className="divider-gold max-w-md mx-auto mb-16" />

          {/* Stats */}
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
        </div>
      </section>

      {/* Server IP banner */}
      <section className="relative px-4 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="glass-gold rounded-2xl px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-400 text-sm">Server IP:</span>
              <code className="text-yellow-400 font-mono font-bold text-sm tracking-wider">play.herossmp.xyz</code>
            </div>
            <a href="minecraft://play.herossmp.xyz"
              className="btn-gold px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200">
              Connect
            </a>
          </div>
        </div>
      </section>

      {/* Server Status + Leaderboard */}
      <section className="relative px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="divider-gold flex-1" />
            <h2 className="font-display text-xl font-bold text-yellow-400 tracking-widest uppercase">Live Arena</h2>
            <div className="divider-gold flex-1" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <ServerStatusCard />
            <Leaderboard />
          </div>
        </div>
      </section>

      {/* News + Featured */}
      <HomepageClient />
    </div>
  )
}
