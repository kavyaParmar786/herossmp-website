import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import connectDB from '@/lib/db'
import Order from '@/models/Order'
import { requireAuth } from '@/lib/auth'
import { calculateGST } from '@/lib/utils'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)
    await connectDB()

    const { items } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    )

    const { gst, total } = calculateGST(totalAmount)

    // Amount in paise
    const amountInPaise = Math.round(total * 100)

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        userId: user.userId,
        username: user.username,
      },
    })

    // Save pending order
    const order = await Order.create({
      userId: user.userId,
      username: user.username,
      items: items.map((item: { productId: string; name: string; price: number; quantity: number }) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
      })),
      totalAmount,
      gstAmount: gst,
      finalAmount: total,
      razorpayOrderId: razorpayOrder.id,
      status: 'PENDING',
    })

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      dbOrderId: order._id,
      breakdown: { subtotal: totalAmount, gst, total },
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
