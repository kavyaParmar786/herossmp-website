'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { FAQ } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { Button, Input, Card } from '@/components/ui'
import { Plus, Pencil, Trash2, X, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, Type } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Emoji list ────────────────────────────────────────────────────────────────
const EMOJIS = [
  '⚔️','🛡️','🏆','💎','🔥','⚡','🌟','✨','💫','🎯','🎮','🗡️','🏹','🪄',
  '👑','💀','🐉','🦁','🐺','🦅','🌙','☀️','❄️','🌊','💥','🎉','🎊','🎁',
  '💰','🪙','📜','🗺️','⛏️','🔨','🪵','🍎','🥩','🧪','📦','🎒','🏠','🏰',
  '✅','❌','⚠️','ℹ️','📌','📣','🔔','💬','🤝','👋','💪','🙏','👍','❤️',
]

// ── Color palette ─────────────────────────────────────────────────────────────
const COLORS = [
  '#ffffff','#e2e8f0','#94a3b8','#64748b',
  '#f87171','#fb923c','#fbbf24','#a3e635',
  '#34d399','#22d3ee','#60a5fa','#818cf8',
  '#c084fc','#f472b6','#ff6b6b','#ffd700',
  '#00ff88','#00cfff','#a855f7','#ec4899',
]

const FONT_SIZES = ['12','14','16','18','20','24','28','32','36','48','64']
const FONT_FAMILIES = [
  { label: 'Default', value: 'inherit' },
  { label: 'Orbitron', value: 'Orbitron, sans-serif' },
  { label: 'Cinzel', value: 'Cinzel, serif' },
  { label: 'Mono', value: 'monospace' },
  { label: 'Serif', value: 'Georgia, serif' },
]

// ── Toolbar Button ─────────────────────────────────────────────────────────────
function ToolBtn({ onClick, title, active, children }: { onClick: () => void; title: string; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`p-1.5 rounded transition-all text-xs font-medium select-none ${
        active ? 'bg-hero-violet text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

// ── Rich Text Editor ───────────────────────────────────────────────────────────
function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showEmojis, setShowEmojis] = useState(false)
  const [showColors, setShowColors] = useState<'text' | 'bg' | null>(null)
  const [activeColor, setActiveColor] = useState('#ffffff')
  const [fontSize, setFontSize] = useState('16')
  const [fontFamily, setFontFamily] = useState('inherit')

  // Init content once
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, []) // eslint-disable-line

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    onChange(editorRef.current?.innerHTML || '')
  }, [onChange])

  const applyFontSize = (size: string) => {
    setFontSize(size)
    editorRef.current?.focus()
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0)
      const span = document.createElement('span')
      span.style.fontSize = size + 'px'
      range.surroundContents(span)
      onChange(editorRef.current?.innerHTML || '')
    }
  }

  const applyFont = (font: string) => {
    setFontFamily(font)
    editorRef.current?.focus()
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0)
      const span = document.createElement('span')
      span.style.fontFamily = font
      range.surroundContents(span)
      onChange(editorRef.current?.innerHTML || '')
    }
  }

  const applyTextColor = (color: string) => {
    exec('foreColor', color)
    setActiveColor(color)
    setShowColors(null)
  }

  const applyBgColor = (color: string) => {
    exec('hiliteColor', color)
    setShowColors(null)
  }

  const insertEmoji = (emoji: string) => {
    editorRef.current?.focus()
    document.execCommand('insertText', false, emoji)
    onChange(editorRef.current?.innerHTML || '')
    setShowEmojis(false)
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) exec('createLink', url)
  }

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-black/30">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-white/10 bg-black/20">
        {/* Text style */}
        <ToolBtn onClick={() => exec('bold')} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('italic')} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('underline')} title="Underline"><Underline className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('strikeThrough')} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolBtn>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Font size */}
        <select
          value={fontSize}
          onChange={(e) => applyFontSize(e.target.value)}
          className="bg-black/40 border border-white/10 text-slate-300 text-xs rounded px-1.5 py-1 outline-none focus:border-hero-violet cursor-pointer"
          title="Font Size"
        >
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
        </select>

        {/* Font family */}
        <select
          value={fontFamily}
          onChange={(e) => applyFont(e.target.value)}
          className="bg-black/40 border border-white/10 text-slate-300 text-xs rounded px-1.5 py-1 outline-none focus:border-hero-violet cursor-pointer"
          title="Font Family"
        >
          {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Alignment */}
        <ToolBtn onClick={() => exec('justifyLeft')} title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('justifyCenter')} title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('justifyRight')} title="Align Right"><AlignRight className="w-3.5 h-3.5" /></ToolBtn>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Lists */}
        <ToolBtn onClick={() => exec('insertUnorderedList')} title="Bullet List"><List className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('insertOrderedList')} title="Numbered List"><Type className="w-3.5 h-3.5" /></ToolBtn>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowColors(showColors === 'text' ? null : 'text'); setShowEmojis(false) }}
            title="Text Color"
            className="p-1.5 rounded hover:bg-white/10 transition-all flex flex-col items-center gap-0.5"
          >
            <span className="text-xs font-bold text-white leading-none">A</span>
            <span className="w-4 h-1 rounded-full" style={{ backgroundColor: activeColor }} />
          </button>
          {showColors === 'text' && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-[#1a1a2e] border border-white/20 rounded-xl p-3 shadow-2xl w-52">
              <p className="text-xs text-slate-400 mb-2 font-medium">Text Color</p>
              <div className="grid grid-cols-10 gap-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyTextColor(c) }}
                    className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <label className="text-xs text-slate-400">Custom:</label>
                <input
                  type="color"
                  className="w-8 h-6 rounded cursor-pointer border-0 bg-transparent"
                  onInput={(e) => applyTextColor((e.target as HTMLInputElement).value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* BG/Highlight Color */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowColors(showColors === 'bg' ? null : 'bg'); setShowEmojis(false) }}
            title="Highlight Color"
            className="p-1.5 rounded hover:bg-white/10 transition-all flex flex-col items-center gap-0.5"
          >
            <span className="text-xs font-bold leading-none" style={{ color: '#ffd700', textShadow: '0 0 6px #ffd70080' }}>H</span>
            <span className="w-4 h-1 rounded-full bg-yellow-400/70" />
          </button>
          {showColors === 'bg' && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-[#1a1a2e] border border-white/20 rounded-xl p-3 shadow-2xl w-52">
              <p className="text-xs text-slate-400 mb-2 font-medium">Highlight Color</p>
              <div className="grid grid-cols-10 gap-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyBgColor(c) }}
                    className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <label className="text-xs text-slate-400">Custom:</label>
                <input
                  type="color"
                  className="w-8 h-6 rounded cursor-pointer border-0 bg-transparent"
                  onInput={(e) => applyBgColor((e.target as HTMLInputElement).value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Link */}
        <ToolBtn onClick={insertLink} title="Insert Link">
          <span className="text-xs">🔗</span>
        </ToolBtn>

        {/* Emoji picker */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowEmojis(!showEmojis); setShowColors(null) }}
            title="Insert Emoji"
            className="p-1.5 rounded hover:bg-white/10 transition-all text-base leading-none"
          >
            😀
          </button>
          {showEmojis && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-[#1a1a2e] border border-white/20 rounded-xl p-3 shadow-2xl w-72">
              <p className="text-xs text-slate-400 mb-2 font-medium">Emojis</p>
              <div className="grid grid-cols-10 gap-1">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onMouseDown={(ev) => { ev.preventDefault(); insertEmoji(e) }}
                    className="text-lg hover:scale-125 transition-transform hover:bg-white/10 rounded p-0.5"
                    title={e}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Clear formatting */}
        <ToolBtn onClick={() => exec('removeFormat')} title="Clear Formatting">
          <span className="text-xs">✕ fmt</span>
        </ToolBtn>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        onClick={() => { setShowColors(null); setShowEmojis(false) }}
        className="min-h-[120px] max-h-[300px] overflow-y-auto p-4 text-slate-200 text-sm leading-relaxed outline-none focus:ring-1 focus:ring-hero-violet/50"
        style={{ wordBreak: 'break-word' }}
        data-placeholder="Write the FAQ answer... select text to style it"
      />

      {/* Bottom hint */}
      <div className="px-4 py-2 border-t border-white/5 bg-black/10 flex items-center justify-between">
        <span className="text-xs text-slate-600">Select text then apply styles from the toolbar above</span>
        <span className="text-xs text-slate-600">Supports HTML formatting</span>
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #475569;
          pointer-events: none;
        }
        [contenteditable] a { color: #818cf8; text-decoration: underline; }
        [contenteditable] ul { list-style: disc; padding-left: 1.5em; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5em; }
      `}</style>
    </div>
  )
}

// ── Main AdminFAQ Component ───────────────────────────────────────────────────
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
            <Input
              label="Question"
              value={editing.question || ''}
              onChange={(e) => setEditing({ ...editing, question: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Answer <span className="text-xs text-hero-violet ml-1">(rich text — colors, emojis, bold, size, etc.)</span>
              </label>
              <RichEditor
                value={editing.answer || ''}
                onChange={(html) => setEditing({ ...editing, answer: html })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Category"
                value={editing.category || 'General'}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              />
              <Input
                label="Order"
                type="number"
                value={editing.order ?? 0}
                onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) })}
              />
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
              {/* Preview strips HTML tags for admin list view */}
              <p className="text-sm text-slate-400 mt-1 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
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
