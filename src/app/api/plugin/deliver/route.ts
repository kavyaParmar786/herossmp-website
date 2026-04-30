export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Order from '@/models/Order'

// 🔐 Verify plugin key
function verifyPluginKey(req: NextRequest): boolean {
  const key = req.headers.get('x-plugin-key')
  return !!(key && key === process.env.PLUGIN_API_KEY)
}

// 🟢 GET — Plugin polls for undelivered items
export async function GET(req: NextRequest) {
  if (!verifyPluginKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const orders = await Order.find({
      status: 'COMPLETED',
      minecraftUsername: { $exists: true, $ne: '' },
    })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean()

    // ✅ ONLY send items that are NOT delivered
    const deliveries = orders.flatMap((order) =>
      order.items
        .filter((item: any) => !item.delivered)
        .map((item: any) => ({
          orderId: String(order._id),
          itemId: String(item._id), // 🔥 important
          minecraftUsername: order.minecraftUsername,
          category: item.category || 'RANKS',
          productName: item.name,
          commands: item.commands || [],
          amount: item.quantity,
          purchasedAt: order.createdAt,
        }))
    )

    return NextResponse.json({ deliveries })
  } catch (error) {
    console.error('[plugin/deliver] GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// 🟡 PATCH (plugin marks item delivered)
export async function PATCH(req: NextRequest) {
  return handleDelivery(req)
}

// 🟡 POST fallback (important for Vercel issues)
export async function POST(req: NextRequest) {
  return handleDelivery(req)
}

// 🔧 Handle delivery marking
async function handleDelivery(req: NextRequest) {
  if (!verifyPluginKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const { orderId, itemId } = await req.json()

    if (!orderId || !itemId) {
      return NextResponse.json(
        { error: 'Missing orderId or itemId' },
        { status: 400 }
      )
    }

    // ✅ Mark ONLY that specific item as delivered
    const result = await Order.updateOne(
      { _id: orderId, 'items._id': itemId },
      {
        $set: {
          'items.$.delivered': true,
        },
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[plugin/deliver] PATCH error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
