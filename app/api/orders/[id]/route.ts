import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface OrderParams {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: OrderParams) {
  try {
    const { id } = params
    
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Error fetching order' }, { status: 500 })
  }
}
