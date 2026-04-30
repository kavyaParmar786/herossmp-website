export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Order from '@/models/Order'

function verifyPluginKey(req: NextRequest): boolean {
  const key = req.headers.get('x-plugin-key')
  return !!(key && key === process.env.PLUGIN_API_KEY)
}

// GET — Minecraft plugin polls this every 30s for undelivered orders
export async function GET(req: NextRequest) {
  if (!verifyPluginKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const orders = await Order.find({
      status: 'COMPLETED',
      delivered: false,
      minecraftUsername: { $exists: true, $ne: '' },
    })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean()

    // Flatten to one delivery entry per item (plugin processes item-by-item)
    const deliveries = orders.flatMap((order) =>
      order.items.map((item) => ({
        orderId: String(order._id),
        minecraftUsername: order.minecraftUsername,
        category: item.category || 'RANKS',
        productName: item.name,
        commands: item.commands || [],
        quantity: item.quantity,
        purchasedAt: order.createdAt,
      }))
    )

    return NextResponse.json({ deliveries })
  } catch (error) {
    console.error('[plugin/deliver] GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
// PATCH
export async function PATCH(req: NextRequest) {
  return handleDelivery(req)
}

export async function POST(req: NextRequest) {
  return handleDelivery(req)
}

async function handleDelivery(req: NextRequest) {
  if (!verifyPluginKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    const { orderId } = await req.json()

    const order = await Order.findByIdAndUpdate(
      orderId,
      { delivered: true, deliveredAt: new Date() },
      { new: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
