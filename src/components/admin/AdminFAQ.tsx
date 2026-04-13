'use client'
import { useEffect, useState } from 'react'
import { FAQ } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { Button, Input, Textarea, Card } from '@/components/ui'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminFAQ() {
  const { token } = useAuth()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [editing, setEditing] = useState<Partial<FAQ> | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const res = await fetch('/api/faq')
    const data = await res.json()
    setFaqs(data.faqs || [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing?.question?.trim() || !editing.answer?.trim()) {
      toast.error('Question and answer are required')
      return
    }
    setLoading(true)
    try {
      const isNew = !('_id' in editing) || !editing._id
      const res = await fetch('/api/faq', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(isNew ? editing : { id: editing._id, ...editing }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(isNew ? 'FAQ created!' : 'FAQ updated!')
      setEditing(null)
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const deleteFaq = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return
    try {
      await fetch(`/api/faq?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      toast.success('Deleted!')
      load()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-white">FAQ Manager</h2>
        <Button onClick={() => setEditing({ question: '', answer: '', category: 'General', order: 0 })}>
          <Plus className="w-4 h-4" /> Add FAQ
        </Button>
      </div>

      {editing && (
        <Card className="mb-8 border-hero-violet/30">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-lg text-white">{'_id' in editing && editing._id ? 'Edit FAQ' : 'New FAQ'}</h3>
            <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <Input label="Question" value={editing.question || ''} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
            <Textarea label="Answer" rows={3} value={editing.answer || ''} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Category" value={editing.category || 'General'} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              <Input label="Order" type="number" value={editing.order ?? 0} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button loading={loading} onClick={save}>Save FAQ</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {faqs.map((faq) => (
          <Card key={faq._id} className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">{faq.question}</p>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">{faq.answer}</p>
              <span className="text-xs text-hero-glow mt-1 inline-block">{faq.category}</span>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="secondary" size="sm" onClick={() => setEditing({ ...faq })}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="danger" size="sm" onClick={() => deleteFaq(faq._id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
        {faqs.length === 0 && (
          <div className="text-center py-12 text-slate-500">No FAQs yet. Add your first one!</div>
        )}
      </div>
    </div>
  )
}
