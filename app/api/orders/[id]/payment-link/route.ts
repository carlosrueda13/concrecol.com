import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the order to check its status
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!order) {
      return new NextResponse('Order not found', { status: 404 })
    }

    if (order.payment_status !== 'pending') {
      return new NextResponse('Order is not in pending payment status', { status: 400 })
    }

    // Generate a unique payment token
    const paymentToken = nanoid(16)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const paymentLink = `${baseUrl}/pagos/${paymentToken}`

    // Update the order with the payment token
    await prisma.order.update({
      where: { id: params.id },
      data: {
        payment_link_token: paymentToken,
      },
    })

    // Log the payment link generation
    await prisma.auditLog.create({
      data: {
        adminId: 'system', // You might want to get the actual admin ID from the session
        action: 'generate_payment_link',
        entity: 'order',
        entityId: params.id,
        details: {
          paymentToken,
          paymentLink,
        }
      }
    })

    return NextResponse.json({ paymentLink })
  } catch (error) {
    console.error('[PAYMENT_LINK_GENERATION]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
