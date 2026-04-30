// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Order from '@/models/Order'
import { requireRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'  // ← fix: prevents static rendering error

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN', 'OWNER'])
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page      = Math.max(1, parseInt(searchParams.get('page')  || '1'))
    const limit     = Math.min(50, parseInt(searchParams.get('limit') || '20'))
    const status    = searchParams.get('status')
    const search    = searchParams.get('search')
    const delivered = searchParams.get('delivered')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {}
    if (status) filter.status = status
    if (delivered === 'true')  filter.delivered = true
    if (delivered === 'false') filter.delivered = false
    if (search) {
      filter.$or = [
        { username:          { $regex: search, $options: 'i' } },
        { minecraftUsername: { $regex: search, $options: 'i' } },
        { paymentId:         { $regex: search, $options: 'i' } },
      ]
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ])

    return NextResponse.json({
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error: unknown) {
    if (error instanceof Error && ['Unauthorized', 'Forbidden'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[orders] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
