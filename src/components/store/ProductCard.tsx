'use client'
import { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
import { Button, Badge } from '@/components/ui'
import { ShoppingCart, Star, Check } from 'lucide-react'
import { CATEGORY_META, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  featured?: boolean
}

export default function ProductCard({ product, featured = false }: ProductCardProps) {
  const { addItem, items } = useCart()
  const inCart = items.some((i) => i.product._id === product._id)
  const meta = CATEGORY_META[product.category]

  return (
    <div className={cn(
      'glass glass-hover rounded-2xl overflow-hidden transition-all duration-300 flex flex-col',
      featured && 'border-hero-violet/40 shadow-glow-purple',
      product.popular && 'ring-1 ring-hero-violet/50'
    )}>
      {/* Category banner */}
      <div className={cn('h-1.5 w-full bg-gradient-to-r', meta.color)} />

      {/* Popular badge */}
      {product.popular && (
        <div className="px-5 pt-4">
          <Badge variant="warning" className="gap-1">
            <Star className="w-3 h-3 fill-current" /> Most Popular
          </Badge>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{meta.icon}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{meta.label}</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white leading-tight">{product.name}</h3>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-xl text-hero-glow">
              {formatCurrency(product.price)}
            </div>
            <div className="text-xs text-slate-500">+18% GST</div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">{product.description}</p>
        )}

        {/* Features */}
        {product.features.length > 0 && (
          <ul className="space-y-2 mb-5 flex-1">
            {product.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-hero-green mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* CTA */}
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
  )
}
