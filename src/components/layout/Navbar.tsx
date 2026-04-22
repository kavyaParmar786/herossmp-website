'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { ShoppingCart, Menu, X, LogOut, LayoutDashboard, Shield, ChevronDown, Ticket, Crown, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/store', label: 'Store' },
  { href: '/news', label: 'News' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/apply', label: 'Apply' },
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
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close menus on route change
  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false) }, [pathname])

  return (
    <nav
      className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-500', scrolled ? 'py-2' : 'bg-transparent py-4')}
      style={scrolled ? {
        background: 'rgba(5,5,10,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(212,175,55,0.12)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4), 0 1px 0 rgba(212,175,55,0.06)',
      } : {}}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <Image
              src="/logo.png"
              alt="HeroSMP"
              width={100}
              height={36}
              className="object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.6)]"
              style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.3))' }}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href))
              return (
                <Link key={href} href={href}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                    active
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}>
                  {active && (
                    <span className="absolute inset-0 rounded-lg"
                      style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(139,92,246,0.25)' }} />
                  )}
                  <span className="relative">{label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link href="/cart" className="relative p-2.5 glass rounded-xl hover:bg-white/10 transition-all duration-200 group">
              <ShoppingCart className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-hero-purple text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-2 glass rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-hero-purple to-hero-violet flex items-center justify-center text-xs font-bold text-white">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-white hidden sm:block max-w-[80px] truncate">{user.username}</span>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform duration-200', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden animate-slide-up"
                    style={{ background: 'rgba(8,6,20,0.97)', border: '1px solid rgba(212,175,55,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="font-bold text-white text-sm truncate">{user.username}</p>
                      <span className="text-xs text-hero-glow">{user.role}</span>
                    </div>
                    <div className="py-1">
                      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link href="/tickets" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <Ticket className="w-4 h-4" /> My Tickets
                      </Link>
                      <Link href="/apply" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <ClipboardList className="w-4 h-4" /> Apply
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-hero-glow hover:text-white hover:bg-hero-purple/10 transition-colors">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <button onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-2.5 glass rounded-xl hover:bg-white/10 transition-all duration-200">
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-white/5 pt-3 animate-slide-up space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className={cn('block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  pathname === href ? 'bg-hero-purple/20 text-hero-glow' : 'text-slate-400 hover:text-white hover:bg-white/5')}>
                {label}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1 text-center px-4 py-2 glass rounded-xl text-sm font-semibold text-slate-300">Sign In</Link>
                <Link href="/register" className="flex-1 text-center px-4 py-2 btn-primary rounded-xl text-sm font-bold text-white">Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
