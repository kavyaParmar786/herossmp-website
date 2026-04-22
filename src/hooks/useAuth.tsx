'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isAdmin: boolean
  isStaff: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      // Check for oauth-user cookie first (set by OAuth callback)
      const cookies = document.cookie.split(';').reduce((acc, c) => {
        const idx = c.indexOf('=')
        if (idx === -1) return acc
        const k = c.substring(0, idx).trim()
        const v = c.substring(idx + 1).trim()
        acc[k] = v
        return acc
      }, {} as Record<string, string>)

      if (cookies['oauth-user']) {
        try {
          const oauthUser = JSON.parse(decodeURIComponent(cookies['oauth-user']))
          setUser(oauthUser)
          // Clear the cookie
          document.cookie = 'oauth-user=; max-age=0; path=/'
          // The httpOnly auth-token cookie is already set — no token in localStorage
          // We can't read the httpOnly token but API calls will use the cookie automatically
          localStorage.setItem('auth', JSON.stringify({ user: oauthUser, token: null }))
          setLoading(false)
          return
        } catch {}
      }

      // Normal: read from localStorage
      const stored = localStorage.getItem('auth')
      if (stored) {
        const { user: u, token: t } = JSON.parse(stored)
        if (u) { setUser(u); setToken(t) }
      }
    } catch {
      localStorage.removeItem('auth')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Login failed'); return false }
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('auth', JSON.stringify({ user: data.user, token: data.token }))
      toast.success(`Welcome back, ${data.user.username}!`)
      return true
    } catch {
      toast.error('Network error — please try again')
      return false
    }
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Registration failed'); return false }
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('auth', JSON.stringify({ user: data.user, token: data.token }))
      toast.success('Account created! Welcome to HeroS SMP! 🎮')
      return true
    } catch {
      toast.error('Network error — please try again')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth')
    fetch('/api/auth/login', { method: 'DELETE' }).catch(() => {})
    toast.success('Logged out successfully')
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER'
  const isStaff = isAdmin || user?.role === 'STAFF'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
