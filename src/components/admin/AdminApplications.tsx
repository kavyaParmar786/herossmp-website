'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button, Card, Badge, Input, Textarea, Spinner } from '@/components/ui'
import { Plus, X, Edit2, Trash2, Eye, ChevronDown, ChevronUp, Check, XCircle, FileText, Users, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

type QuestionType = 'MCQ' | 'QNA' | 'YES_NO' | 'RATING' | 'SHORT' | 'LONG'

interface Question {
  _id?: string
  label: string
  type: QuestionType
  required: boolean
  options?: string[]
  placeholder?: string
}

interface ApplicationForm {
  _id: string
  title: string
  description: string
  slug: string
  role: string
  questions: Question[]
  isOpen: boolean
  createdBy: string
  createdAt: string
}

interface Submission {
  _id: string
  formId: string
  formTitle: string
  userId: string
  username: string
  answers: { questionId: string; questionLabel: string; answer: string }[]
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  staffNote?: string
  createdAt: string
}

const QUESTION_TYPES: { value: QuestionType; label: string; desc: string }[] = [
  { value: 'SHORT', label: 'Short Answer', desc: 'Single line text input' },
  { value: 'LONG', label: 'Long Answer', desc: 'Multi-line paragraph' },
  { value: 'QNA', label: 'Q&A', desc: 'Detailed answer expected' },
  { value: 'MCQ', label: 'Multiple Choice', desc: 'Choose from options' },
  { value: 'YES_NO', label: 'Yes / No', desc: 'Simple binary choice' },
  { value: 'RATING', label: 'Rating (1-10)', desc: 'Numeric rating scale' },
]

const emptyQuestion = (): Question => ({
  label: '', type: 'SHORT', required: true, options: [], placeholder: ''
})

export default function AdminApplications() {
  const { token } = useAuth()
  const [view, setView] = useState<'forms' | 'submissions'>('forms')
  const [forms, setForms] = useState<ApplicationForm[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [showFormEditor, setShowFormEditor] = useState(false)
  const [editingForm, setEditingForm] = useState<ApplicationForm | null>(null)
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
  const [expandedSub, setExpandedSub] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form editor state
  const [formData, setFormData] = useState({
    title: '', description: '', slug: '', role: 'USER', isOpen: true, questions: [emptyQuestion()] as Question[]
  })

  const loadForms = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/applications/forms?admin=true', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setForms(data.forms || [])
    } catch { toast.error('Failed to load forms') }
    finally { setLoading(false) }
  }

  const loadSubmissions = async (formId?: string) => {
    if (!token) return
    const url = formId ? `/api/applications/submissions?formId=${formId}` : '/api/applications/submissions'
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setSubmissions(data.submissions || [])
    } catch { toast.error('Failed to load submissions') }
  }

  useEffect(() => { loadForms() }, [token])

  useEffect(() => {
    if (view === 'submissions') loadSubmissions(selectedFormId || undefined)
  }, [view, selectedFormId, token])

  const openNewForm = () => {
    setEditingForm(null)
    setFormData({ title: '', description: '', slug: '', role: 'USER', isOpen: true, questions: [emptyQuestion()] })
    setShowFormEditor(true)
  }

  const openEditForm = (form: ApplicationForm) => {
    setEditingForm(form)
    setFormData({
      title: form.title,
      description: form.description,
      slug: form.slug,
      role: form.role,
      isOpen: form.isOpen,
      questions: form.questions.length > 0 ? form.questions : [emptyQuestion()],
    })
    setShowFormEditor(true)
  }

  const addQuestion = () => setFormData(f => ({ ...f, questions: [...f.questions, emptyQuestion()] }))
  const removeQuestion = (i: number) => setFormData(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }))
  const updateQuestion = (i: number, patch: Partial<Question>) =>
    setFormData(f => ({ ...f, questions: f.questions.map((q, idx) => idx === i ? { ...q, ...patch } : q) }))

  const saveForm = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) { toast.error('Title and slug required'); return }
    setSaving(true)
    try {
      const url = editingForm ? `/api/applications/forms/${editingForm._id}` : '/api/applications/forms'
      const method = editingForm ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(editingForm ? 'Form updated!' : 'Form created!')
      setShowFormEditor(false)
      loadForms()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally { setSaving(false) }
  }

  const deleteForm = async (id: string) => {
    if (!confirm('Delete this application form? All submissions will remain.')) return
    try {
      await fetch(`/api/applications/forms/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      toast.success('Form deleted')
      loadForms()
    } catch { toast.error('Failed to delete') }
  }

  const toggleOpen = async (form: ApplicationForm) => {
    try {
      await fetch(`/api/applications/forms/${form._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, isOpen: !form.isOpen }),
      })
      loadForms()
    } catch { toast.error('Failed to toggle') }
  }

  const reviewSubmission = async (id: string, status: 'ACCEPTED' | 'REJECTED', staffNote?: string) => {
    try {
      await fetch(`/api/applications/submissions/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, staffNote }),
      })
      toast.success(`Application ${status.toLowerCase()}`)
      loadSubmissions(selectedFormId || undefined)
    } catch { toast.error('Failed to update') }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>

  // ── Form Editor Modal ─────────────────────────────────────────────────────
  if (showFormEditor) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setShowFormEditor(false)} className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <h2 className="font-display text-2xl font-bold text-white">
            {editingForm ? 'Edit Application Form' : 'New Application Form'}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form settings */}
          <div className="space-y-4">
            <Card className="space-y-4">
              <h3 className="font-semibold text-hero-glow text-sm uppercase tracking-wider">Form Details</h3>
              <Input label="Title" placeholder="Staff Application" value={formData.title}
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
              <Input label="Slug (URL key)" placeholder="staff" value={formData.slug}
                onChange={e => setFormData(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
              <Textarea label="Description" placeholder="Tell applicants what this is for..." rows={3}
                value={formData.description}
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
              <Input label="Role (for reference)" placeholder="STAFF" value={formData.role}
                onChange={e => setFormData(f => ({ ...f, role: e.target.value.toUpperCase() }))} />
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Applications Open</span>
                <button onClick={() => setFormData(f => ({ ...f, isOpen: !f.isOpen }))}
                  className={cn('transition-colors', formData.isOpen ? 'text-green-400' : 'text-slate-600')}>
                  {formData.isOpen ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>
            </Card>
          </div>

          {/* Right: Questions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-hero-glow text-sm uppercase tracking-wider">Questions</h3>
              <Button size="sm" onClick={addQuestion}><Plus className="w-3.5 h-3.5" /> Add Question</Button>
            </div>

            {formData.questions.map((q, i) => (
              <Card key={i} className="space-y-3 border-white/10">
                <div className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-slate-600 mt-2 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Input placeholder={`Question ${i + 1}`} value={q.label}
                        onChange={e => updateQuestion(i, { label: e.target.value })}
                        className="flex-1" />
                      <button onClick={() => removeQuestion(i)} className="text-red-400/60 hover:text-red-400 transition-colors flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Type selector */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {QUESTION_TYPES.map(t => (
                        <button key={t.value} onClick={() => updateQuestion(i, { type: t.value })}
                          className={cn('px-2 py-1.5 rounded-lg text-xs font-semibold transition-all text-left',
                            q.type === t.value
                              ? 'bg-hero-purple/40 text-hero-glow border border-hero-violet/50'
                              : 'glass text-slate-400 hover:text-white')}>
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* MCQ options */}
                    {q.type === 'MCQ' && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500">Options (one per line)</p>
                        <textarea
                          value={(q.options || []).join('\n')}
                          onChange={e => updateQuestion(i, { options: e.target.value.split('\n').filter(Boolean) })}
                          rows={3}
                          placeholder={"Option A\nOption B\nOption C"}
                          className="w-full glass rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 border border-white/10 focus:border-hero-violet/60 focus:outline-none bg-transparent resize-none"
                        />
                      </div>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={q.required}
                        onChange={e => updateQuestion(i, { required: e.target.checked })}
                        className="accent-hero-violet" />
                      <span className="text-xs text-slate-400">Required</span>
                    </label>
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowFormEditor(false)} className="flex-1">Cancel</Button>
              <Button onClick={saveForm} loading={saving} className="flex-1">
                {editingForm ? 'Save Changes' : 'Create Form'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Submissions View ──────────────────────────────────────────────────────
  if (view === 'submissions') {
    const pending = submissions.filter(s => s.status === 'PENDING')
    const reviewed = submissions.filter(s => s.status !== 'PENDING')

    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setView('forms'); setSelectedFormId(null) }}
            className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Applications</h2>
            <p className="text-xs text-slate-500">{selectedFormId ? forms.find(f => f._id === selectedFormId)?.title : 'All forms'}</p>
          </div>
          <div className="ml-auto flex gap-2">
            {forms.map(f => (
              <button key={f._id} onClick={() => setSelectedFormId(f._id === selectedFormId ? null : f._id)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  selectedFormId === f._id ? 'bg-hero-purple/30 text-hero-glow border border-hero-violet/40' : 'glass text-slate-400 hover:text-white')}>
                {f.title}
              </button>
            ))}
          </div>
        </div>

        {submissions.length === 0 ? (
          <Card className="text-center py-16">
            <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400">No applications yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pending.length > 0 && (
              <div>
                <p className="text-xs text-yellow-400 uppercase tracking-wider font-semibold mb-2">Pending Review ({pending.length})</p>
                <div className="space-y-2">
                  {pending.map(sub => <SubmissionCard key={sub._id} sub={sub} expanded={expandedSub === sub._id}
                    onToggle={() => setExpandedSub(expandedSub === sub._id ? null : sub._id)}
                    onReview={reviewSubmission} />)}
                </div>
              </div>
            )}
            {reviewed.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Reviewed ({reviewed.length})</p>
                <div className="space-y-2">
                  {reviewed.map(sub => <SubmissionCard key={sub._id} sub={sub} expanded={expandedSub === sub._id}
                    onToggle={() => setExpandedSub(expandedSub === sub._id ? null : sub._id)}
                    onReview={reviewSubmission} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Forms List ─────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-white">Application Forms</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setView('submissions')}>
            <Users className="w-4 h-4" /> View Submissions
          </Button>
          <Button onClick={openNewForm}><Plus className="w-4 h-4" /> New Form</Button>
        </div>
      </div>

      {forms.length === 0 ? (
        <Card className="text-center py-16">
          <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="font-display text-xl text-white mb-2">No Application Forms</h3>
          <p className="text-slate-400 mb-6">Create your first application form to start recruiting staff.</p>
          <Button onClick={openNewForm}><Plus className="w-4 h-4" /> Create Form</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {forms.map(form => (
            <Card key={form._id} className="flex items-start gap-4">
              <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5',
                form.isOpen ? 'bg-green-400 status-online' : 'bg-slate-500')} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-white">{form.title}</p>
                  <span className="text-xs text-slate-500 font-mono">/{form.slug}</span>
                  <Badge variant={form.isOpen ? 'success' : 'default'}>{form.isOpen ? 'OPEN' : 'CLOSED'}</Badge>
                  <span className="text-xs px-2 py-0.5 bg-hero-purple/20 text-hero-glow rounded-full">{form.role}</span>
                </div>
                {form.description && <p className="text-sm text-slate-400 mt-1 truncate">{form.description}</p>}
                <p className="text-xs text-slate-500 mt-1">{form.questions.length} questions · created {formatRelativeTime(form.createdAt)} by {form.createdBy}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggleOpen(form)}
                  className={cn('p-2 rounded-lg transition-colors text-sm', form.isOpen ? 'text-green-400 hover:bg-green-400/10' : 'text-slate-500 hover:bg-white/5')}>
                  {form.isOpen ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => { setSelectedFormId(form._id); setView('submissions') }}
                  className="p-2 glass rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => openEditForm(form)}
                  className="p-2 glass rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteForm(form._id)}
                  className="p-2 glass rounded-lg hover:bg-red-500/10 transition-colors text-slate-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Submission card sub-component
function SubmissionCard({ sub, expanded, onToggle, onReview }: {
  sub: Submission
  expanded: boolean
  onToggle: () => void
  onReview: (id: string, status: 'ACCEPTED' | 'REJECTED', note?: string) => void
}) {
  const [note, setNote] = useState(sub.staffNote || '')

  return (
    <Card className={cn('transition-all', sub.status === 'PENDING' && 'border-yellow-400/20')}>
      <div className="flex items-center gap-3 cursor-pointer" onClick={onToggle}>
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0',
          sub.status === 'PENDING' ? 'bg-yellow-400' :
          sub.status === 'ACCEPTED' ? 'bg-green-400' : 'bg-red-400')} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">@{sub.username}</p>
          <p className="text-xs text-slate-500">{sub.formTitle} · {formatRelativeTime(sub.createdAt)}</p>
        </div>
        <Badge variant={sub.status === 'ACCEPTED' ? 'success' : sub.status === 'REJECTED' ? 'danger' : 'warning'}>
          {sub.status}
        </Badge>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
          {sub.answers.map((ans, i) => (
            <div key={i}>
              <p className="text-xs text-hero-glow font-semibold mb-1">{ans.questionLabel}</p>
              <p className="text-sm text-slate-300 glass rounded-lg px-3 py-2">{ans.answer || <span className="text-slate-600 italic">No answer</span>}</p>
            </div>
          ))}

          {sub.status === 'PENDING' && (
            <div className="space-y-2 pt-2">
              <Textarea label="Staff Note (optional)" rows={2} value={note} onChange={e => setNote(e.target.value)}
                placeholder="Add an internal note about this application..." />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="danger" onClick={() => onReview(sub._id, 'REJECTED', note)}>
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </Button>
                <Button size="sm" onClick={() => onReview(sub._id, 'ACCEPTED', note)}>
                  <Check className="w-3.5 h-3.5" /> Accept
                </Button>
              </div>
            </div>
          )}
          {sub.status !== 'PENDING' && sub.staffNote && (
            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-slate-500">Staff note: <span className="text-slate-300">{sub.staffNote}</span></p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
