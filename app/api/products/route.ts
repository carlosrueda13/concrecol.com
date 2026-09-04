import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeString } from '@/lib/sanitization'

// ✅ Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

const VALID_LINEAS = ['CONCRETO', 'AGREGADOS', 'CONSTRUCTORA', 'PREFABRICADOS'] as const
type ValidLinea = (typeof VALID_LINEAS)[number]

function isLineaNegocio(value: string | null): value is ValidLinea {
  return value !== null && (VALID_LINEAS as readonly string[]).includes(value)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active') === 'true'
    const linea = searchParams.get('linea')

    const where: { is_active?: boolean; lineaNegocio?: ValidLinea } = {}
    if (active) {
      where.is_active = true
    }
    if (isLineaNegocio(linea)) {
      where.lineaNegocio = linea
    }

    const products = await prisma.product.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
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
