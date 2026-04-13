import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { FAQ } from '@/models/index'
import { requireRole } from '@/lib/auth'

export async function GET() {
  try {
    await connectDB()
    const faqs = await FAQ.find().sort({ order: 1, _id: 1 })
    return NextResponse.json({ faqs })
  } catch (error) {
    console.error('FAQ GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN', 'OWNER'])
    await connectDB()

    const body = await req.json()
    const faq = await FAQ.create(body)
    return NextResponse.json({ faq }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && ['Unauthorized', 'Forbidden'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN', 'OWNER'])
    await connectDB()

    const { id, ...body } = await req.json()
    const faq = await FAQ.findByIdAndUpdate(id, body, { new: true })
    if (!faq) return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })

    return NextResponse.json({ faq })
  } catch (error: unknown) {
    if (error instanceof Error && ['Unauthorized', 'Forbidden'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN', 'OWNER'])
    await connectDB()

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await FAQ.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error && ['Unauthorized', 'Forbidden'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 })
  }
}
