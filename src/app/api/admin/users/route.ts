import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN', 'OWNER'])
    await connectDB()

    const users = await User.find().select('-password').sort({ createdAt: -1 })
    return NextResponse.json({ users })
  } catch (error: unknown) {
    if (error instanceof Error && ['Unauthorized', 'Forbidden'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = requireRole(req, ['ADMIN', 'OWNER'])
    await connectDB()

    const { userId, role } = await req.json()

    const validRoles = ['USER', 'STAFF', 'ADMIN', 'OWNER']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Only OWNER can assign OWNER/ADMIN roles
    if (['OWNER', 'ADMIN'].includes(role) && currentUser.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can assign admin roles' }, { status: 403 })
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password')
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({ user })
  } catch (error: unknown) {
    if (error instanceof Error && ['Unauthorized', 'Forbidden'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
