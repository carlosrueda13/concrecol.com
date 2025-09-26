import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth-utils'

const auditLogSchema = z.object({
  action: z.string(),
  entity: z.string(),
  entityId: z.string().optional(),
  details: z.any().optional(),
})

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
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    console.error('[AUDIT_LOG]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
