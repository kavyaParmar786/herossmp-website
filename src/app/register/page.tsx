'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button, Input } from '@/components/ui'
import { Mail, Lock, User, Swords, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.username) e.username = 'Username is required'
    else if (form.username.length < 3) e.username = 'At least 3 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Only letters, numbers, underscores'
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'At least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const ok = await register(form.username, form.email, form.password)
    if (ok) router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 py-8">
      <div className="fixed top-1/4 right-1/4 w-72 h-72 bg-hero-pink/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-glow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-hero-pink to-hero-purple flex items-center justify-center mx-auto mb-4 shadow-glow-pink">
              <Swords className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Join the Battle</h1>
            <p className="text-slate-400 text-sm">Create your HeroS SMP account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Minecraft Username"
              type="text"
              placeholder="HeroPlayer123"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              error={errors.username}
              icon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="hero@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full glass rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-hero-violet/60 focus:outline-none transition-all bg-transparent"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-300">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="w-full glass rounded-lg pl-10 py-2.5 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-hero-violet/60 focus:outline-none transition-all bg-transparent"
                />
              </div>
              {errors.confirm && <p className="text-xs text-red-400">{errors.confirm}</p>}
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-hero-glow hover:text-hero-violet transition-colors font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
