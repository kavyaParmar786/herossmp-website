'use client'
import { useEffect, useState } from 'react'
import { Product } from '@/types'
import ProductCard from '@/components/store/ProductCard'
import { CATEGORY_META } from '@/lib/utils'
import { Skeleton } from '@/components/ui'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params
  const categoryKey = category.toUpperCase() as keyof typeof CATEGORY_META
  const meta = CATEGORY_META[categoryKey]

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/products?category=${categoryKey}`)
        const data = await res.json()
        setProducts(data.products || [])
      } catch {
        console.error('Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [categoryKey])

  if (!meta) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-display text-4xl text-white mb-4">Category Not Found</h1>
        <Link href="/store" className="text-hero-glow hover:underline">← Back to Store</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 bg-void bg-grid opacity-50 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">{meta.icon}</div>
          <h1 className={`font-display text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${meta.color} mb-3`}>
            {meta.label}
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">Browse our {meta.label.toLowerCase()} collection</p>
          <Link href="/store" className="inline-block mt-3 text-sm text-slate-500 hover:text-hero-glow transition-colors">
            ← All Categories
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 space-y-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="font-display text-xl text-slate-400 mb-2">No {meta.label} available</h3>
            <p className="text-slate-500">Check back soon!</p>
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
