import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface JWTPayload {
  userId: string
  username: string
  email: string
  role: 'USER' | 'STAFF' | 'ADMIN' | 'OWNER'
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  const cookie = req.cookies.get('auth-token')
  return cookie?.value || null
}

export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}

export function requireAuth(req: NextRequest): JWTPayload {
  const user = getUserFromRequest(req)
  if (!user) throw new Error('Unauthorized')
  return user
}

export function requireRole(req: NextRequest, roles: string[]): JWTPayload {
  const user = requireAuth(req)
  if (!roles.includes(user.role)) throw new Error('Forbidden')
  return user
}

export const ROLE_HIERARCHY = {
  USER: 0,
  STAFF: 1,
  ADMIN: 2,
  OWNER: 3,
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  return (ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0) >=
    (ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] || 0)
}
