import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { ApplicationSubmission } from '@/models/Application'
import { requireAuth, hasPermission } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)
    await connectDB()
    const { searchParams } = new URL(req.url)
    const formId = searchParams.get('formId')

    if (hasPermission(user.role, 'STAFF')) {
      const query = formId ? { formId } : {}
      const submissions = await ApplicationSubmission.find(query).sort({ createdAt: -1 })
      return NextResponse.json({ submissions })
    }

    // User sees their own
    const query = formId ? { formId, userId: user.userId } : { userId: user.userId }
    const submissions = await ApplicationSubmission.find(query).sort({ createdAt: -1 })
    return NextResponse.json({ submissions })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}
