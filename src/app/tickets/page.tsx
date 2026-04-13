'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Ticket } from '@/types'
import { Button, Card, Badge, Select, Textarea, Input, Spinner } from '@/components/ui'
import { formatRelativeTime } from '@/lib/utils'
import { Plus, X, Ticket as TicketIcon, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function TicketsPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject: '', category: 'GENERAL', message: '' })

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/tickets')
  }, [user, authLoading, router])

  const loadTickets = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch { console.error('Failed to load tickets') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user) loadTickets() }, [user, token])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Subject and message are required')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Ticket created!')
      setShowForm(false)
      setForm({ subject: '', category: 'GENERAL', message: '' })
      loadTickets()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create ticket')
    } finally {
      setCreating(false)
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner className="w-10 h-10" /></div>
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 bg-void bg-grid opacity-50 pointer-events-none" />
      <div className="max-w-3xl mx-auto relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-white">Support Tickets</h1>
            <p className="text-slate-400 mt-1">Get help from our team</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            New Ticket
          </Button>
        </div>

        {/* Create ticket form */}
        {showForm && (
          <Card className="mb-8 border-hero-violet/30">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-white">Create New Ticket</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Subject"
                placeholder="Brief description of your issue"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              <Select
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                options={[
                  { value: 'GENERAL', label: 'General' },
                  { value: 'BUG', label: 'Bug Report' },
                  { value: 'PAYMENT', label: 'Payment Issue' },
                  { value: 'REPORT', label: 'Player Report' },
                ]}
              />
              <Textarea
                label="Message"
                placeholder="Describe your issue in detail..."
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" loading={creating}>Submit Ticket</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tickets list */}
        {loading ? (
          <div className="flex justify-center py-12"><Spinner className="w-8 h-8" /></div>
        ) : tickets.length === 0 ? (
          <Card className="text-center py-12">
            <TicketIcon className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="font-display text-xl text-white mb-2">No Tickets Yet</h3>
            <p className="text-slate-400 mb-6">Need help? Create a support ticket and our team will assist you.</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" />
              Create First Ticket
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Link key={ticket._id} href={`/tickets/${ticket._id}`}>
                <div className="glass glass-hover rounded-xl p-5 flex items-center gap-4 transition-all duration-200">
                  <div className={cn(
                    'w-3 h-3 rounded-full flex-shrink-0',
                    ticket.status === 'OPEN' ? 'bg-green-400 status-online' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-yellow-400' :
                    'bg-slate-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{ticket.subject}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{ticket.category}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs text-slate-400">{formatRelativeTime(ticket.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <Badge variant={
                      ticket.status === 'OPEN' ? 'success' :
                      ticket.status === 'IN_PROGRESS' ? 'warning' : 'default'
                    }>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
