import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId
  username: string
  items: Array<{
    productId: mongoose.Types.ObjectId
    name: string
    price: number
    quantity: number
  }>
  totalAmount: number
  gstAmount: number
  finalAmount: number
  paymentId?: string
  razorpayOrderId: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
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
  },
  { timestamps: true }
)

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
export default Order
