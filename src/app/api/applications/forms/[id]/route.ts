import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { ApplicationForm } from '@/models/Application'
import { requireAuth, hasPermission } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectDB()
    const form = await ApplicationForm.findById(id)
    if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ form })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = requireAuth(req)
    if (!hasPermission(user.role, 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await connectDB()
    const body = await req.json()
    const form = await ApplicationForm.findByIdAndUpdate(id, body, { new: true })
    if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ form })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = requireAuth(req)
    if (!hasPermission(user.role, 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await connectDB()
    await ApplicationForm.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 })
  }
}
