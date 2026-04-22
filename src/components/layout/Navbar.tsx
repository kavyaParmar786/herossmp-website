'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { ShoppingCart, Menu, X, LogOut, LayoutDashboard, Shield, ChevronDown, Ticket, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/store', label: 'Store' },
  { href: '/news', label: 'News' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/faq', label: 'FAQ' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      scrolled
        ? 'py-2'
        : 'bg-transparent py-4'
    )}
    style={scrolled ? {
      background: 'rgba(5,5,10,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(212,175,55,0.12)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.4), 0 1px 0 rgba(212,175,55,0.06)',
    } : {}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <Image
              src="/logo.png"
              alt="HeroS SMP"
              width={48}
              height={48}
              className="object-contain transition-all duration-300 group-hover:scale-110"
              style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.5))' }}
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 font-body',
                  pathname === link.href
                    ? 'text-gold-mid border'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
                style={pathname === link.href ? {
                  background: 'rgba(212,175,55,0.08)',
                  borderColor: 'rgba(212,175,55,0.25)',
                  textShadow: '0 0 15px rgba(212,175,55,0.4)',
                } : {}}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link href="/cart" className="relative p-2.5 rounded-xl glass transition-all duration-200 hover:border-gold-dim/30 gold-ring">
              <ShoppingCart className="w-5 h-5 text-slate-300" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-xs font-bold text-void rounded-full"
                  style={{ background: 'linear-gradient(135deg, #FFD700, #D4AF37)' }}>
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass transition-all duration-200 gold-ring">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-7 h-7 rounded-lg border border-gold-dim/30" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-void"
                      style={{ background: 'linear-gradient(135deg, #D4AF37, #FFD700)' }}>
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-semibold text-slate-200">{user.username}</span>
                  <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden animate-slide-up z-50"
                    style={{
                      background: 'rgba(8,6,16,0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(212,175,55,0.2)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.08)',
                    }}>
                    <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-xl border border-gold-dim/30" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-void"
                            style={{ background: 'linear-gradient(135deg, #D4AF37, #FFD700)' }}>
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white text-sm">{user.username}</p>
                          <span className={cn(
                            'inline-block text-xs px-2 py-0.5 rounded-full mt-0.5 font-semibold',
                            user.role === 'OWNER' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                            user.role === 'ADMIN' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            user.role === 'STAFF' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            'border text-gold-dim'
                          )}
                          style={user.role === 'USER' ? { borderColor: 'rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.06)' } : {}}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      {[
                        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                        { href: '/tickets', icon: Ticket, label: 'My Tickets' },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                          <Icon className="w-4 h-4" /> {label}
                        </Link>
                      ))}
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: '#D4AF37' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.08)') }
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent') }>
                          <Crown className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <div style={{ borderTop: '1px solid rgba(212,175,55,0.08)', margin: '4px 0' }} />
                      <button onClick={() => { logout(); setUserMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/register"
                  className="btn-gold px-5 py-2 text-sm font-bold rounded-xl transition-all duration-200">
                  ⚔️ Join Free
                </Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 rounded-xl glass">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-1 animate-slide-up" style={{ borderTop: '1px solid rgba(212,175,55,0.1)', paddingTop: '16px' }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                  pathname === link.href ? 'text-gold-mid' : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
                style={pathname === link.href ? { background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' } : {}}>
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="pt-2 flex gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-semibold text-slate-300 glass rounded-xl">Sign In</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-bold text-void btn-gold rounded-xl">Join Free</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
