'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, CartItem } from '@/types'
import toast from 'react-hot-toast'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart')
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id)
      if (existing) {
        toast.success('Quantity updated')
        return prev.map((i) =>
          i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      toast.success(`${product.name} added to cart`)
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId))
    toast.success('Item removed')
  }

  const updateQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.product._id === productId ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('cart')
  }

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
