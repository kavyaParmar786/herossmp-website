'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button, Card, Spinner } from '@/components/ui'
import { ArrowLeft, CheckCircle, Send } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type QuestionType = 'MCQ' | 'QNA' | 'YES_NO' | 'RATING' | 'SHORT' | 'LONG'
interface Question { _id: string; label: string; type: QuestionType; required: boolean; options?: string[]; placeholder?: string }
interface ApplicationForm { _id: string; title: string; description: string; slug: string; role: string; questions: Question[]; isOpen: boolean }

export default function ApplyFormPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<ApplicationForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/applications/forms?admin=false`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => {
        const found = (d.forms || []).find((f: ApplicationForm) => f.slug === slug)
        // Ensure questions is always an array even if DB doc is malformed
        if (found) found.questions = found.questions || []
        setForm(found || null)
      })
      .catch(() => setForm(null))
      .finally(() => setLoading(false))
  }, [slug])

  const handleSubmit = async () => {
    if (!user || !token) { router.push(`/login?redirect=/apply/${slug}`); return }
    if (!form) return

    // Validate
    for (const q of form.questions) {
      if (q.required && !answers[q._id]?.trim()) {
        toast.error(`"${q.label}" is required`)
        return
      }
    }

    setSubmitting(true)
    try {
      const payload = {
        formId: form._id,
        answers: form.questions.map(q => ({
          questionId: q._id,
          questionLabel: q.label,
          answer: answers[q._id] || '',
        })),
      }
      const res = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubmitted(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || authLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner className="w-10 h-10" /></div>

  if (!form) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="text-center py-12 max-w-sm">
        <p className="text-slate-400 mb-4">Application form not found</p>
        <Link href="/apply"><Button variant="ghost">← Back to Applications</Button></Link>
      </Card>
    </div>
  )

  if (!form.isOpen) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="text-center py-12 max-w-sm">
        <p className="text-2xl mb-2">🔒</p>
        <h2 className="font-display font-bold text-white mb-2">Applications Closed</h2>
        <p className="text-slate-400 mb-4">This position is not accepting applications right now.</p>
        <Link href="/apply"><Button variant="ghost">← Other Positions</Button></Link>
      </Card>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
      <Card className="text-center py-16 max-w-md">
        <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
        <h2 className="font-display text-3xl font-bold text-white mb-2">Application Submitted!</h2>
        <p className="text-slate-400 mb-6">Your application for <strong className="text-white">{form.title}</strong> has been received. We'll review it and get back to you.</p>
        <Link href="/dashboard"><Button>Go to Dashboard</Button></Link>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/apply" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">{form.title}</h1>
            {form.description && <p className="text-slate-400 mt-1">{form.description}</p>}
          </div>
        </div>

        <div className="space-y-5">
          {form.questions.map((q, i) => (
            <Card key={q._id} className="animate-fade-in" style={{ animationDelay: `${i * 0.07}s` } as React.CSSProperties}>
              <div className="flex items-start gap-2 mb-3">
                <span className="text-xs font-bold text-hero-glow bg-hero-purple/20 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="font-semibold text-white text-sm leading-snug">
                  {q.label}
                  {q.required && <span className="text-red-400 ml-1">*</span>}
                </p>
              </div>

              <QuestionInput q={q} value={answers[q._id] || ''} onChange={v => setAnswers(a => ({ ...a, [q._id]: v }))} />
            </Card>
          ))}

          {!user && (
            <div className="glass-gold rounded-xl p-4 text-center">
              <p className="text-slate-300 text-sm">You need to <Link href={`/login?redirect=/apply/${slug}`} className="text-hero-glow hover:underline font-semibold">sign in</Link> to submit this application.</p>
            </div>
          )}

          <Button onClick={handleSubmit} loading={submitting} className="w-full" disabled={!user}>
            <Send className="w-4 h-4" />
            Submit Application
          </Button>
        </div>
      </div>
    </div>
  )
}

function QuestionInput({ q, value, onChange }: { q: Question; value: string; onChange: (v: string) => void }) {
  const base = "w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-hero-violet/60 focus:outline-none bg-transparent transition-all"

  if (q.type === 'MCQ') return (
    <div className="grid grid-cols-2 gap-2">
      {(q.options || []).map(opt => (
        <button key={opt} onClick={() => onChange(opt)}
          className={cn('px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border text-left',
            value === opt
              ? 'bg-hero-purple/40 text-hero-glow border-hero-violet/50'
              : 'glass text-slate-300 border-white/10 hover:border-white/20')}>
          {opt}
        </button>
      ))}
    </div>
  )

  if (q.type === 'YES_NO') return (
    <div className="flex gap-3">
      {['Yes', 'No'].map(opt => (
        <button key={opt} onClick={() => onChange(opt)}
          className={cn('flex-1 py-3 rounded-xl text-sm font-bold transition-all border',
            value === opt
              ? opt === 'Yes' ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-red-500/20 text-red-400 border-red-500/40'
              : 'glass text-slate-400 border-white/10 hover:border-white/20')}>
          {opt}
        </button>
      ))}
    </div>
  )

  if (q.type === 'RATING') return (
    <div className="flex gap-2 flex-wrap">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
        <button key={n} onClick={() => onChange(String(n))}
          className={cn('w-10 h-10 rounded-xl text-sm font-bold transition-all border',
            value === String(n)
              ? 'bg-hero-purple/40 text-hero-glow border-hero-violet/50'
              : 'glass text-slate-400 border-white/10 hover:border-white/20')}>
          {n}
        </button>
      ))}
    </div>
  )

  if (q.type === 'LONG' || q.type === 'QNA') return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={5}
      placeholder={q.placeholder || 'Your answer...'} className={cn(base, 'resize-none')} />
  )

  return <input value={value} onChange={e => onChange(e.target.value)}
    placeholder={q.placeholder || 'Your answer...'} className={base} />
}
