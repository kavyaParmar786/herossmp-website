'use client'
import { useState } from 'react'
import { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
import { Button, Badge } from '@/components/ui'
import { ShoppingCart, Star, Check, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { CATEGORY_META, formatCurrency, cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  featured?: boolean
}

// ── Image Lightbox ─────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }: {
  images: string[]
  startIndex: number
  onClose: () => void
}) {
  const [current, setCurrent] = useState(startIndex)

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length)
  const next = () => setCurrent(i => (i + 1) % images.length)

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full glass rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Main image */}
        <div className="relative aspect-video bg-black/40 flex items-center justify-center">
          <img
            src={images[current]}
            alt={`Image ${current + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 py-3 bg-black/20">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i === current ? 'bg-hero-violet w-4' : 'bg-white/30 hover:bg-white/50'
                  )}
                />
              ))}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 p-3 overflow-x-auto bg-black/20">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all',
                    i === current ? 'border-hero-violet' : 'border-white/10 hover:border-white/30'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Product Card ───────────────────────────────────────────────────────────────
export default function ProductCard({ product, featured = false }: ProductCardProps) {
  const { addItem, items } = useCart()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const inCart = items.some((i) => i.product._id === product._id)
  const meta = CATEGORY_META[product.category]

  // Merge image + images array, deduplicate
  const allImages: string[] = []
  if (product.image) allImages.push(product.image)
  if (product.images?.length) {
    product.images.forEach(img => { if (!allImages.includes(img)) allImages.push(img) })
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      {lightboxOpen && allImages.length > 0 && (
        <Lightbox
          images={allImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className={cn(
        'glass glass-hover rounded-2xl overflow-hidden transition-all duration-300 flex flex-col',
        featured && 'border-hero-violet/40 shadow-glow-purple',
        product.popular && 'ring-1 ring-hero-violet/50'
      )}>
        {/* Category colour bar */}
        <div className={cn('h-1.5 w-full bg-gradient-to-r', meta.color)} />

        {/* Image gallery preview */}
        {allImages.length > 0 ? (
          <div
            className="relative cursor-pointer group overflow-hidden"
            style={{ height: '160px' }}
            onClick={() => openLightbox(0)}
          >
            <img
              src={allImages[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex items-center gap-2 text-white text-sm font-semibold">
                <ZoomIn className="w-4 h-4" />
                View {allImages.length > 1 ? `${allImages.length} images` : 'image'}
              </div>
            </div>
            {/* Image count badge */}
            {allImages.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm">
                1 / {allImages.length}
              </div>
            )}
          </div>
        ) : (
          /* Placeholder when no image */
          <div className={cn(
            'h-28 flex items-center justify-center text-5xl bg-gradient-to-br opacity-40',
            meta.color
          )}>
            {meta.icon}
          </div>
        )}

        {/* Thumbnail strip for multiple images */}
        {allImages.length > 1 && (
          <div className="flex gap-1.5 px-3 pt-2 overflow-x-auto scrollbar-hide">
            {allImages.slice(1).map((img, i) => (
              <button
                key={i}
                onClick={() => openLightbox(i + 1)}
                className="flex-shrink-0 w-12 h-9 rounded-md overflow-hidden border border-white/10 hover:border-hero-violet/50 transition-colors"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Popular badge */}
        {product.popular && (
          <div className="px-5 pt-3">
            <Badge variant="warning" className="gap-1">
              <Star className="w-3 h-3 fill-current" /> Most Popular
            </Badge>
          </div>
        )}

        <div className="p-5 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{meta.icon}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{meta.label}</span>
              </div>
              <h3 className="font-display font-bold text-lg text-white leading-tight">{product.name}</h3>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="font-display font-bold text-xl text-hero-glow">
                {formatCurrency(product.price)}
              </div>
              <div className="text-xs text-slate-500">+18% GST</div>
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">{product.description}</p>
          )}

          {product.features.length > 0 && (
            <ul className="space-y-1.5 mb-5 flex-1">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-hero-green mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}

          <Button
            onClick={() => addItem(product)}
            variant={inCart ? 'secondary' : 'primary'}
            className="w-full mt-auto"
          >
            <ShoppingCart className="w-4 h-4" />
            {inCart ? 'Add Another' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </>
  )
}
