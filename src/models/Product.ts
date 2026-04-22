import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProduct extends Document {
  name: string
  price: number
  category: 'RANKS' | 'KEYS' | 'MONEY' | 'COINS' | 'LANDCLAIM' | 'PACKS'
  features: string[]
  description: string
  image?: string      // kept for backward compat
  images?: string[]   // multiple images
  popular?: boolean
  color?: string
  active: boolean
  createdAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['RANKS', 'KEYS', 'MONEY', 'COINS', 'LANDCLAIM', 'PACKS'],
    },
    features: [{ type: String }],
    description: { type: String, default: '' },
    image: { type: String },
    images: [{ type: String }],
    popular: { type: Boolean, default: false },
    color: { type: String, default: '#8b5cf6' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
export default Product
