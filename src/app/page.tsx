import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight, Swords, Shield, Users, Zap } from 'lucide-react'
import ServerStatusCard from '@/components/home/ServerStatus'
import Leaderboard from '@/components/home/Leaderboard'
import HomepageClient from './HomepageClient'

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Background effects */}

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-hero-glow border border-hero-violet/30 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-green-400 rounded-full status-online" />
            Server is Live — Join Now!
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-black text-white mb-6 leading-none animate-slide-up">
            Hero<span className="text-transparent bg-clip-text bg-gradient-to-r from-hero-violet to-hero-cyan">S</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-hero-purple via-hero-violet to-hero-pink">
              SMP
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in font-light">
            The Ultimate Minecraft Survival Experience. Battle, build, and conquer with thousands of players.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
            <Link
              href="/store"
              className="flex items-center gap-2 px-8 py-4 btn-primary text-white font-bold text-lg rounded-xl"
            >
              <Shield className="w-5 h-5" />
              Visit Store
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="minecraft://play.herossmp.xyz"
              className="flex items-center gap-2 px-8 py-4 glass rounded-xl text-white font-bold text-lg hover:bg-white/10 transition-all duration-200"
            >
              <Swords className="w-5 h-5 text-hero-violet" />
              Join Server
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Users, label: 'Active Players', value: '1,200+' },
              { icon: Swords, label: 'Daily Battles', value: '5,000+' },
              { icon: Shield, label: 'Ranks Available', value: '8' },
              { icon: Zap, label: 'Uptime', value: '99.9%' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <Icon className="w-5 h-5 text-hero-violet mx-auto mb-2" />
                <div className="font-display font-bold text-xl text-white">{value}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Server Status + Leaderboard */}
      <section className="relative px-4 py-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <ServerStatusCard />
          <Leaderboard />
        </div>
      </section>

      {/* News + Featured items (client) */}
      <HomepageClient />
    </div>
  )
}
