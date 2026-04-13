import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Product from '@/models/Product'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const filter: Record<string, unknown> = { active: true }
    if (category) filter.category = category.toUpperCase()

    const products = await Product.find(filter).sort({ createdAt: -1 })
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN', 'OWNER'])
    await connectDB()
    const body = await req.json()

    const product = await Product.create(body)
    return NextResponse.json({ product }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Product POST error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
