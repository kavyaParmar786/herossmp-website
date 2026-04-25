import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { ApplicationForm } from '@/models/Application'
import { requireAuth, hasPermission } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const adminMode = searchParams.get('admin') === 'true'

    if (adminMode) {
      const user = requireAuth(req)
      if (!hasPermission(user.role, 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const forms = await ApplicationForm.find().sort({ createdAt: -1 })
      return NextResponse.json({ forms })
    }

    // Public: fetch a single form by slug (includes questions)
    const slug = searchParams.get('slug')
    if (slug) {
      const form = await ApplicationForm.findOne({ slug, isOpen: true })
      if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json({ form })
    }

    // Public: only open forms (list view, no questions)
    const forms = await ApplicationForm.find({ isOpen: true }).select('-questions').sort({ createdAt: -1 })
    return NextResponse.json({ forms })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)
    if (!hasPermission(user.role, 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await connectDB()

    const body = await req.json()
    const { title, description, slug, role, questions, isOpen } = body

    if (!title || !slug) return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })

    const form = await ApplicationForm.create({
      title, description, slug, role, questions: questions || [], isOpen: isOpen ?? true,
      createdBy: user.username,
    })
    return NextResponse.json({ form }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if ((error as { code?: number }).code === 11000) return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    console.error('Create form error:', error)
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
  }
}
