import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/options'

const auditLogSchema = z.object({
  action: z.string(),
  entity: z.string(),
  entityId: z.string().optional(),
  details: z.any().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await request.json()
    const body = auditLogSchema.parse(json)

    const admin = await prisma.adminUser.findUnique({
      where: { email: session.user.email as string },
    })

    if (!admin) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

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
    console.error('[AUDIT_LOG]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
