import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { ApplicationSubmission } from '@/models/Application'
import { requireAuth, hasPermission } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = requireAuth(req)
    if (!hasPermission(user.role, 'STAFF')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await connectDB()

    const { status, staffNote } = await req.json()
    const submission = await ApplicationSubmission.findByIdAndUpdate(
      id, { status, staffNote }, { new: true }
    )
    if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ submission })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = requireAuth(req)
    if (!hasPermission(user.role, 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await connectDB()
    await ApplicationSubmission.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
