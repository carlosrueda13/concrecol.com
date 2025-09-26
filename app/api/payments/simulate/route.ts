import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ✅ Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')
    const token = searchParams.get('token')
    
    if (!orderId || !token) {
      return new NextResponse('Missing orderId or token', { status: 400 })
    }

    // Verify this is the right order with the correct token
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        payment_link_token: token,
      },
    })

    if (!order) {
      return new NextResponse('Order not found or token invalid', { status: 404 })
    }

    if (order.payment_status !== 'pending') {
      return new NextResponse('Order is not in pending payment status', { status: 400 })
    }

    // Update order to paid status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        payment_status: 'paid',
        // If the order was in 'created' status, move it to 'confirmed'
        ...(order.order_status === 'created' && { order_status: 'confirmed' }),
      },
    })

    // Log the payment
    await prisma.auditLog.create({
      data: {
        adminId: 'customer', // Payment made by customer
        action: 'payment',
        entity: 'order',
        entityId: orderId,
        details: {
          paymentMethod: 'link',
          amount: order.total_amount,
        }
      }
    })

    // Redirect back to the payment page to show success
    return NextResponse.redirect(new URL(`/pagos/${token}`, request.url))
  } catch (error) {
    console.error('[PAYMENT_SIMULATION]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
