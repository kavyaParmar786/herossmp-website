import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function calculateGST(amount: number, rate = 18): { gst: number; total: number } {
  const gst = (amount * rate) / 100
  return { gst: Math.round(gst * 100) / 100, total: Math.round((amount + gst) * 100) / 100 }
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

export const CATEGORY_META = {
  RANKS: { label: 'Ranks', icon: '👑', color: 'from-yellow-500 to-amber-600', glow: 'glow-gold' },
  KEYS: { label: 'Keys', icon: '🗝️', color: 'from-purple-500 to-violet-600', glow: 'glow-purple' },
  MONEY: { label: 'Money', icon: '💰', color: 'from-green-500 to-emerald-600', glow: 'glow-green' },
  COINS: { label: 'Coins', icon: '🪙', color: 'from-yellow-400 to-orange-500', glow: 'glow-gold' },
  LANDCLAIM: { label: 'Land Claim', icon: '🏰', color: 'from-blue-500 to-cyan-600', glow: 'glow-cyan' },
  PACKS: { label: 'Packs', icon: '📦', color: 'from-pink-500 to-rose-600', glow: 'glow-pink' },
}
