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

    const allowedStatuses = ['pending', 'processing', 'completed', 'cancelled']
    if (!allowedStatuses.includes(status)) {
      return new NextResponse('Invalid status', { status: 400 })
    }

    const order = await prisma.order.update({
      where: {
        id: params.id
      },
      data: {
        order_status: status
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('[ORDER_STATUS_UPDATE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
