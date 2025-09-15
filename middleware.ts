import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getRateLimiter } from './lib/rate-limiter'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const response = NextResponse.next()

  // Security headers
  const headers = response.headers
  headers.set('X-DNS-Prefetch-Control', 'on')
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  
  // Define admin paths that need protection
  const isAdminPath = path.startsWith('/admin')
  const isLoginPath = path === '/admin/login'

  // Rate limiting for login attempts
  if (isLoginPath && request.method === 'POST') {
    const ip = request.ip ?? '127.0.0.1'
    const limiter = await getRateLimiter()
    const { success } = await limiter.limit(ip)
    
    if (!success) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }

  // Add pathname to headers for use in admin layout
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', path)

  if (!isAdminPath) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Allow access to login page if not authenticated
  if (!token && isLoginPath) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Redirect to login if trying to access admin pages without auth
  if (!token && isAdminPath) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Redirect to admin dashboard if accessing login while authenticated
  if (token && isLoginPath) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/admin/:path*']
}
