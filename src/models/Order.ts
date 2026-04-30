// src/models/Order.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

// ─── Sub-document: one line-item inside an order ────────────────────────────
export interface IOrderItem {
  _id: mongoose.Types.ObjectId   // auto-generated; used as itemId in plugin calls
  productId: mongoose.Types.ObjectId
  name: string
  price: number                  // unit price (INR)
  quantity: number               // e.g. 1000 for "1000 Claim Blocks" — set by frontend
  category: string               // RANKS | CLAIM_BLOCKS | KITS | etc.
  commands: string[]             // commands already interpolated with {player} placeholder
  delivered: boolean             // per-item delivery flag — THE key addition
  deliveredAt?: Date
}

// ─── Top-level order ────────────────────────────────────────────────────────
export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId
  username: string
  minecraftUsername: string
  items: IOrderItem[]
  totalAmount: number
  gstAmount: number
  finalAmount: number
  paymentId?: string
  razorpayOrderId: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  /** true only when EVERY item.delivered === true  (computed / updated by deliver route) */
  delivered: boolean
  deliveredAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ─────────────────────────────────────────────────────────────────
const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name:      { type: String, required: true },
    price:     { type: Number, required: true },
    /**
     * quantity must come from the cart/product, NOT be parsed from the product
     * name string.  E.g. "1000 Claim Blocks" → quantity: 1000, set by the
     * frontend when the user adds it to cart.
     */
    quantity:  { type: Number, required: true, min: 1 },
    category:  { type: String, default: 'RANKS' },
    commands:  [{ type: String }],
    delivered:   { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  { _id: true }   // keep per-item _id so the plugin can reference itemId
)

const OrderSchema = new Schema<IOrder>(
  {
    userId:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username:          { type: String, required: true },
    minecraftUsername: { type: String, default: '' },
    items:             [OrderItemSchema],
    totalAmount:       { type: Number, required: true },
    gstAmount:         { type: Number, required: true },
    finalAmount:       { type: Number, required: true },
    paymentId:         String,
    razorpayOrderId:   { type: String, required: true },
    status: {
      type:    String,
      enum:    ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    delivered:   { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
)

// Compound index covering the plugin's primary query
OrderSchema.index({ status: 1, delivered: 1, minecraftUsername: 1 })

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)

export default Order
