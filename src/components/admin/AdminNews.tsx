'use client'
import { useEffect, useState } from 'react'
import { News } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { Button, Input, Textarea, Card } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

type NewsForm = {
  _id?: string
  title: string
  content: string
  excerpt: string
  tags: string
  image: string
}

const emptyNews: NewsForm = { title: '', content: '', excerpt: '', tags: '', image: '' }

export default function AdminNews() {
  const { token } = useAuth()
  const [news, setNews] = useState<News[]>([])
  const [editing, setEditing] = useState<NewsForm | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const res = await fetch('/api/news?limit=50')
    const data = await res.json()
    setNews(data.news || [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing?.title?.trim() || !editing.content?.trim()) {
      toast.error('Title and content are required')
      return
    }
    setLoading(true)
    try {
      const payload = {
        title: editing.title,
        content: editing.content,
        excerpt: editing.excerpt,
        image: editing.image,
        tags: editing.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }
      const isNew = !editing._id
      const url = isNew ? '/api/news' : `/api/news/${editing._id}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(isNew ? 'News published!' : 'News updated!')
      setEditing(null)
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const deleteNews = async (id: string) => {
    if (!confirm('Delete this news post?')) return
    try {
      await fetch(`/api/news/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      toast.success('Deleted!')
      load()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-white">News</h2>
        <Button onClick={() => setEditing({ ...emptyNews })}>
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {editing && (
        <Card className="mb-8 border-hero-violet/30">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-lg text-white">{editing._id ? 'Edit Post' : 'New Post'}</h3>
            <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <Input label="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Post title" />
            <Input label="Excerpt (optional)" value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} placeholder="Short summary shown on homepage" />
            <Textarea label="Content" rows={6} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} placeholder="Full article content..." />
            <Input label="Tags (comma-separated)" value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} placeholder="update, event, patch" />
            <Input label="Image URL (optional)" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." />
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button loading={loading} onClick={save}>Publish</Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {news.map((item) => (
          <Card key={item._id} className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">{item.title}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(item.createdAt)}
                <span>by {item.author}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="secondary" size="sm" onClick={() => setEditing({
                _id: item._id,
                title: item.title,
                content: item.content,
                excerpt: item.excerpt || '',
                tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
                image: item.image || '',
              })}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="danger" size="sm" onClick={() => deleteNews(item._id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
