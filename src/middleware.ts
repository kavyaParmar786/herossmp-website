import { NextRequest, NextResponse } from 'next/server'

// Pages that require authentication
const PROTECTED = ['/dashboard', '/tickets', '/cart', '/admin']

// Pages only for guests (redirect logged-in users away)
const GUEST_ONLY = ['/login', '/register']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('auth-token')?.value

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isGuestOnly = GUEST_ONLY.some(p => pathname.startsWith(p))

  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/tickets/:path*', '/cart/:path*', '/admin/:path*', '/login', '/register'],
}
