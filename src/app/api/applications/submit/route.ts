import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { ApplicationForm, ApplicationSubmission } from '@/models/Application'
import { requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)
    await connectDB()

    const { formId, answers } = await req.json()
    if (!formId) return NextResponse.json({ error: 'Form ID required' }, { status: 400 })

    const form = await ApplicationForm.findById(formId)
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    if (!form.isOpen) return NextResponse.json({ error: 'Applications are closed' }, { status: 400 })

    // Check duplicate
    const existing = await ApplicationSubmission.findOne({ formId, userId: user.userId })
    if (existing) return NextResponse.json({ error: 'You have already applied for this position' }, { status: 400 })

    // Validate required questions
    for (const q of form.questions) {
      if (q.required) {
        const ans = answers?.find((a: { questionId: string }) => a.questionId === q._id.toString())
        if (!ans?.answer?.trim()) {
          return NextResponse.json({ error: `"${q.label}" is required` }, { status: 400 })
        }
      }
    }

    const submission = await ApplicationSubmission.create({
      formId: form._id,
      formTitle: form.title,
      userId: user.userId,
      username: user.username,
      answers: answers || [],
      status: 'PENDING',
    })

    return NextResponse.json({ submission }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('Submit error:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
