import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reason } = await request.json()

    if (!reason) {
      return new NextResponse('Cancellation reason is required', { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!order) {
      return new NextResponse('Order not found', { status: 404 })
    }

    // Log the cancellation
    await prisma.auditLog.create({
      data: {
        adminId: 'system', // You might want to get the actual admin ID from the session
        action: 'cancel',
        entity: 'order',
        entityId: params.id,
        details: {
          reason,
          previousStatus: order.order_status,
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ORDER_CANCELLATION]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
