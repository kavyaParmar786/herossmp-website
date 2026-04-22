'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import { Card } from '@/components/ui'

interface ApplicationForm {
  _id: string
  title: string
  description: string
  slug: string
  role: string
}

export default function ApplyPage() {
  const [forms, setForms] = useState<ApplicationForm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/applications/forms')
      .then(r => r.json())
      .then(d => setForms(d.forms || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-display text-5xl font-bold text-gold mb-4">Apply Now</h1>
          <p className="text-slate-400 text-lg">Join the HeroSMP team — choose an open position below</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="glass rounded-2xl h-24 shimmer" />)}
          </div>
        ) : forms.length === 0 ? (
          <Card className="text-center py-16">
            <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400">No open positions right now. Check back later!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {forms.map((form, i) => (
              <Link key={form._id} href={`/apply/${form.slug}`}
                className="glass glass-hover rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 block"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hero-purple/40 to-hero-violet/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-hero-glow" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-white text-lg">{form.title}</p>
                  {form.description && <p className="text-sm text-slate-400 mt-0.5 truncate">{form.description}</p>}
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-hero-purple/20 text-hero-glow rounded-full">{form.role}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
