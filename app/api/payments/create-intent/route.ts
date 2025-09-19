import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'
import { checkoutFormSchema } from '@/lib/validations/checkout'
import { generateOrderNumber } from '@/lib/utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
})

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, ...formData } = body

    // Validate form data
    checkoutFormSchema.parse(formData)

    // Calculate total amount
    const totalAmount = items.reduce(
      (total: number, item: any) =>
        total + item.product.price_per_unit * item.quantity,
      0
    )

    // Create payment intent with PaymentElement settings
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: process.env.STRIPE_CURRENCY || 'COP',
      payment_method_types: ['card'],
      metadata: {
        checkout_type: body.payment_method,
        order_id: '', // Will be updated after order creation
      },
    })

    // Create order
    const order = await prisma.order.create({
      data: {
        order_number: generateOrderNumber(), // You need to implement this function
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_document: `${formData.document_type}${formData.document_number}`,
        delivery_option: formData.delivery_option,
        delivery_address: formData.delivery_address,
        delivery_fee: 0, // As per requirements
        requires_scheduling: false,
        payment_status: 'pending',
        order_status: 'created',
        total_amount: totalAmount,
        stripe_payment_intent_id: paymentIntent.id,
        items: {
          create: items.map((item: any) => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.product.price_per_unit,
          })),
        },
      },
    })

    // Update payment intent with order ID
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: {
        order_id: order.id,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return new NextResponse(
      'Error creating payment intent',
      { status: 500 }
    )
  }
}
