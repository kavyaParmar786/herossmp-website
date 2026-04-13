import Link from 'next/link'
import { Swords, ExternalLink, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-deep-space/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-hero-purple to-hero-violet flex items-center justify-center">
                <Swords className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                HeroS<span className="text-hero-violet"> SMP</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The ultimate Minecraft survival experience. Join thousands of players in epic battles and adventures.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm tracking-wider uppercase">Play</h4>
            <ul className="space-y-2">
              {[
                { href: '/store', label: 'Store' },
                { href: '/store/ranks', label: 'Ranks' },
                { href: '/store/keys', label: 'Keys' },
                { href: '/store/coins', label: 'Coins' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-hero-glow transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm tracking-wider uppercase">Support</h4>
            <ul className="space-y-2">
              {[
                { href: '/faq', label: 'FAQ' },
                { href: '/tickets', label: 'Support Tickets' },
                { href: '/news', label: 'News' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-hero-glow transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Server info */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm tracking-wider uppercase">Connect</h4>
            <div className="space-y-3">
              <div className="glass rounded-lg px-3 py-2">
                <p className="text-xs text-slate-400 mb-1">Server IP</p>
                <p className="font-mono text-sm text-hero-glow">play.herossmp.xyz</p>
              </div>
              <a
                href="https://discord.gg/herossmp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Discord Server
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} HeroS SMP. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-hero-pink" /> for the Minecraft community
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/refund" className="hover:text-slate-300 transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
