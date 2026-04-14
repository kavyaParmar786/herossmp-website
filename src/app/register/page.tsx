'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const DiscordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.127 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
)

const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

function StrengthBar({ password }: { password: string }) {
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3

  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  if (!password) return null
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : 'bg-white/10'}`} />
        ))}
      </div>
      <p className={`text-xs ${strength <= 1 ? 'text-red-400' : strength === 2 ? 'text-orange-400' : strength === 3 ? 'text-yellow-400' : 'text-green-400'}`}>
        {labels[strength]} password
      </p>
    </div>
  )
}

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

  const handleOAuth = (provider: 'google' | 'discord' | 'twitter') => {
    const origin = window.location.origin
    const callbackUrl = `${origin}/api/auth/callback/${provider}`
    const state = Math.random().toString(36).substring(2)
    sessionStorage.setItem('oauth-state', state)
    const urls: Record<string, string> = {
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=openid+email+profile&state=${state}&access_type=offline&prompt=select_account`,
      discord: `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=identify+email&state=${state}`,
      twitter: `https://twitter.com/i/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=tweet.read+users.read+offline.access&state=${state}&code_challenge=challenge&code_challenge_method=plain`,
    }
    window.location.href = urls[provider]
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 70% 40%, rgba(236,72,153,0.15) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(124,58,237,0.2) 0%, transparent 50%)' }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-20" style={{ backgroundSize: '40px 40px' }} />
        <div className="relative z-10 text-center px-12">
          <div style={{ mixBlendMode: 'screen' }}>
            <Image src="/logo.png" alt="HeroS SMP" width={200} height={130} priority style={{ mixBlendMode: 'screen' }} className="mx-auto mb-8 drop-shadow-[0_0_40px_rgba(139,92,246,0.7)]" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-4">Join the Battle.<br />Become a Legend.</h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm mb-10">Create your account and start your journey in the ultimate Minecraft survival experience.</p>
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              'Free to join, instantly playable',
              'Compete on global leaderboards',
              'Access exclusive ranks & perks',
              'Join a 1,200+ player community',
            ].map(perk => (
              <div key={perk} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-hero-glow flex-shrink-0" />
                <span className="text-slate-300 text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative"
        style={{ background: 'linear-gradient(135deg, #050508 0%, #0a0a18 100%)' }}>
        <div className="fixed top-1/4 left-1/4 w-80 h-80 bg-hero-pink/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8" style={{ mixBlendMode: 'screen' }}>
            <Image src="/logo.png" alt="HeroS SMP" width={120} height={80} style={{ mixBlendMode: 'screen' }} />
          </div>

          <div className="glass rounded-3xl p-8" style={{ boxShadow: '0 0 60px rgba(236,72,153,0.08), 0 8px 32px rgba(0,0,0,0.5)' }}>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-slate-400 text-sm mb-8">Join thousands of players on HeroS SMP</p>

            {/* OAuth */}
            <div className="space-y-3 mb-6">
              <button onClick={() => handleOAuth('google')}
                className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border bg-white/5 border-white/15 text-white hover:bg-white/10 hover:border-white/25 font-semibold text-sm transition-all duration-200 hover:scale-[1.01]">
                <GoogleIcon /> Continue with Google
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleOAuth('discord')}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border bg-[#5865F2]/10 border-[#5865F2]/30 text-[#7b8fff] hover:bg-[#5865F2]/20 font-semibold text-sm transition-all duration-200">
                  <DiscordIcon /> Discord
                </button>
                <button onClick={() => handleOAuth('twitter')}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 font-semibold text-sm transition-all duration-200">
                  <TwitterIcon /> Twitter / X
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500 font-medium">or register with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300">Minecraft Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="HeroPlayer123"
                    value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                    className="w-full glass rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 border border-white/10 focus:border-hero-violet/60 focus:outline-none focus:ring-1 focus:ring-hero-violet/30 transition-all bg-transparent" />
                </div>
                {errors.username && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.username}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" placeholder="hero@example.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full glass rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 border border-white/10 focus:border-hero-violet/60 focus:outline-none focus:ring-1 focus:ring-hero-violet/30 transition-all bg-transparent" />
                </div>
                {errors.email && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full glass rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-600 border border-white/10 focus:border-hero-violet/60 focus:outline-none focus:ring-1 focus:ring-hero-violet/30 transition-all bg-transparent" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <StrengthBar password={form.password} />
                {errors.password && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
              </div>

              {/* Confirm */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                    value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                    className="w-full glass rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 border border-white/10 focus:border-hero-violet/60 focus:outline-none focus:ring-1 focus:ring-hero-violet/30 transition-all bg-transparent" />
                  {form.confirm && form.password === form.confirm && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                  )}
                </div>
                {errors.confirm && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirm}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white btn-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account…
                  </span>
                ) : '⚔️ Create Account'}
              </button>

              <p className="text-center text-xs text-slate-600 mt-2">
                By registering you agree to our Terms of Service
              </p>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-hero-glow hover:text-hero-violet font-semibold transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
