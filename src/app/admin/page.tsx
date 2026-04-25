'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui'
import AdminProducts from '@/components/admin/AdminProducts'
import AdminNews from '@/components/admin/AdminNews'
import AdminTickets from '@/components/admin/AdminTickets'
import AdminUsers from '@/components/admin/AdminUsers'
import AdminSettings from '@/components/admin/AdminSettings'
import AdminFAQ from '@/components/admin/AdminFAQ'
import AdminLeaderboard from '@/components/admin/AdminLeaderboard'
import AdminApplications from '@/components/admin/AdminApplications'
import AdminBilling from '@/components/admin/AdminBilling'
import { Package, Newspaper, Ticket, Users, Settings, HelpCircle, LayoutDashboard, AlertTriangle, Trophy, ClipboardList, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const TABS = [
  { key: 'products', label: 'Products', icon: Package },
  { key: 'news', label: 'News', icon: Newspaper },
  { key: 'tickets', label: 'Tickets', icon: Ticket },
  { key: 'applications', label: 'Applications', icon: ClipboardList },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { key: 'faq', label: 'FAQ', icon: HelpCircle },
  { key: 'billing', label: 'Billing', icon: Receipt },
  { key: 'settings', label: 'Settings', icon: Settings },
]

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth()
  const [tab, setTab] = useState('products')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-10 h-10" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-10 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-white mb-2">Not Logged In</h1>
          <p className="text-slate-400 mb-6">You need to sign in to access the admin panel.</p>
          <Link href="/login?redirect=/admin" className="inline-flex items-center gap-2 px-6 py-3 btn-primary text-white font-bold rounded-xl">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-10 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-2">
            You are logged in as <span className="text-white font-bold">{user.username}</span>
          </p>
          <p className="text-slate-400 mb-2">
            Your role is <span className="text-yellow-400 font-bold">{user.role}</span>
          </p>
          <p className="text-slate-500 text-sm mb-6">
            Admin panel requires ADMIN or OWNER role.
            Ask the server owner to upgrade your role.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 glass text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const ActiveComponent = {
    products: AdminProducts,
    news: AdminNews,
    tickets: AdminTickets,
    applications: AdminApplications,
    users: AdminUsers,
    leaderboard: AdminLeaderboard,
    faq: AdminFAQ,
    billing: AdminBilling,
    settings: AdminSettings,
  }[tab] || AdminProducts

  return (
    <div className="min-h-screen pt-20 flex">
      {/* Sidebar */}
      <aside className="relative w-56 flex-shrink-0 border-r border-white/5 pt-4 px-3">
        <div className="flex items-center gap-2 px-3 py-3 mb-4 border-b border-white/5">
          <LayoutDashboard className="w-5 h-5 text-hero-violet" />
          <div>
            <span className="font-display font-bold text-white text-sm block">Admin Panel</span>
            <span className="text-xs text-hero-glow">{user.role}</span>
          </div>
        </div>
        <div className="space-y-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                tab === key
                  ? 'bg-hero-purple/30 text-hero-glow border border-hero-violet/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
        <div className="absolute bottom-4 left-3 right-3">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5">
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="relative flex-1 p-6 overflow-y-auto min-h-screen">
        <ActiveComponent />
      </main>
    </div>
  )
}
