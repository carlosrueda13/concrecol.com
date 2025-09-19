'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/options'
import { orderSchema, type OrderFormData } from '@/lib/validations/order'
import { createAuditLog } from '@/lib/audit'

const prisma = new PrismaClient()

export async function createOrder(data: OrderFormData) {
  const session = await getServerSession(authOptions)

  try {
    // Validate data
    const validatedData = orderSchema.parse(data)

    // Generate order number (YYYY-MM-XXXXXX format)
    const orderCount = await prisma.order.count()
    const orderNumber = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${(orderCount + 1).toString().padStart(6, '0')}`

    // Calculate total amount
    const total_amount = validatedData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price), 
      0
    )

    // Create order
    const order = await prisma.order.create({
      data: {
        ...validatedData,
        order_number: orderNumber,
        created_by_admin: !!session,
        total_amount,
        items: {
          create: validatedData.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Update product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.product_id },
        data: {
          stock_quantity: {
            decrement: item.quantity
          }
        }
      })
    }

    // Log action if admin
    if (session) {
      await createAuditLog({
        adminId: session.user.id,
        action: 'order_create',
        entity: 'Order',
        entityId: order.id,
        details: validatedData
      })
    }

    revalidatePath('/admin/pedidos')
    return { success: true, order }
  } catch (error) {
    console.error('Error creating order:', error)
    return { success: false, error: 'Error al crear el pedido' }
  }
}

export async function updateOrderStatus(
  id: string,
  status: string,
  deliveryDate?: Date | null,
  timeSlot?: string | null
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error('No autorizado')
  }

  try {
    // Validate status
    if (!['created', 'scheduled', 'processing', 'ready', 'completed', 'canceled'].includes(status)) {
      throw new Error('Estado inválido')
    }

    const updateData: any = { order_status: status }
    if (deliveryDate) updateData.delivery_date = deliveryDate
    if (timeSlot) updateData.delivery_time_slot = timeSlot

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Log action
    await createAuditLog({
      adminId: session.user.id,
      action: 'order_status_change',
      entity: 'Order',
      entityId: order.id,
      details: { status, deliveryDate, timeSlot }
    })

    revalidatePath('/admin/pedidos')
    return { success: true, order }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Error al actualizar el estado del pedido' }
  }
}

export async function getOrdersByDateRange(startDate: Date, endDate: Date) {
  return prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      requires_scheduling: true
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getAvailableTimeSlots(date: Date) {
  // Definir slots de tiempo disponibles (8am a 5pm, cada hora)
  const slots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ]

  // Obtener pedidos programados para esa fecha
  const orders = await prisma.order.findMany({
    where: {
      delivery_date: date,
      order_status: {
        not: 'canceled'
      }
    },
    select: {
      delivery_time_slot: true
    }
  })

  // Filtrar slots ocupados
  const takenSlots = orders.map(order => order.delivery_time_slot)
  return slots.filter(slot => !takenSlots.includes(slot))
}
