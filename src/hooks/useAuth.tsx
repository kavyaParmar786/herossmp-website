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

  // On mount: read from localStorage only — no network call that can fail
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth')
      if (stored) {
        const { user: u, token: t } = JSON.parse(stored)
        if (u && t) {
          setUser(u)
          setToken(t)
        }
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
      if (!res.ok) {
        toast.error(data.error || 'Login failed')
        return false
      }
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
      if (!res.ok) {
        toast.error(data.error || 'Registration failed')
        return false
      }
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('auth', JSON.stringify({ user: data.user, token: data.token }))
      toast.success('Account created! Welcome to HeroS SMP!')
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
