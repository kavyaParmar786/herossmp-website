// src/app/api/payment/create-order/route.ts
/**
 * Create Razorpay order + persist DB order.
 *
 * KEY FIX: quantity is taken directly from the cart item sent by the frontend.
 * The frontend must pass the correct numeric quantity (e.g. 1000 for
 * "1000 Claim Blocks") — never parse it out of the product name string.
 */

import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import connectDB from '@/lib/db'
import Order from '@/models/Order'
import { requireAuth } from '@/lib/auth'
import { calculateGST } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function getRazorpay() {
  const keyId     = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured.')
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

// ─── Cart item shape the frontend must send ──────────────────────────────────
interface CartItem {
  productId: string
  name:      string
  price:     number   // unit price in INR
  /**
   * quantity = the actual deliverable amount.
   * For "1000 Claim Blocks" this should be 1000.
   * For a rank ("VIP") this is 1.
   * The frontend/product catalogue is the source of truth — never parse name.
   */
  quantity:  number
  category:  string   // RANKS | CLAIM_BLOCKS | KITS | …
  commands:  string[] // e.g. ["/givecb {player} 1000"]
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)
    await connectDB()

    const { items, minecraftUsername } = (await req.json()) as {
      items:             CartItem[]
      minecraftUsername: string
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!minecraftUsername?.trim()) {
      return NextResponse.json(
        { error: 'Minecraft username is required' },
        { status: 400 }
      )
    }

    // Validate items have required fields
    for (const item of items) {
      if (!item.productId || !item.name || item.price == null || !item.quantity) {
        return NextResponse.json(
          { error: `Invalid item: ${item.name ?? 'unknown'}` },
          { status: 400 }
        )
      }
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * (item.quantity > 0 ? 1 : 1), // price is per-purchase, quantity is deliverable amount
      0
    )
    // NOTE: totalAmount = sum of unit prices (you charge once per product,
    // regardless of deliverable quantity like claim blocks).
    // Adjust the line above if your pricing model is different.

    const { gst, total } = calculateGST(totalAmount)
    const amountInPaise  = Math.round(total * 100)

    const razorpay      = getRazorpay()
    const razorpayOrder = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: 'INR',
      receipt:  `order_${Date.now()}`,
      notes:    { userId: user.userId, username: user.username },
    })

    const order = await Order.create({
      userId:            user.userId,
      username:          user.username,
      minecraftUsername: minecraftUsername.trim(),
      items: items.map((item) => ({
        productId:   item.productId,
        name:        item.name,
        price:       item.price,
        quantity:    item.quantity,    // ← stored as-is from product catalogue
        category:    item.category ?? 'RANKS',
        commands:    item.commands ?? [],
        delivered:   false,           // per-item flag starts false
        deliveredAt: undefined,
      })),
      totalAmount,
      gstAmount:       gst,
      finalAmount:     total,
      razorpayOrderId: razorpayOrder.id,
      status:          'PENDING',
      delivered:       false,
    })

    return NextResponse.json({
      orderId:   razorpayOrder.id,
      amount:    amountInPaise,
      currency:  'INR',
      dbOrderId: order._id,
      breakdown: { subtotal: totalAmount, gst, total },
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[create-order] error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
