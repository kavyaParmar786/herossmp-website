'use client'
import { useEffect, useState, useRef, use } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Ticket } from '@/types'
import { Button, Badge, Spinner } from '@/components/ui'
import { formatRelativeTime } from '@/lib/utils'
import { Send, ArrowLeft, XCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function TicketChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, token, isStaff, loading: authLoading } = useAuth()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  const loadTicket = async () => {
    try {
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/tickets/${id}`, { headers, credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTicket(data.ticket)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load ticket')
      router.push('/tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user) loadTicket() }, [user, token, id])

  // Polling every 5s
  useEffect(() => {
    if (!user) return
    const interval = setInterval(loadTicket, 5000)
    return () => clearInterval(interval)
  }, [user, token, id])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages.length])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ content: message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTicket(data.ticket)
      setMessage('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTicket(data.ticket)
      toast.success(`Ticket ${status.toLowerCase()}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update ticket')
    }
  }

  if (authLoading || loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner className="w-10 h-10" /></div>
  }

  if (!ticket) return null

  return (
    <div className="min-h-screen pt-20 pb-0 flex flex-col">
      <div className="fixed inset-0 bg-void bg-grid opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="relative glass border-b border-white/5 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/tickets" className="p-2 rounded-lg glass hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white truncate">{ticket.subject}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400">#{ticket._id.slice(-6).toUpperCase()}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">{ticket.category}</span>
            </div>
          </div>
          <Badge variant={
            ticket.status === 'OPEN' ? 'success' :
            ticket.status === 'IN_PROGRESS' ? 'warning' : 'default'
          }>
            {ticket.status.replace('_', ' ')}
          </Badge>
          {isStaff && (
            <div className="flex gap-2">
              {ticket.status !== 'CLOSED' && (
                <Button size="sm" variant="danger" onClick={() => handleStatusChange('CLOSED')}>
                  <XCircle className="w-3.5 h-3.5" />
                  Close
                </Button>
              )}
              {ticket.status === 'CLOSED' && (
                <Button size="sm" variant="outline" onClick={() => handleStatusChange('OPEN')}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Reopen
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {ticket.messages.map((msg) => {
            const isOwn = msg.userId === user._id || msg.username === user.username
            const isStaffMsg = ['STAFF', 'ADMIN', 'OWNER'].includes(msg.role)

            return (
              <div key={msg._id} className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
                {/* Avatar */}
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0',
                  isStaffMsg
                    ? 'bg-gradient-to-br from-hero-purple to-hero-pink text-white'
                    : 'bg-gradient-to-br from-slate-600 to-slate-700 text-white'
                )}>
                  {msg.username[0].toUpperCase()}
                </div>

                <div className={cn('max-w-[75%] space-y-1', isOwn && 'items-end flex flex-col')}>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className={cn('font-semibold', isStaffMsg ? 'text-hero-glow' : 'text-slate-300')}>
                      {msg.username}
                    </span>
                    {isStaffMsg && (
                      <span className="px-1.5 py-0.5 bg-hero-purple/30 text-hero-glow text-xs rounded-full border border-hero-violet/30">
                        {msg.role}
                      </span>
                    )}
                    <span>{formatRelativeTime(msg.createdAt)}</span>
                  </div>
                  <div className={cn(
                    'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    isOwn
                      ? 'bg-hero-purple/30 border border-hero-violet/30 text-white rounded-tr-sm'
                      : 'glass text-slate-200 rounded-tl-sm',
                    isStaffMsg && !isOwn && 'border-hero-violet/20'
                  )}>
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative glass border-t border-white/5 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {ticket.status === 'CLOSED' ? (
            <p className="text-center text-sm text-slate-500 py-2">
              This ticket is closed. {isStaff && 'Reopen it to reply.'}
            </p>
          ) : (
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 glass rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-hero-violet/60 focus:outline-none bg-transparent transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (message.trim()) handleSend(e as unknown as React.FormEvent)
                  }
                }}
              />
              <Button type="submit" loading={sending} disabled={!message.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
