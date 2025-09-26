import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeInput } from '@/lib/sanitization'

// ✅ Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active') === 'true'

    const products = await prisma.product.findMany({
      where: active ? { is_active: true } : undefined,
      orderBy: [
        { sqlCategory: { name: 'asc' } },
        { name: 'asc' }
      ],
      include: {
        sqlCategory: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('[PRODUCTS]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
