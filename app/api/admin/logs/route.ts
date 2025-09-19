import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const entity = searchParams.get('entity')
    const entityId = searchParams.get('entityId')
    
    if (!entity) {
      return new NextResponse('Entity parameter is required', { status: 400 })
    }

    const filters = {
      entity: entity,
      ...(entityId ? { entityId } : {}),
    }

    const logs = await prisma.auditLog.findMany({
      where: filters,
      orderBy: {
        createdAt: 'desc'
      },
      take: 50, // Limit to recent 50 logs
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('[AUDIT_LOGS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
