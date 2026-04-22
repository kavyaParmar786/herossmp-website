'use client'
import { useState, useRef } from 'react'
import { Upload, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './index'
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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0])
    }
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
      // Mock upload for now, or actual API call if implemented
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

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
      {label && <label className="block text-sm font-semibold text-slate-300 mb-2">{label}</label>}
      
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative group cursor-pointer transition-all duration-200 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[160px] overflow-hidden',
          dragActive 
            ? 'border-hero-violet bg-hero-violet/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]' 
            : 'border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20',
          preview && 'border-none'
        )}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-hero-glow animate-spin" />
            <span className="text-sm text-slate-400">Uploading...</span>
          </div>
        ) : preview ? (
          <div className="relative w-full h-full min-h-[160px]">
            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                Change
              </Button>
              <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); clear(); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-hero-violet/20 group-hover:scale-110 transition-all duration-300">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-hero-glow" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Drop your image here</p>
              <p className="text-xs text-slate-500 mt-1">or click to browse files</p>
            </div>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-2">PNG, JPG, WEBP (Max 5MB)</p>
          </div>
        )}
      </div>
    </div>
  )
}
