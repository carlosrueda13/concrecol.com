import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getRateLimiter } from './lib/rate-limiter'

// Define rutas que necesitan rate limiting
const RATE_LIMITED_PATHS = [
  '/api/auth',
  '/api/orders',
  '/api/cart',
  '/api/quotes',
  '/admin/login'
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const response = NextResponse.next()

  // Security headers mejorados
  const headers = response.headers
  headers.set('X-DNS-Prefetch-Control', 'on')
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  headers.set('X-Frame-Options', 'SAMEORIGIN') // Cambiado de DENY
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('X-XSS-Protection', '1; mode=block')
  
  // Rate limiting mejorado
  const shouldRateLimit = RATE_LIMITED_PATHS.some(p => path.startsWith(p))
  
  if (shouldRateLimit) {
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const limiter = await getRateLimiter()
    const { success, limit, reset, remaining } = await limiter.limit(ip)
    
    if (!success) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        }
      })
    }
  }

  // Admin auth protection
  const isAdminPath = path.startsWith('/admin')
  const isLoginPath = path === '/admin/login'

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
  matcher: [
    '/admin/:path*',
    '/api/auth/:path*',
    '/api/orders/:path*',
    '/api/cart/:path*',
    '/api/quotes/:path*'
  ]
}
