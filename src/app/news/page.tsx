'use client'
import { useEffect, useState } from 'react'
import { News } from '@/types'
import { Skeleton } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { Newspaper, Calendar, User, Tag } from 'lucide-react'

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/news?limit=20')
      .then((r) => r.json())
      .then((d) => setNews(d.news || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-12">
          <Newspaper className="w-12 h-12 text-hero-violet mx-auto mb-4" />
          <h1 className="font-display text-5xl font-bold text-white mb-3">Server News</h1>
          <p className="text-slate-400">Latest updates, events, and announcements from HeroS SMP</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <Skeleton className="h-48 rounded-none" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl">
            <Newspaper className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="font-display text-xl text-slate-400 mb-2">No news yet</h3>
            <p className="text-slate-500">Check back soon for updates!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {news.map((item, index) => (
              <article
                key={item._id}
                id={item._id}
                className="glass glass-hover rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Featured image */}
                {item.image ? (
                  <div
                    className="h-56 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                ) : index === 0 ? (
                  <div className="h-40 bg-gradient-to-br from-hero-purple/40 via-hero-violet/20 to-hero-cyan/20 flex items-center justify-center">
                    <Newspaper className="w-16 h-16 text-hero-violet/40" />
                  </div>
                ) : null}

                <div className="p-6">
                  {/* Tags */}
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-hero-purple/20 text-hero-glow text-xs font-semibold rounded-full border border-hero-violet/30">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="font-display font-bold text-2xl text-white mb-3">{item.title}</h2>

                  {item.excerpt && (
                    <p className="text-slate-300 text-base mb-4 leading-relaxed font-medium">{item.excerpt}</p>
                  )}

                  <div className="prose prose-invert prose-sm max-w-none mb-4">
                    <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/5 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {item.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
