'use client'
import { useEffect, useState } from 'react'
import { Ticket } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { Button, Badge, Card } from '@/components/ui'
import { formatRelativeTime } from '@/lib/utils'
import { ExternalLink, XCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function AdminTickets() {
  const { token } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filter, setFilter] = useState<string>('ALL')

  const load = async () => {
    const res = await fetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setTickets(data.tickets || [])
  }

  useEffect(() => { if (token) load() }, [token])

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      toast.success('Status updated')
      load()
    } catch { toast.error('Failed to update') }
  }

  const filtered = filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-white">All Tickets</h2>
        <div className="flex gap-2">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                filter === s ? 'bg-hero-purple/30 text-hero-glow border border-hero-violet/40' : 'glass text-slate-400 hover:text-white')}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((ticket) => (
          <Card key={ticket._id} className="flex items-center gap-4">
            <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0',
              ticket.status === 'OPEN' ? 'bg-green-400' :
              ticket.status === 'IN_PROGRESS' ? 'bg-yellow-400' : 'bg-slate-500'
            )} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{ticket.subject}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>@{ticket.username}</span>
                <span>·</span>
                <span>{ticket.category}</span>
                <span>·</span>
                <span>{formatRelativeTime(ticket.updatedAt)}</span>
              </div>
            </div>
            <Badge variant={ticket.status === 'OPEN' ? 'success' : ticket.status === 'IN_PROGRESS' ? 'warning' : 'default'}>
              {ticket.status.replace('_', ' ')}
            </Badge>
            <div className="flex gap-2">
              <Link href={`/tickets/${ticket._id}`}>
                <Button variant="secondary" size="sm"><ExternalLink className="w-3.5 h-3.5" /></Button>
              </Link>
              {ticket.status !== 'CLOSED' ? (
                <Button variant="danger" size="sm" onClick={() => updateStatus(ticket._id, 'CLOSED')}>
                  <XCircle className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => updateStatus(ticket._id, 'OPEN')}>
                  <CheckCircle className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">No tickets found</div>
        )}
      </div>
    </div>
  )
}
