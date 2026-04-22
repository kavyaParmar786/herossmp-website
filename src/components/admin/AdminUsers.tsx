'use client'
import { useEffect, useState } from 'react'
import { User } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { Button, Card, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const ROLES = ['USER', 'STAFF', 'ADMIN', 'OWNER']

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])

  const load = async () => {
    const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setUsers(data.users || [])
  }

  useEffect(() => { if (token) load() }, [token])

  const changeRole = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, role }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Role updated')
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  const roleVariant = (role: string) => {
    if (role === 'OWNER') return 'warning'
    if (role === 'ADMIN') return 'danger'
    if (role === 'STAFF') return 'info'
    return 'default'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-hero-violet" />
          User Management
        </h2>
        <span className="text-sm text-slate-400">{users.length} users</span>
      </div>

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u._id} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hero-purple to-hero-pink flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {u.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white">{u.username}</p>
                {u._id === currentUser?._id && (
                  <span className="text-xs text-slate-500">(you)</span>
                )}
              </div>
              <p className="text-xs text-slate-400">{u.email} · Joined {formatDate(u.createdAt)}</p>
            </div>
            <Badge variant={roleVariant(u.role)}>{u.role}</Badge>
            {u._id !== currentUser?._id && (
              <select
                value={u.role}
                onChange={(e) => changeRole(u._id, e.target.value)}
                className="glass rounded-lg px-3 py-1.5 text-sm text-white bg-transparent border border-white/10 focus:border-hero-violet/60 focus:outline-none cursor-pointer"
                style={{ background: 'rgba(5,5,8,0.9)' }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} style={{ background: '#0a0a12' }}>{r}</option>
                ))}
              </select>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
