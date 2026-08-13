import { NextRequest, NextResponse } from 'next/server'
import { decrypt, SESSION_COOKIE } from '@/lib/session'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/',
  '/dashboard',
  '/invoices',
  '/customers',
  '/items',
  '/settings',
  '/setting',
  '/company-settings',
  '/onboarding',
]
// Auth routes — redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password']

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the session cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value
  const session = await decrypt(sessionToken)
  const isAuthenticated = !!(session && session.userId)

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (icons, images)
     * - API routes (auth is handled per-route in API handlers)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)',
  ],
}
