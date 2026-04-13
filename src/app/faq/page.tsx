'use client'
import { useEffect, useState } from 'react'
import { FAQ } from '@/types'
import { Skeleton } from '@/components/ui'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/faq')
      .then((r) => r.json())
      .then((d) => setFaqs(d.faqs || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const categories = Array.from(new Set(faqs.map((f) => f.category)))

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 bg-void bg-grid opacity-50 pointer-events-none" />
      <div className="max-w-3xl mx-auto relative">
        <div className="text-center mb-12">
          <HelpCircle className="w-12 h-12 text-hero-violet mx-auto mb-4" />
          <h1 className="font-display text-5xl font-bold text-white mb-3">FAQ</h1>
          <p className="text-slate-400">Find answers to common questions about HeroS SMP</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <HelpCircle className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="font-display text-xl text-slate-400 mb-2">No FAQs yet</h3>
            <p className="text-slate-500">Check back soon or open a support ticket!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat}>
                <h2 className="font-display font-bold text-sm uppercase tracking-widest text-hero-violet mb-4 pl-2">
                  {cat}
                </h2>
                <div className="space-y-3">
                  {faqs.filter((f) => f.category === cat).map((faq) => (
                    <div
                      key={faq._id}
                      className={cn(
                        'glass rounded-xl overflow-hidden border transition-all duration-300',
                        openId === faq._id ? 'border-hero-violet/40' : 'border-white/5 hover:border-white/10'
                      )}
                    >
                      <button
                        onClick={() => setOpenId(openId === faq._id ? null : faq._id)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                      >
                        <span className="font-semibold text-white pr-4">{faq.question}</span>
                        <ChevronDown
                          className={cn(
                            'w-5 h-5 text-hero-violet flex-shrink-0 transition-transform duration-300',
                            openId === faq._id && 'rotate-180'
                          )}
                        />
                      </button>
                      {openId === faq._id && (
                        <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
