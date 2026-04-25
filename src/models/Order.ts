import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId
  username: string
  minecraftUsername?: string
  items: Array<{
    productId: mongoose.Types.ObjectId
    name: string
    price: number
    quantity: number
    category: string
    commands?: string[]
  }>
  totalAmount: number
  gstAmount: number
  finalAmount: number
  paymentId?: string
  razorpayOrderId: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  delivered: boolean
  deliveredAt?: Date
  createdAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    minecraftUsername: { type: String, default: '' },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        category: { type: String, default: 'RANKS' },
        commands: [{ type: String }],
      },
    ],
    totalAmount: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    paymentId: String,
    razorpayOrderId: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    delivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
)

OrderSchema.index({ status: 1, delivered: 1 })

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
export default Order
