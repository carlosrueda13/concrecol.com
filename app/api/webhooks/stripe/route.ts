import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'
import { createAuditLog } from '@/lib/audit'
import { sendOrderConfirmationEmail } from '@/lib/emails'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
})

const prisma = new PrismaClient()

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return new NextResponse('Webhook Error', { status: 400 })
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const orderId = paymentIntent.metadata.order_id

  if (!orderId) {
    console.error('No order ID in payment intent metadata')
    return new NextResponse('Invalid order ID', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(orderId)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(orderId)
        break
    }

    return new NextResponse('Success', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new NextResponse('Webhook processing failed', {
      status: 500,
    })
  }
}

async function handlePaymentSuccess(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      payment_status: 'paid',
      order_status: 'processing',
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  // Update product stock
  await Promise.all(
    order.items.map(async (item) => {
      await prisma.product.update({
        where: { id: item.product_id },
        data: {
          stock_quantity: {
            decrement: item.quantity,
          },
        },
      })
    })
  )

  // Create audit log
  await createAuditLog({
    action: 'order_paid',
    entity: 'Order',
    entityId: orderId,
    details: {
      orderId,
      paymentMethod: 'stripe',
      total: order.total_amount,
    },
  })

  // Send confirmation email
  await sendOrderConfirmationEmail(order)

  // TODO: Generate and attach SIIGO invoice
  // TODO: Send WhatsApp notification if required
}

async function handlePaymentFailure(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      payment_status: 'failed',
    },
  })

  // Create audit log
  await createAuditLog({
    action: 'payment_failed',
    entity: 'Order',
    entityId: orderId,
    details: {
      orderId,
      paymentMethod: 'stripe',
    },
  })

  // TODO: Send payment failure notification email
}
