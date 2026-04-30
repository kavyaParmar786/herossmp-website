// src/app/api/plugin/deliver/route.ts
/**
 * Plugin delivery API
 *
 * GET  /api/plugin/deliver
 *   → Returns only UNDELIVERED items across all COMPLETED orders.
 *   → Each delivery object carries both orderId + itemId so the plugin
 *     can mark them individually.
 *
 * POST /api/plugin/deliver
 *   → Marks a single item as delivered (idempotent – safe to retry).
 *   → When every item in the order is delivered, also marks order.delivered=true.
 *
 * Why POST instead of PATCH?
 *   Vercel Edge / serverless sometimes drops PATCH bodies; POST is always safe.
 *   The plugin should use POST.  A PATCH alias is kept for backward-compat.
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Order from '@/models/Order'

// Force dynamic so Vercel never caches this route
export const dynamic = 'force-dynamic'

// ─── Auth helper ─────────────────────────────────────────────────────────────
function verifyPluginKey(req: NextRequest): boolean {
  const key = req.headers.get('x-plugin-key')
  return !!(key && key === process.env.PLUGIN_API_KEY)
}

// ─── GET — poll for pending deliveries ───────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!verifyPluginKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    /**
     * Find orders that:
     *  1. Payment is COMPLETED
     *  2. Order-level delivered flag is false  (at least one item still pending)
     *  3. Have a minecraftUsername set
     *
     * We project only what the plugin needs.
     */
    const orders = await Order.find({
      status:            'COMPLETED',
      delivered:         false,
      minecraftUsername: { $exists: true, $ne: '' },
    })
      .sort({ createdAt: 1 })  // oldest first → FIFO
      .limit(50)
      .lean()

    /**
     * Flatten to ONE entry per UNDELIVERED item.
     * The plugin receives itemId so it can POST back to mark exactly that item.
     */
    const deliveries = orders.flatMap((order) =>
      order.items
        .filter((item) => !item.delivered)          // ← only undelivered items
        .map((item) => ({
          orderId:          String(order._id),
          itemId:           String(item._id),        // per-item reference
          minecraftUsername: order.minecraftUsername,
          category:         item.category ?? 'RANKS',
          productName:      item.name,
          commands:         item.commands ?? [],
          quantity:         item.quantity,           // actual quantity, e.g. 1000
          purchasedAt:      order.createdAt,
        }))
    )

    return NextResponse.json({ deliveries })
  } catch (error) {
    console.error('[plugin/deliver] GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// ─── Core mark-delivered logic (shared by POST + PATCH) ──────────────────────
async function markItemDelivered(req: NextRequest) {
  if (!verifyPluginKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const body = await req.json()
    const { orderId, itemId } = body as { orderId?: string; itemId?: string }

    if (!orderId || !itemId) {
      return NextResponse.json(
        { error: 'Both orderId and itemId are required' },
        { status: 400 }
      )
    }

    /**
     * Atomically update the specific item's delivered flag.
     *
     * Using positional operator $ + arrayFilters to target the exact sub-doc.
     * This is idempotent: running it twice has no side-effect beyond the first.
     */
    const result = await Order.findOneAndUpdate(
      {
        _id:         orderId,
        'items._id': itemId,           // ensure the item belongs to this order
      },
      {
        $set: {
          'items.$[item].delivered':   true,
          'items.$[item].deliveredAt': new Date(),
        },
      },
      {
        arrayFilters: [{ 'item._id': itemId }],
        new: true,
      }
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Order or item not found' },
        { status: 404 }
      )
    }

    /**
     * Check whether ALL items are now delivered.
     * If so, flip the order-level flag in the same document (already loaded).
     */
    const allDelivered = result.items.every((item) => item.delivered)
    if (allDelivered && !result.delivered) {
      result.delivered   = true
      result.deliveredAt = new Date()
      await result.save()
    }

    return NextResponse.json({
      success:      true,
      allDelivered,
      remainingItems: result.items.filter((i) => !i.delivered).length,
    })
  } catch (error) {
    console.error('[plugin/deliver] mark error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// ─── POST (preferred) ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  return markItemDelivered(req)
}

// ─── PATCH (backward-compat alias) ───────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  return markItemDelivered(req)
}
