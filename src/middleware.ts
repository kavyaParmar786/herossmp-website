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
  // ⚠️ IMPORTANT: Do NOT include /api/* paths here.
  // API routes handle auth via Bearer token in headers — not cookies.
  // If /api/admin/* is matched here, PUT/POST requests get redirected to /login
  // (a GET-only page), which causes "405 Method Not Allowed" on Vercel.
  matcher: [
    '/dashboard/:path*',
    '/tickets/:path*',
    '/cart/:path*',
    '/admin',
    '/admin/((?!_next|api).+)', // /admin pages only, NOT /api/admin/*
    '/login',
    '/register',
  ],
}
