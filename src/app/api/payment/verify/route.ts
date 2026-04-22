import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/db'
import Order from '@/models/Order'
import { requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)
    await connectDB()

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = await req.json()

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      await Order.findByIdAndUpdate(dbOrderId, { status: 'FAILED' })
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // Update order to completed
    const order = await Order.findByIdAndUpdate(
      dbOrderId,
      { status: 'COMPLETED', paymentId: razorpay_payment_id },
      { new: true }
    )

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Verify payment error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
