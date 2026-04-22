'use client'
import { useState, useRef } from 'react'
import { Upload, X, ChevronLeft, ChevronRight, Loader2, Check, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface FileUploaderProps {
  onUpload: (url: string) => void
  label?: string
  className?: string
  value?: string
}

export function FileUploader({ onUpload, label, className, value }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) uploadFile(e.dataTransfer.files[0])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) uploadFile(e.target.files[0])
  }

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setPreview(data.url)
      onUpload(data.url)
      toast.success('Image uploaded!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const clear = () => {
    setPreview(null)
    onUpload('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="block text-sm font-semibold text-slate-300 mb-1">{label}</label>}

      <div className="rounded-2xl overflow-hidden" style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Top action bar */}
        <div className="flex items-center justify-between px-4 py-3 gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              boxShadow: '0 4px 15px rgba(79,70,229,0.4)',
            }}
          >
            {uploading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Upload className="w-4 h-4" />
            }
            {uploading ? 'Uploading…' : 'Upload Files'}
          </button>

          <button
            type="button"
            onClick={clear}
            disabled={!preview && !uploading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-30"
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5',
            }}
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !preview && inputRef.current?.click()}
          className={cn(
            'relative mx-3 my-3 rounded-xl transition-all duration-200 overflow-hidden',
            !preview && 'cursor-pointer',
            dragActive && 'scale-[0.99]',
          )}
          style={{
            minHeight: '160px',
            border: dragActive
              ? '2px dashed rgba(124,58,237,0.7)'
              : preview
              ? '2px dashed rgba(255,255,255,0.06)'
              : '2px dashed rgba(99,102,241,0.35)',
            background: dragActive ? 'rgba(124,58,237,0.08)' : 'transparent',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={uploading}
          />

          {/* Decorative nav arrows */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 p-1 z-10" style={{ color: 'rgba(239,68,68,0.4)' }}>
            <ChevronLeft className="w-5 h-5" />
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1 z-10" style={{ color: 'rgba(239,68,68,0.4)' }}>
            <ChevronRight className="w-5 h-5" />
          </div>

          {uploading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-hero-violet animate-spin" />
              <span className="text-sm text-slate-400 font-medium">Uploading image…</span>
            </div>
          ) : preview ? (
            <div className="relative group w-full min-h-[160px]">
              <img
                src={preview}
                alt="Preview"
                className="w-full object-contain rounded-xl"
                style={{ minHeight: '160px', maxHeight: '240px' }}
              />
              <div
                className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}
              >
                <Check className="w-3 h-3" /> Uploaded
              </div>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-xl"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white"
                  style={{ background: 'rgba(79,70,229,0.8)', border: '1px solid rgba(124,58,237,0.5)' }}
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); clear() }}
                  className="px-4 py-2 rounded-lg text-sm font-bold"
                  style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-8">
              <p className="text-sm font-semibold" style={{ color: 'rgba(99,102,241,0.8)' }}>
                Drop Your Files Here
              </p>
              <p className="text-xs text-slate-600">PNG, JPG, WEBP · Max 5MB</p>
            </div>
          )}
        </div>

        {/* Browse button at bottom */}
        {!preview && (
          <div className="flex justify-center pb-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-40"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
              }}
            >
              <Download className="w-4 h-4" />
              Browse Files
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
