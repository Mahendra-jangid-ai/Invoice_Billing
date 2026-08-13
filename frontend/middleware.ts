import { NextRequest, NextResponse } from 'next/server'
import { decrypt, SESSION_COOKIE } from '@/lib/session'

const AUTH_PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password']

const SKIP_AUTH_PATHS = ['/manifest.webmanifest']

function isAuthPublicRoute(pathname: string): boolean {
  return AUTH_PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

function shouldSkipAuth(pathname: string): boolean {
  if (pathname.startsWith('/api/')) return true
  return SKIP_AUTH_PATHS.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function requiresAuthentication(pathname: string): boolean {
  if (shouldSkipAuth(pathname)) return false
  if (isAuthPublicRoute(pathname)) return false
  return true
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!requiresAuthentication(pathname)) {
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value
    const session = await decrypt(sessionToken)
    const isAuthenticated = !!(session && session.userId)

    if (isAuthenticated && isAuthPublicRoute(pathname)) {
      const destination = session.emailVerified ? '/dashboard' : '/verify-email'
      return NextResponse.redirect(new URL(destination, request.url))
    }

    return NextResponse.next()
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value
  const session = await decrypt(sessionToken)
  const isAuthenticated = !!(session && session.userId)

  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const emailVerified = session!.emailVerified

  if (!emailVerified && pathname !== '/verify-email') {
    return NextResponse.redirect(new URL('/verify-email', request.url))
  }

  if (emailVerified && pathname === '/verify-email') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)',
  ],
}
