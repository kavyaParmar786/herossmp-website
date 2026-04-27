'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { FAQ } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { Button, Input, Card } from '@/components/ui'
import { Plus, Pencil, Trash2, X, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from 'lucide-react'
import toast from 'react-hot-toast'

const EMOJIS = [
  '⚔️','🛡️','🏆','💎','🔥','⚡','🌟','✨','💫','🎯','🎮','🗡️','🏹','🪄',
  '👑','💀','🐉','🦁','🐺','🦅','🌙','☀️','❄️','🌊','💥','🎉','🎊','🎁',
  '💰','🪙','📜','🗺️','⛏️','🔨','🪵','🍎','🥩','🧪','📦','🎒','🏠','🏰',
  '✅','❌','⚠️','ℹ️','📌','📣','🔔','💬','🤝','👋','💪','🙏','👍','❤️',
]

const COLORS = [
  '#ffffff','#e2e8f0','#94a3b8','#64748b',
  '#f87171','#fb923c','#fbbf24','#a3e635',
  '#34d399','#22d3ee','#60a5fa','#818cf8',
  '#c084fc','#f472b6','#ff6b6b','#ffd700',
  '#00ff88','#00cfff','#a855f7','#ec4899',
]

const FONT_SIZES = ['12','14','16','18','20','24','28','32','36','48','64']
const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Orbitron', value: 'Orbitron, sans-serif' },
  { label: 'Cinzel', value: 'Cinzel, serif' },
  { label: 'Mono', value: 'monospace' },
  { label: 'Serif', value: 'Georgia, serif' },
]

// ── Save / restore selection ───────────────────────────────────────────────────
function saveSelection(): Range | null {
  const sel = window.getSelection()
  if (sel && sel.rangeCount > 0) return sel.getRangeAt(0).cloneRange()
  return null
}
function restoreSelection(range: Range | null) {
  if (!range) return
  const sel = window.getSelection()
  if (!sel) return
  sel.removeAllRanges()
  sel.addRange(range)
}

// ── Safe span wrapper — handles multi-node selections without crashing ─────────
function wrapSelectionWithSpan(style: Record<string, string>, savedRange: Range | null) {
  if (!savedRange) return
  restoreSelection(savedRange)
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed) return

  const range = sel.getRangeAt(0)
  // extractContents handles partial/multi-node selections safely
  const fragment = range.extractContents()
  const span = document.createElement('span')
  Object.entries(style).forEach(([k, v]) => {
    (span.style as unknown as Record<string, string>)[k] = v
  })
  span.appendChild(fragment)
  range.insertNode(span)
  // Place cursor after span
  const after = document.createRange()
  after.setStartAfter(span)
  after.collapse(true)
  sel.removeAllRanges()
  sel.addRange(after)
}

// ── Toolbar Button ─────────────────────────────────────────────────────────────
function ToolBtn({
  onMouseDown, title, children,
}: {
  onMouseDown: (e: React.MouseEvent) => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      title={title}
      className="p-1.5 rounded text-slate-300 hover:bg-white/10 hover:text-white transition-all text-xs font-medium select-none"
    >
      {children}
    </button>
  )
}

// ── Color Palette Dropdown ─────────────────────────────────────────────────────
function ColorPalette({
  label, onPick,
}: {
  label: string
  onPick: (color: string) => void
}) {
  return (
    <div className="bg-[#1a1a2e] border border-white/20 rounded-xl p-3 shadow-2xl w-56 absolute top-full left-0 mt-1 z-[9999]">
      <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>
      <div className="grid grid-cols-10 gap-1 mb-2">
        {COLORS.map(c => (
          <button
            key={c}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onPick(c) }}
            className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform"
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
        <label className="text-xs text-slate-400">Custom:</label>
        <input
          type="color"
          className="w-8 h-6 cursor-pointer bg-transparent border-0"
          onInput={(e) => onPick((e.target as HTMLInputElement).value)}
        />
      </div>
    </div>
  )
}

// ── Rich Text Editor ───────────────────────────────────────────────────────────
function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const [showEmojis, setShowEmojis] = useState(false)
  const [showColors, setShowColors] = useState<'text' | 'bg' | null>(null)
  const initialized = useRef(false)

  // Set initial HTML once
  useEffect(() => {
    if (!initialized.current && editorRef.current) {
      editorRef.current.innerHTML = value || ''
      initialized.current = true
    }
  }, [value])

  const emit = useCallback(() => {
    onChange(editorRef.current?.innerHTML || '')
  }, [onChange])

  const snapshotSelection = () => {
    const r = saveSelection()
    if (r) savedRangeRef.current = r
  }

  // execCommand for simple formatting
  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val ?? undefined)
    emit()
  }

  // Font size — use execCommand fontSize hack to avoid surroundContents crash
  const applyFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const px = e.target.value
    restoreSelection(savedRangeRef.current)
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    // Use execCommand fontSize=7 as a marker, then replace with actual px span
    document.execCommand('fontSize', false, '7')
    editorRef.current?.querySelectorAll('font[size="7"]').forEach((el) => {
      const span = document.createElement('span')
      span.style.fontSize = px + 'px'
      el.parentNode?.insertBefore(span, el)
      while (el.firstChild) span.appendChild(el.firstChild)
      el.parentNode?.removeChild(el)
    })
    emit()
  }

  // Font family — same marker trick
  const applyFont = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const font = e.target.value
    if (!font) return
    restoreSelection(savedRangeRef.current)
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    document.execCommand('fontSize', false, '7')
    editorRef.current?.querySelectorAll('font[size="7"]').forEach((el) => {
      const span = document.createElement('span')
      span.style.fontFamily = font
      el.parentNode?.insertBefore(span, el)
      while (el.firstChild) span.appendChild(el.firstChild)
      el.parentNode?.removeChild(el)
    })
    emit()
  }

  const applyTextColor = (color: string) => {
    restoreSelection(savedRangeRef.current)
    editorRef.current?.focus()
    document.execCommand('foreColor', false, color)
    emit()
    setShowColors(null)
  }

  const applyBgColor = (color: string) => {
    restoreSelection(savedRangeRef.current)
    editorRef.current?.focus()
    document.execCommand('hiliteColor', false, color)
    emit()
    setShowColors(null)
  }

  const insertEmoji = (emoji: string) => {
    restoreSelection(savedRangeRef.current)
    editorRef.current?.focus()
    document.execCommand('insertText', false, emoji)
    emit()
    setShowEmojis(false)
  }

  const insertLink = (e: React.MouseEvent) => {
    e.preventDefault()
    snapshotSelection()
    const url = prompt('Enter URL:')
    if (!url) return
    restoreSelection(savedRangeRef.current)
    editorRef.current?.focus()
    document.execCommand('createLink', false, url)
    emit()
  }

  const openColorPanel = (type: 'text' | 'bg', e: React.MouseEvent) => {
    e.preventDefault()
    snapshotSelection() // snapshot BEFORE dropdown opens (focus is still in editor)
    setShowColors(showColors === type ? null : type)
    setShowEmojis(false)
  }

  const openEmojiPanel = (e: React.MouseEvent) => {
    e.preventDefault()
    snapshotSelection()
    setShowEmojis(!showEmojis)
    setShowColors(null)
  }

  return (
    <div className="rounded-xl border border-white/10 overflow-visible bg-black/30">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-white/10 bg-black/20 rounded-t-xl"
      >
        <ToolBtn onMouseDown={(e) => { e.preventDefault(); exec('bold') }} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onMouseDown={(e) => { e.preventDefault(); exec('italic') }} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onMouseDown={(e) => { e.preventDefault(); exec('underline') }} title="Underline"><Underline className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onMouseDown={(e) => { e.preventDefault(); exec('strikeThrough') }} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolBtn>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <select
          onChange={applyFontSize}
          onMouseDown={snapshotSelection}
          defaultValue="16"
          className="bg-black/40 border border-white/10 text-slate-300 text-xs rounded px-1.5 py-1 outline-none focus:border-hero-violet cursor-pointer"
          title="Font Size"
        >
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
        </select>

        <select
          onChange={applyFont}
          onMouseDown={snapshotSelection}
          defaultValue=""
          className="bg-black/40 border border-white/10 text-slate-300 text-xs rounded px-1.5 py-1 outline-none focus:border-hero-violet cursor-pointer"
          title="Font Family"
        >
          {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <ToolBtn onMouseDown={(e) => { e.preventDefault(); exec('justifyLeft') }} title="Left"><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onMouseDown={(e) => { e.preventDefault(); exec('justifyCenter') }} title="Center"><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onMouseDown={(e) => { e.preventDefault(); exec('justifyRight') }} title="Right"><AlignRight className="w-3.5 h-3.5" /></ToolBtn>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <ToolBtn onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList') }} title="Bullet List"><List className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList') }} title="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></ToolBtn>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Text color */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => openColorPanel('text', e)}
            title="Text Color"
            className="p-1.5 rounded hover:bg-white/10 transition-all flex flex-col items-center gap-0.5"
          >
            <span className="text-xs font-bold text-white leading-none">A</span>
            <span className="w-4 h-1 rounded-full bg-white" />
          </button>
          {showColors === 'text' && (
            <ColorPalette label="Text Color" onPick={applyTextColor} />
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => openColorPanel('bg', e)}
            title="Highlight Color"
            className="p-1.5 rounded hover:bg-white/10 transition-all flex flex-col items-center gap-0.5"
          >
            <span className="text-xs font-bold leading-none" style={{ color: '#ffd700' }}>H</span>
            <span className="w-4 h-1 rounded-full bg-yellow-400/70" />
          </button>
          {showColors === 'bg' && (
            <ColorPalette label="Highlight Color" onPick={applyBgColor} />
          )}
        </div>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <ToolBtn onMouseDown={insertLink} title="Insert Link"><span className="text-sm">🔗</span></ToolBtn>

        {/* Emoji */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={openEmojiPanel}
            title="Insert Emoji"
            className="p-1.5 rounded hover:bg-white/10 transition-all text-base leading-none"
          >
            😀
          </button>
          {showEmojis && (
            <div className="absolute top-full left-0 mt-1 z-[9999] bg-[#1a1a2e] border border-white/20 rounded-xl p-3 shadow-2xl w-72">
              <p className="text-xs text-slate-400 mb-2 font-medium">Emojis</p>
              <div className="grid grid-cols-10 gap-1">
                {EMOJIS.map(em => (
                  <button
                    key={em}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); insertEmoji(em) }}
                    className="text-lg hover:scale-125 transition-transform hover:bg-white/10 rounded p-0.5"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <ToolBtn onMouseDown={(e) => { e.preventDefault(); exec('removeFormat') }} title="Clear Formatting">
          <span className="text-xs">✕fmt</span>
        </ToolBtn>
      </div>

      {/* Editable */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onKeyUp={snapshotSelection}
        onMouseUp={snapshotSelection}
        onClick={() => { setShowColors(null); setShowEmojis(false) }}
        className="min-h-[140px] max-h-[320px] overflow-y-auto p-4 text-slate-200 text-sm leading-relaxed outline-none"
        style={{ wordBreak: 'break-word', caretColor: '#818cf8' }}
        data-placeholder="Write your FAQ answer here... Select text then apply styles from the toolbar."
      />

      <div className="px-4 py-2 border-t border-white/5 bg-black/10 rounded-b-xl">
        <span className="text-xs text-slate-600">💡 Select text first, then click color / size / style</span>
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #334155;
          pointer-events: none;
          display: block;
        }
        [contenteditable] a { color: #818cf8; text-decoration: underline; }
        [contenteditable] ul { list-style: disc; padding-left: 1.5em; margin: 0.4em 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5em; margin: 0.4em 0; }
        [contenteditable] li { margin: 0.2em 0; }
      `}</style>
    </div>
  )
}

// ── Main AdminFAQ ──────────────────────────────────────────────────────────────
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
            <h3 className="font-bold text-lg text-white">
              {'_id' in editing && editing._id ? 'Edit FAQ' : 'New FAQ'}
            </h3>
            <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <Input
              label="Question"
              value={editing.question || ''}
              onChange={(e) => setEditing({ ...editing, question: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Answer <span className="text-xs text-hero-violet ml-1">(rich text — colors, emojis, bold, size &amp; more)</span>
              </label>
              <RichEditor
                value={editing.answer || ''}
                onChange={(html) => setEditing((prev) => prev ? { ...prev, answer: html } : prev)}
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
              <div
                className="text-sm text-slate-400 mt-1 line-clamp-2"
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
