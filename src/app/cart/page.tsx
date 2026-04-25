'use client'
import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { Button, Card } from '@/components/ui'
import { formatCurrency, calculateGST } from '@/lib/utils'
import { ShoppingCart, Trash2, Plus, Minus, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open(): void }
  }
}

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, total } = useCart()
  const { user, token } = useAuth()
  const router = useRouter()
  const [paying, setPaying] = useState(false)
  const [mcUsername, setMcUsername] = useState('')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { gst, total: finalTotal } = calculateGST(total)

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please log in to checkout')
      router.push('/login?redirect=/cart')
      return
    }

    setPaying(true)
    try {
      const ok = await loadRazorpay()
      if (!ok) throw new Error('Razorpay SDK failed to load')

      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product._id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            category: i.product.category || 'RANKS',
            commands: i.product.commands || [],
          })),
          minecraftUsername: mcUsername.trim(),
        }),
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order')

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'HeroS SMP',
        description: `${items.length} item(s) — ${user.username}`,
        prefill: { name: user.username, email: user.email },
        theme: { color: '#7c3aed' },
        handler: async (response: Record<string, string>) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...response,
                dbOrderId: orderData.dbOrderId,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyRes.ok) {
              clearCart()
              toast.success('Payment successful! Thank you!')
              router.push('/dashboard')
            } else {
              toast.error(verifyData.error || 'Payment verification failed')
            }
          } catch {
            toast.error('Failed to verify payment')
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      })

      rzp.open()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setPaying(false)
    }
  }

  if (!mounted) {
    return <div className="min-h-screen pt-32 flex items-center justify-center" />
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center px-4">
        <div className="relative text-center">
          <ShoppingCart className="w-24 h-24 text-slate-600 mx-auto mb-6" />
          <h1 className="font-display text-4xl font-bold text-white mb-3">Your cart is empty</h1>
          <p className="text-slate-400 mb-8">Add some awesome items from our store!</p>
          <Link href="/store" className="inline-flex items-center gap-2 px-8 py-3 btn-primary text-white font-bold rounded-xl">
            Browse Store <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto relative">
        <h1 className="font-display text-4xl font-bold text-white mb-8">Your Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <Card key={product._id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hero-purple/40 to-hero-violet/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {product.category === 'RANKS' ? '👑' :
                   product.category === 'KEYS' ? '🗝️' :
                   product.category === 'COINS' ? '🪙' :
                   product.category === 'MONEY' ? '💰' :
                   product.category === 'LANDCLAIM' ? '🏰' : '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{product.name}</h3>
                  <p className="text-sm text-slate-400">{product.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(product._id, quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center glass rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => updateQty(product._id, quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center glass rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="font-bold text-hero-glow">{formatCurrency(product.price * quantity)}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(product.price)} each</p>
                </div>
                <button
                  onClick={() => removeItem(product._id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 space-y-4">
              <h2 className="font-display font-bold text-xl text-white">Order Summary</h2>

              <div className="space-y-3 py-4 border-y border-white/10">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>GST (18%)</span>
                  <span className="text-white">{formatCurrency(gst)}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg">
                <span className="text-white">Total</span>
                <span className="text-hero-glow">{formatCurrency(finalTotal)}</span>
              </div>

              {/* Minecraft IGN — required for auto-delivery */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <span className="text-emerald-400">⚔</span>
                  Minecraft Username (IGN)
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={mcUsername}
                  onChange={e => setMcUsername(e.target.value)}
                  placeholder="e.g. Notch"
                  maxLength={32}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                />
                <p className="text-xs text-slate-500">Your in-game name — items will be delivered here automatically.</p>
              </div>

              <Button
                onClick={handleCheckout}
                loading={paying}
                disabled={!mcUsername.trim()}
                size="lg"
                className="w-full"
              >
                <ShieldCheck className="w-5 h-5" />
                Pay with Razorpay
              </Button>

              <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secured by Razorpay · GST included
              </p>

              <button
                onClick={clearCart}
                className="w-full text-xs text-red-400 hover:text-red-300 transition-colors py-2"
              >
                Clear cart
              </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
