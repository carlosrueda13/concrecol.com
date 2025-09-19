import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()

    if (!status) {
      return new NextResponse('Status is required', { status: 400 })
    }

    const allowedStatuses = ['created', 'confirmed', 'scheduled', 'completed', 'cancelled']
    if (!allowedStatuses.includes(status)) {
      return new NextResponse(`Invalid status: ${status}. Allowed statuses are: ${allowedStatuses.join(', ')}`, { status: 400 })
    }

    const order = await prisma.order.update({
      where: {
        id: params.id
      },
      data: {
        order_status: status
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Log the status change
    await prisma.auditLog.create({
      data: {
        adminId: 'system', // You might want to get the actual admin ID from the session
        action: 'update',
        entity: 'order',
        entityId: params.id,
        details: {
          oldStatus: order.order_status,
          newStatus: status,
        }
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('[ORDER_STATUS_UPDATE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
