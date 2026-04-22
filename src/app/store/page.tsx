'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Product } from '@/types'
import ProductCard from '@/components/store/ProductCard'
import { CATEGORY_META } from '@/lib/utils'
import { Skeleton, SectionHeading } from '@/components/ui'
import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = ['ALL', 'RANKS', 'KEYS', 'MONEY', 'COINS', 'LANDCLAIM', 'PACKS']

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [active, setActive] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const url = active === 'ALL' ? '/api/products' : `/api/products?category=${active}`
        const res = await fetch(url)
        const data = await res.json()
        setProducts(data.products || [])
      } catch {
        console.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [active])

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12">
          <SectionHeading
            title="HeroS Store"
            subtitle="Power up your gameplay with exclusive ranks, keys, and more"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => {
            const meta = cat !== 'ALL' ? CATEGORY_META[cat as keyof typeof CATEGORY_META] : null
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                  active === cat
                    ? 'btn-primary text-white shadow-glow-sm'
                    : 'glass glass-hover text-slate-400 hover:text-white'
                )}
              >
                {meta && <span>{meta.icon}</span>}
                {cat === 'ALL' ? 'All Items' : meta?.label || cat}
              </button>
            )
          })}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 space-y-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="font-display text-xl text-slate-400 mb-2">No items found</h3>
            <p className="text-slate-500">Check back soon for new products!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
