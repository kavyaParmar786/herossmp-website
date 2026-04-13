'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button, Input } from '@/components/ui'
import { Mail, Lock, Swords, Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.email) e.email = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const ok = await login(form.email, form.password)
    if (ok) router.push(redirect)
    setLoading(false)
  }

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-hero-purple/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-glow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-hero-purple to-hero-violet flex items-center justify-center mx-auto mb-4 shadow-glow-purple">
              <Swords className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Sign in to your HeroS SMP account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full glass rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-hero-violet/60 focus:outline-none transition-all duration-200 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-hero-glow hover:text-hero-violet transition-colors font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-void flex items-center justify-center"><div className="text-slate-400">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  )
}
