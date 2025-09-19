import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        order_number: true,
        customer_name: true,
        total_amount: true,
        payment_status: true,
        order_status: true,
        createdAt: true
      }
    })

    return NextResponse.json(recentOrders)
  } catch (error) {
    console.error("[RECENT_ORDERS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
