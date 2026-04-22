'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { News, Product } from '@/types'
import ProductCard from '@/components/store/ProductCard'
import { ArrowRight, Newspaper, Calendar } from 'lucide-react'
import { formatRelativeTime, truncate } from '@/lib/utils'
import { Skeleton, SectionHeading } from '@/components/ui'

export default function HomepageClient() {
  const [news, setNews] = useState<News[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [newsRes, productsRes] = await Promise.all([
          fetch('/api/news?limit=3'),
          fetch('/api/products'),
        ])
        const newsData = await newsRes.json()
        const productsData = await productsRes.json()
        setNews(newsData.news || [])
        const popularProducts = (productsData.products || []).filter((p: Product) => p.popular).slice(0, 3)
        setFeatured(popularProducts.length > 0 ? popularProducts : (productsData.products || []).slice(0, 3))
      } catch (err) {
        console.error('Failed to load homepage data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      {/* Latest News */}
      <section className="relative px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <SectionHeading title="Latest News" subtitle="Stay up to date with server updates and events" />
            <Link href="/news" className="hidden md:flex items-center gap-2 text-sm text-hero-glow hover:text-hero-violet transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl overflow-hidden">
                  <Skeleton className="h-36 rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))
            ) : news.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-500">
                <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No news yet. Check back soon!</p>
              </div>
            ) : (
              news.map((item) => (
                <Link key={item._id} href={`/news#${item._id}`}>
                  <article className="glass glass-hover rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300">
                    {/* Color banner or image */}
                    {item.image ? (
                      <div
                        className="h-36 bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                    ) : (
                      <div className="h-36 bg-gradient-to-br from-hero-purple/30 to-hero-cyan/20 flex items-center justify-center">
                        <Newspaper className="w-12 h-12 text-hero-violet/50" />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-hero-purple/20 text-hero-glow text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-display font-bold text-white mb-2 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-400 flex-1 leading-relaxed">
                        {truncate(item.excerpt || item.content, 100)}
                      </p>
                      <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatRelativeTime(item.createdAt)}
                        <span className="ml-auto">by {item.author}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Store Items */}
      {(featured.length > 0 || loading) && (
        <section className="relative px-4 py-16 bg-gradient-to-b from-transparent via-hero-purple/5 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <SectionHeading title="Featured Items" subtitle="Upgrade your experience with our top picks" />
              <Link href="/store" className="hidden md:flex items-center gap-2 text-sm text-hero-glow hover:text-hero-violet transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="glass rounded-2xl p-5 space-y-4">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-10 w-full mt-4" />
                    </div>
                  ))
                : featured.map((product) => (
                    <ProductCard key={product._id} product={product} featured />
                  ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/store"
                className="inline-flex items-center gap-2 px-8 py-3 btn-primary text-white font-bold rounded-xl"
              >
                Browse Full Store <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
