'use client'
import { useEffect, useState } from 'react'
import { Product } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { Button, Input, Select, Textarea, Card, Badge } from '@/components/ui'
import { CATEGORY_META, formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyProduct: Partial<Product> = {
  name: '', price: 0, category: 'RANKS' as Product['category'], description: '',
  features: [''], popular: false, color: '#8b5cf6',
}

export default function AdminProducts() {
  const { token } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data.products || [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing) return
    if (!editing.name?.trim() || !editing.price) {
      toast.error('Name and price are required')
      return
    }
    setLoading(true)
    try {
      const isNew = !('_id' in editing) || !editing._id
      const url = isNew ? '/api/products' : `/api/products/${editing._id}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...editing, features: editing.features?.filter(Boolean) }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(isNew ? 'Product created!' : 'Product updated!')
      setEditing(null)
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Product deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const updateFeature = (i: number, val: string) => {
    const features = [...(editing?.features || [])]
    features[i] = val
    setEditing({ ...editing!, features })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-white">Products</h2>
        <Button onClick={() => setEditing({ ...emptyProduct, features: [''] })}>
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Edit form */}
      {editing && (
        <Card className="mb-8 border-hero-violet/30">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-lg text-white">{'_id' in editing && editing._id ? 'Edit Product' : 'New Product'}</h3>
            <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Name" value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Hero Rank" />
            <Input label="Price (₹)" type="number" value={editing.price || ''} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) })} />
            <Select
              label="Category"
              value={editing.category || 'RANKS'}
              onChange={(e) => setEditing({ ...editing, category: e.target.value as Product['category'] })}
              options={Object.entries(CATEGORY_META).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <Input label="Color (hex)" value={editing.color || '#8b5cf6'} onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
            <div className="sm:col-span-2">
              <Textarea label="Description" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Features</label>
              <div className="space-y-2">
                {(editing.features || ['']).map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={f}
                      onChange={(e) => updateFeature(i, e.target.value)}
                      className="flex-1 glass rounded-lg px-3 py-2 text-sm text-white bg-transparent border border-white/10 focus:border-hero-violet/60 focus:outline-none"
                      placeholder={`Feature ${i + 1}`}
                    />
                    <button onClick={() => {
                      const features = editing.features?.filter((_, j) => j !== i) || []
                      setEditing({ ...editing, features: features.length ? features : [''] })
                    }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={() => setEditing({ ...editing, features: [...(editing.features || []), ''] })}
                  className="text-sm text-hero-glow hover:text-hero-violet transition-colors">
                  + Add Feature
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="popular" checked={editing.popular || false}
                onChange={(e) => setEditing({ ...editing, popular: e.target.checked })}
                className="w-4 h-4 accent-hero-violet" />
              <label htmlFor="popular" className="text-sm text-slate-300">Mark as Popular</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button loading={loading} onClick={save}>Save Product</Button>
          </div>
        </Card>
      )}

      {/* Product list */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product) => {
          const meta = CATEGORY_META[product.category]
          return (
            <Card key={product._id} className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{meta.icon}</span>
                    <Badge variant="default">{meta.label}</Badge>
                    {product.popular && <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />}
                  </div>
                  <h3 className="font-bold text-white">{product.name}</h3>
                </div>
                <span className="font-display font-bold text-hero-glow">{formatCurrency(product.price)}</span>
              </div>
              <div className="flex gap-2 mt-auto pt-3 border-t border-white/5">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setEditing({ ...product })}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => deleteProduct(product._id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
