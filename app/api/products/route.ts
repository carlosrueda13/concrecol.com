import { NextRequest, NextResponse } from 'next/server'
import { safeQuery } from '@/lib/db-wrapper'
import { sanitizeString } from '@/lib/sanitization'

// ✅ Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active') === 'true'

    const products = await safeQuery(async (prisma) => {
      return await prisma.product.findMany({
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
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('[PRODUCTS]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
