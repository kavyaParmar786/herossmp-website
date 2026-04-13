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
import { Package, Newspaper, Ticket, Users, Settings, HelpCircle, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'products', label: 'Products', icon: Package },
  { key: 'news', label: 'News', icon: Newspaper },
  { key: 'tickets', label: 'Tickets', icon: Ticket },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'faq', label: 'FAQ', icon: HelpCircle },
  { key: 'settings', label: 'Settings', icon: Settings },
]

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState('products')

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/')
    }
  }, [user, isAdmin, authLoading, router])

  if (authLoading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner className="w-10 h-10" /></div>
  }

  const ActiveComponent = {
    products: AdminProducts,
    news: AdminNews,
    tickets: AdminTickets,
    users: AdminUsers,
    faq: AdminFAQ,
    settings: AdminSettings,
  }[tab] || AdminProducts

  return (
    <div className="min-h-screen pt-20 flex">
      <div className="fixed inset-0 bg-void bg-grid opacity-50 pointer-events-none" />

      {/* Sidebar */}
      <aside className="relative w-56 flex-shrink-0 border-r border-white/5 pt-4 px-3">
        <div className="flex items-center gap-2 px-3 py-3 mb-4">
          <LayoutDashboard className="w-5 h-5 text-hero-violet" />
          <span className="font-display font-bold text-white">Admin Panel</span>
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
      </aside>

      {/* Main */}
      <main className="relative flex-1 p-6 overflow-y-auto">
        <ActiveComponent />
      </main>
    </div>
  )
}
