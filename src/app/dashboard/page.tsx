'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Order, Ticket } from '@/types'
import { Card, Badge, Spinner } from '@/components/ui'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { User, ShoppingBag, Ticket as TicketIcon, Shield, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/dashboard')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user || !token) return
    const load = async () => {
      try {
        const [ticketsRes] = await Promise.all([
          fetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const ticketsData = await ticketsRes.json()
        setTickets(ticketsData.tickets || [])
      } catch {
        console.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, token])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-10 h-10" />
      </div>
    )
  }

  const roleColor = {
    USER: 'default',
    STAFF: 'info',
    ADMIN: 'danger',
    OWNER: 'warning',
  }[user.role] as 'default' | 'info' | 'danger' | 'warning'

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <div className="glass rounded-3xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-hero-purple to-hero-pink flex items-center justify-center text-3xl font-bold text-white shadow-glow-purple flex-shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-3xl font-bold text-white">{user.username}</h1>
                <Badge variant={roleColor}>{user.role}</Badge>
              </div>
              <p className="text-slate-400 mt-1">{user.email}</p>
            </div>
            {user.role === 'ADMIN' || user.role === 'OWNER' ? (
              <Link href="/admin" className="flex items-center gap-2 px-4 py-2 btn-primary text-white rounded-xl text-sm font-bold">
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            ) : null}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: ShoppingBag, label: 'Total Orders', value: orders.length },
            { icon: TicketIcon, label: 'Support Tickets', value: tickets.length },
            { icon: User, label: 'Account Role', value: user.role },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="text-center">
              <Icon className="w-6 h-6 text-hero-violet mx-auto mb-2" />
              <div className="font-display font-bold text-2xl text-white">{value}</div>
              <div className="text-xs text-slate-400 mt-1">{label}</div>
            </Card>
          ))}
        </div>

        {/* Tickets */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <TicketIcon className="w-5 h-5 text-hero-violet" />
              My Tickets
            </h2>
            <Link
              href="/tickets"
              className="flex items-center gap-1.5 text-sm text-hero-glow hover:text-hero-violet transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <TicketIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="mb-3">No tickets yet</p>
              <Link
                href="/tickets"
                className="inline-flex items-center gap-2 px-4 py-2 btn-primary text-white rounded-lg text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Create Ticket
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.slice(0, 5).map((ticket) => (
                <Link key={ticket._id} href={`/tickets/${ticket._id}`}>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-hero-violet/30 hover:bg-white/3 transition-all duration-200">
                    <div className={cn(
                      'w-2.5 h-2.5 rounded-full flex-shrink-0',
                      ticket.status === 'OPEN' ? 'bg-green-400 status-online' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-yellow-400' :
                      'bg-slate-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{ticket.subject}</p>
                      <p className="text-xs text-slate-400">{formatRelativeTime(ticket.updatedAt)}</p>
                    </div>
                    <Badge variant={
                      ticket.status === 'OPEN' ? 'success' :
                      ticket.status === 'IN_PROGRESS' ? 'warning' :
                      'default'
                    }>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
