'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import {
  ShoppingCart, Menu, X, User, LogOut, LayoutDashboard,
  Shield, Swords, ChevronDown, Ticket, Newspaper
} from 'lucide-react'
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
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass border-b border-hero-violet/20 py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-hero-purple to-hero-violet flex items-center justify-center shadow-glow-purple group-hover:shadow-glow-purple transition-all duration-300">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white group-hover:text-hero-glow transition-colors">
              HeroS<span className="text-hero-violet"> SMP</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200',
                  pathname === link.href
                    ? 'text-hero-glow bg-hero-purple/20 border border-hero-violet/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg glass glass-hover transition-all duration-200"
            >
              <ShoppingCart className="w-5 h-5 text-slate-300" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-hero-violet text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse-glow">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg glass glass-hover transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-hero-purple to-hero-pink flex items-center justify-center text-xs font-bold text-white">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-slate-200">{user.username}</span>
                  <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 glass rounded-xl border border-hero-violet/30 shadow-glow-purple overflow-hidden z-50 animate-slide-up">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="font-semibold text-white truncate">{user.username}</p>
                      <span className={cn(
                        'inline-block text-xs px-2 py-0.5 rounded-full mt-1',
                        user.role === 'OWNER' ? 'bg-yellow-500/20 text-yellow-300' :
                        user.role === 'ADMIN' ? 'bg-red-500/20 text-red-300' :
                        user.role === 'STAFF' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-slate-500/20 text-slate-300'
                      )}>{user.role}</span>
                    </div>
                    <div className="py-1">
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link href="/tickets" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                        <Ticket className="w-4 h-4" /> My Tickets
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-hero-glow hover:bg-hero-purple/10 transition-colors">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
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
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-bold text-white btn-primary rounded-lg">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg glass"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/5 pt-4 space-y-1 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200',
                  pathname === link.href
                    ? 'text-hero-glow bg-hero-purple/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="pt-2 flex gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold text-slate-300 glass rounded-lg">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-bold text-white btn-primary rounded-lg">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
