# 🔧 PLAN DE REMEDIACIÓN DETALLADO - Concrecol Production Readiness

## 📋 INSTRUCCIONES PASO A PASO PARA RESOLVER PROBLEMAS CRÍTICOS

### 🚨 PRIORIDAD 1: PROBLEMAS CRÍTICOS (RESOLVER INMEDIATAMENTE)

---

## 1. 🛒 CARRITO DE COMPRAS NO FUNCIONAL - CRÍTICO

### **Instrucciones de Solución**

#### **Paso 1: Corregir el flujo de datos en AddToCartButton**
```typescript
// Archivo: /components/add-to-cart-button.tsx
// REEMPLAZAR el componente completo con:

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-provider'
import { useToast } from '@/components/ui/use-toast'

interface AddToCartButtonProps {
  productId: string
  quantity: number
  disabled?: boolean
}

export function AddToCartButton({ productId, quantity, disabled }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      if (isNaN(quantity) || quantity <= 0) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Por favor ingresa una cantidad válida'
        })
        return
      }

      await addToCart(productId, quantity)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo agregar el producto al carrito'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || loading}
      className="w-full"
    >
      {loading ? 'Agregando...' : 'Agregar al Carrito'}
    </Button>
  )
}
```

#### **Paso 2: Corregir CartProvider**
```typescript
// Archivo: /contexts/cart-provider.tsx
// AGREGAR después de línea 65 (función performOperation):

const addToCart = async (productId: string, quantity: number) => {
  try {
    await performOperation({
      operation: 'add',
      productId,
      quantity,
    })
    
    // Refrescar el carrito después de agregar
    await fetchCart()
    
    toast({
      title: 'Producto agregado',
      description: 'El producto se ha agregado al carrito exitosamente',
    })
  } catch (error) {
    console.error('Error in addToCart:', error)
    throw error
  }
}
```

#### **Paso 3: Validar API del carrito**
```typescript
// Archivo: /app/api/cart/route.ts
// REEMPLAZAR el schema de validación (línea 9):

const cartOperationSchema = z.object({
  operation: z.enum(['add', 'update', 'remove']),
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().positive('Quantity must be positive').optional(),
}).refine((data) => {
  if (data.operation !== 'remove' && !data.quantity) {
    throw new Error('Quantity is required for add/update operations')
  }
  return true
})
```

---

## 2. 🔐 SEGURIDAD CRÍTICA - Rate Limiting y Autenticación

### **Instrucciones de Solución**

#### **Paso 1: Mejorar Rate Limiting Global**
```typescript
// Archivo: /middleware.ts
// REEMPLAZAR función middleware completa:

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
  
  if (isAdminPath && !isLoginPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', path)

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
```

#### **Paso 2: Mejorar configuración de sesión**
```typescript
// Archivo: /app/api/auth/options.ts
// REEMPLAZAR configuración de sesión (líneas 11-14):

session: {
  strategy: 'jwt',
  maxAge: 24 * 60 * 60, // 24 horas en lugar de 30 días
  updateAge: 60 * 60, // Actualizar cada hora
},
```

#### **Paso 3: Agregar verificación de rol en APIs admin**
```typescript
// Crear archivo: /lib/auth-utils.ts

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'

export async function requireAdminAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error('Unauthorized - No session')
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: session.user.email as string },
  })

  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized - Invalid role')
  }

  return { session, admin }
}

// APLICAR en todas las APIs admin:
// Ejemplo en /app/api/admin/audit/route.ts:
export async function POST(request: Request) {
  try {
    const { admin } = await requireAdminAuth() // ✅ Usar nueva función
    
    const json = await request.json()
    const body = auditLogSchema.parse(json)

    const log = await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: body.action,
        entity: body.entity,
        entityId: body.entityId,
        details: body.details,
      },
    })

    return NextResponse.json(log)
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    console.error('[AUDIT_LOG]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
```

---

## 3. 🛡️ VALIDACIÓN Y SANITIZACIÓN DE DATOS

### **Instrucciones de Solución**

#### **Paso 1: Mejorar validación de URLs de imagen**
```typescript
// Archivo: /app/api/images/upload/route.ts
// REEMPLAZAR desde línea 30:

const imageUrlSchema = z.string()
  .url('URL inválida')
  .refine(
    (url) => {
      // Validar que sea una URL de imagen
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
      const urlPath = new URL(url).pathname.toLowerCase()
      return imageExtensions.some(ext => urlPath.endsWith(ext))
    },
    'La URL debe ser una imagen válida'
  )
  .refine(
    (url) => {
      // Validar dominios permitidos
      const allowedDomains = ['res.cloudinary.com', 'images.unsplash.com', 'githubusercontent.com']
      const domain = new URL(url).hostname
      return allowedDomains.some(allowed => domain.includes(allowed))
    },
    'Dominio no permitido'
  )

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminAuth() // ✅ Usar nueva función de auth
    
    const { imageUrl } = await req.json()
    
    // ✅ Validar URL con schema
    const validatedUrl = imageUrlSchema.parse(imageUrl)
    
    // Record image upload in audit log
    await prisma.auditLog.create({
      data: {
        action: 'IMAGE_UPLOAD',
        entity: 'IMAGE',
        entityId: Math.random().toString(36).substring(7),
        adminId: session.admin.id,
        details: {
          message: `Image uploaded: ${validatedUrl}`,
          imageUrl: validatedUrl
        },
      },
    })

    return NextResponse.json({ 
      success: true, 
      imageUrl: validatedUrl 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    // ... resto del manejo de errores
  }
}
```

#### **Paso 2: Mejorar validación del carrito**
```typescript
// Archivo: /app/api/cart/route.ts
// REEMPLAZAR schema de validación:

const cartOperationSchema = z.object({
  operation: z.enum(['add', 'update', 'remove']),
  productId: z.string().uuid('ID de producto inválido'), // ✅ Validar UUID
  quantity: z.number()
    .positive('La cantidad debe ser positiva')
    .max(1000, 'Cantidad máxima excedida')
    .optional(),
}).refine((data) => {
  if ((data.operation === 'add' || data.operation === 'update') && !data.quantity) {
    throw new Error('Quantity is required for add/update operations')
  }
  return true
}, 'Quantity validation failed')
```

---

## 4. 📱 CONFIGURACIÓN DE DEPLOYMENT

### **Instrucciones de Solución**

#### **Paso 1: Resolver configuración de Next.js**
```javascript
// Archivo: /next.config.js
// REEMPLAZAR configuración completa:

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Eliminar output: 'export' para funcionalidad completa del servidor
  basePath: process.env.NODE_ENV === 'production' ? '/concrecol.com' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/concrecol.com' : '',
  
  experimental: {
    serverActions: true
  },
  
  // ✅ Headers de seguridad mejorados
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  images: {
    unoptimized: true,
    domains: [
      'res.cloudinary.com',
      'images.unsplash.com',
      'githubusercontent.com',
      'concrecol.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
        pathname: '/**',
      }
    ],
  }
}

module.exports = nextConfig
```

#### **Paso 2: Crear archivo de validación de variables de entorno**
```typescript
// Crear archivo: /lib/env-validation.ts

import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Auth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  ADMIN_DEFAULT_EMAIL: z.string().email('ADMIN_DEFAULT_EMAIL must be valid email'),
  ADMIN_DEFAULT_PASSWORD: z.string().min(8, 'ADMIN_DEFAULT_PASSWORD must be at least 8 characters'),
  
  // Stripe (optional for development)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Redis (optional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
})

// Validar variables de entorno al startup
export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment variables:')
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`)
      })
    }
    process.exit(1)
  }
}

// AGREGAR al inicio de /app/layout.tsx:
// import { validateEnv } from '@/lib/env-validation'
// validateEnv() // ✅ Validar env vars al inicio
```

---

## ⚠️ PRIORIDAD 2: PROBLEMAS DE ALTO IMPACTO

### 5. 📊 IMPLEMENTAR HEALTH CHECKS

#### **Instrucciones de Solución**
```typescript
// Crear archivo: /app/api/health/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        database: 'connected',
        server: 'running'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    }, { status: 503 })
  }
}

// Crear archivo: /app/api/ready/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if admin user exists (app is properly seeded)
    const adminExists = await prisma.adminUser.findFirst()
    
    if (!adminExists) {
      throw new Error('Admin user not found - app not ready')
    }
    
    return NextResponse.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 })
  }
}
```

### 6. 📝 IMPLEMENTAR LOGGING ESTRUCTURADO

#### **Instrucciones de Solución**
```typescript
// Crear archivo: /lib/logger.ts

import { NextRequest } from 'next/server'

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogContext {
  userId?: string
  adminId?: string
  requestId?: string
  path?: string
  method?: string
  [key: string]: any
}

class Logger {
  private formatLog(level: LogLevel, message: string, context?: LogContext) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || {},
      env: process.env.NODE_ENV
    })
  }

  error(message: string, context?: LogContext) {
    console.error(this.formatLog(LogLevel.ERROR, message, context))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatLog(LogLevel.WARN, message, context))
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatLog(LogLevel.INFO, message, context))
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatLog(LogLevel.DEBUG, message, context))
    }
  }
}

export const logger = new Logger()

// REEMPLAZAR todos los console.log en el código:
// console.log('Updated cart data:', updatedCartData)
// ↓
// logger.info('Cart updated successfully', { cartData: updatedCartData })
```

### 7. 🔒 IMPLEMENTAR POLÍTICAS DE PRIVACIDAD BÁSICAS

#### **Instrucciones de Solución**
```typescript
// Crear archivo: /app/api/consent/route.ts

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'

const consentSchema = z.object({
  necessary: z.boolean().default(true),
  analytics: z.boolean().default(false),
  marketing: z.boolean().default(false)
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const consent = consentSchema.parse(body)
    
    // Store consent in cookie
    cookies().set('user-consent', JSON.stringify(consent), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/'
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid consent data' },
      { status: 400 }
    )
  }
}

export async function GET() {
  const consentCookie = cookies().get('user-consent')
  
  if (!consentCookie) {
    return NextResponse.json({
      necessary: true,
      analytics: false,
      marketing: false
    })
  }
  
  return NextResponse.json(JSON.parse(consentCookie.value))
}

// Crear componente: /components/consent-banner.tsx

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  
  useEffect(() => {
    // Check if consent has been given
    const checkConsent = async () => {
      try {
        const response = await fetch('/api/consent')
        const consent = await response.json()
        // Show banner if no explicit consent has been given
        if (!consent.analytics && !consent.marketing) {
          setShowBanner(true)
        }
      } catch (error) {
        setShowBanner(true) // Show banner on error
      }
    }
    
    checkConsent()
  }, [])
  
  const handleAcceptAll = async () => {
    await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: true
      })
    })
    setShowBanner(false)
  }
  
  const handleAcceptNecessary = async () => {
    await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false
      })
    })
    setShowBanner(false)
  }
  
  if (!showBanner) return null
  
  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 p-4 bg-white border shadow-lg">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">
          Utilizamos cookies para mejorar tu experiencia. Las cookies necesarias están habilitadas por defecto.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={handleAcceptAll}>
            Aceptar Todo
          </Button>
          <Button size="sm" variant="outline" onClick={handleAcceptNecessary}>
            Solo Necesarias
          </Button>
        </div>
      </div>
    </Card>
  )
}

// AGREGAR al layout principal:
// import { ConsentBanner } from '@/components/consent-banner'
// <ConsentBanner />
```

---

## 📊 PRIORIDAD 3: MEJORAS DE PERFORMANCE Y UX

### 8. ⚡ OPTIMIZAR QUERIES DE BASE DE DATOS

#### **Instrucciones de Solución**
```typescript
// Ejemplo: Optimizar carga de productos en /app/productos/page.tsx

// ANTES (N+1 query):
const products = await prisma.product.findMany({
  where: { is_active: true },
  include: {
    sqlCategory: true // ❌ Carga individualmente cada categoría
  }
})

// DESPUÉS (Query optimizada):
const products = await prisma.product.findMany({
  where: { is_active: true },
  select: { // ✅ Solo seleccionar campos necesarios
    id: true,
    name: true,
    slug: true,
    price_per_unit: true,
    unit_measure: true,
    stock_quantity: true,
    requires_scheduling: true,
    images: true,
    sqlCategory: {
      select: {
        id: true,
        name: true,
        slug: true
      }
    }
  },
  orderBy: { createdAt: 'desc' }
})
```

### 9. 🖼️ MIGRAR A NEXT.JS IMAGE

#### **Instrucciones de Solución**
```typescript
// Crear componente wrapper: /components/ui/optimized-image.tsx

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
}

export function OptimizedImage({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  className = '', 
  fill = false,
  priority = false 
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  
  const fallbackSrc = '/images/placeholder.jpg' // Crear imagen placeholder
  
  if (imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Imagen no disponible</span>
      </div>
    )
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      priority={priority}
      onError={() => setImageError(true)}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  )
}

// REEMPLAZAR todas las etiquetas <img> con <OptimizedImage>
```

---

## 🧪 TESTING Y MONITOREO

### 10. 📋 IMPLEMENTAR TESTS BÁSICOS

#### **Instrucciones de Solución**
```typescript
// Crear archivo: /tests/api/cart.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/cart/route'

describe('/api/cart', () => {
  beforeEach(() => {
    // Setup test database or mocks
  })

  afterEach(() => {
    // Cleanup
  })

  it('should add item to cart with valid data', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        operation: 'add',
        productId: 'test-product-id',
        quantity: 2
      }
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('items')
  })

  it('should reject invalid quantity', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        operation: 'add',
        productId: 'test-product-id',
        quantity: -1 // Invalid quantity
      }
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })
})

// Configurar script en package.json:
// "test": "vitest run",
// "test:watch": "vitest"
```

### 11. 📊 IMPLEMENTAR MONITOREO BÁSICO

#### **Instrucciones de Solución**
```typescript
// Crear archivo: /lib/metrics.ts

interface Metric {
  name: string
  value: number
  timestamp: Date
  tags?: Record<string, string>
}

class MetricsCollector {
  private metrics: Metric[] = []
  
  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      timestamp: new Date(),
      tags
    })
    
    // En producción, enviar a servicio de monitoreo
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService({ name, value, tags })
    }
  }
  
  private sendToMonitoringService(metric: Omit<Metric, 'timestamp'>) {
    // Implementar integración con servicio de monitoreo
    console.log('Metric recorded:', metric)
  }
  
  // Métricas de negocio
  recordOrderCreated(orderValue: number) {
    this.recordMetric('orders.created', 1, { value: orderValue.toString() })
  }
  
  recordCartAddition(productId: string) {
    this.recordMetric('cart.item_added', 1, { productId })
  }
  
  recordError(error: string, path: string) {
    this.recordMetric('errors.count', 1, { error, path })
  }
}

export const metrics = new MetricsCollector()

// USAR en APIs importantes:
// metrics.recordOrderCreated(order.total_amount)
// metrics.recordCartAddition(productId)
```

---

## 📚 DOCUMENTACIÓN FINAL

### 12. 📖 CREAR DOCUMENTACIÓN DE OPERACIONES

#### **Crear archivo: /OPERATIONS.md**
```markdown
# Guía de Operaciones - Concrecol

## 🚀 Deployment

### Variables de Entorno Requeridas
- `DATABASE_URL`: Conexión a PostgreSQL
- `NEXTAUTH_SECRET`: Clave secreta para JWT (min 32 caracteres)
- `NEXTAUTH_URL`: URL de la aplicación
- `ADMIN_DEFAULT_EMAIL`: Email del administrador
- `ADMIN_DEFAULT_PASSWORD`: Contraseña del administrador

### Comandos de Deployment
```bash
npm run build          # Compilar aplicación
npm run start         # Iniciar en producción
npm run seed          # Poblar base de datos inicial
```

## 📊 Monitoreo

### Health Checks
- `/api/health` - Estado general del sistema
- `/api/ready` - Sistema listo para recibir tráfico

### Métricas Importantes
- Tiempo de respuesta de APIs
- Errores de carrito de compras
- Órdenes creadas
- Fallos de autenticación

## 🔧 Troubleshooting

### Problemas Comunes
1. **Carrito no funciona**: Verificar conexión a base de datos
2. **Login admin falla**: Verificar NEXTAUTH_SECRET
3. **Imágenes no cargan**: Verificar configuración de dominios

### Logs Importantes
- Errores de validación: Buscar "ZodError"
- Problemas de auth: Buscar "Unauthorized"
- Errores de DB: Buscar "Prisma"
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Antes de Producción:
- [ ] Carrito de compras funciona correctamente
- [ ] Rate limiting implementado
- [ ] Validación de datos mejorada
- [ ] Variables de entorno validadas
- [ ] Health checks funcionando
- [ ] Logging estructurado implementado
- [ ] Políticas de privacidad básicas
- [ ] Tests básicos pasando
- [ ] Documentación actualizada

### Día 1 de Producción:
- [ ] Monitorear health checks cada 5 minutos
- [ ] Revisar logs de errores cada hora
- [ ] Verificar funcionalidad de carrito
- [ ] Monitorear performance de base de datos
- [ ] Backup de base de datos programado

---

## 🆘 CONTACTOS DE EMERGENCIA

- **Developer Lead**: [Tu contacto]
- **DevOps**: [Contacto de infraestructura]
- **Database Admin**: [Contacto de DB]

## 📞 ESCALACIÓN

1. **Carrito no funciona**: Prioridad 1 - Resolver en 30 minutos
2. **Login admin falla**: Prioridad 1 - Resolver en 15 minutos  
3. **Base de datos caída**: Prioridad 0 - Resolución inmediata
4. **Performance degradada**: Prioridad 2 - Resolver en 2 horas

---

**⚠️ IMPORTANTE**: Este documento debe actualizarse después de cada cambio crítico en el sistema.