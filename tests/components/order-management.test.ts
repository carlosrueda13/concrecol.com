import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { createOrder, updateOrderStatus, getOrdersByDateRange, getAvailableTimeSlots } from '@/app/actions/order'
import { UnitMeasure } from '@prisma/client'

// Mock de NextAuth
vi.mock('next-auth', () => {
  return {
    default: vi.fn(),
    getServerSession: vi.fn(() => ({
      user: {
        id: 'test-admin-id',
        email: 'admin@test.com',
        role: 'admin'
      }
    }))
  }
})

// Mock de Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

describe('Order Management', () => {
  let testCategoryId: string
  let testProductId: string
  let testOrderId: string

  beforeAll(async () => {
    // Crear categoría y producto de prueba
    const category = await prisma.sqlCategory.create({
      data: {
        name: 'Test Category',
        slug: 'test-category'
      }
    })
    testCategoryId = category.id

    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product',
        price_per_unit: 100000,
        unit_measure: UnitMeasure.M3,
        stock_quantity: 100,
        requires_scheduling: true,
        images: [],
        sqlCategoryId: testCategoryId
      }
    })
    testProductId = product.id
  })

  afterAll(async () => {
    // Limpieza
    await prisma.orderItem.deleteMany({
      where: {
        product_id: testProductId
      }
    })
    await prisma.order.deleteMany({
      where: {
        customer_email: 'test@example.com'
      }
    })
    await prisma.product.delete({
      where: {
        id: testProductId
      }
    })
    await prisma.sqlCategory.delete({
      where: {
        id: testCategoryId
      }
    })
  })

  it('should create a new order', async () => {
    const orderData = {
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '1234567890',
      customer_document: 'CC123456789',
      delivery_option: 'pickup' as const,
      payment_status: 'pending' as const,
      order_status: 'created' as const,
      items: [
        {
          product_id: testProductId,
          product_name: 'Test Product',
          quantity: 10,
          unit_price: 100000,
          total: 1000000
        }
      ],
      requires_scheduling: false
    }

    const result = await createOrder(orderData)
    expect(result.success).toBe(true)
    expect(result.order).toBeDefined()
    expect(result.order?.customer_name).toBe(orderData.customer_name)
    expect(result.order?.total_amount).toBe(1000000) // 10 * 100000

    if (result.order) {
      testOrderId = result.order.id
    }

    // Verificar que el stock se actualizó
    const updatedProduct = await prisma.product.findUnique({
      where: { id: testProductId }
    })
    expect(updatedProduct?.stock_quantity).toBe(90) // 100 - 10
  })

  it('should update order status', async () => {
    const deliveryDate = new Date()
    const timeSlot = '10:00'

    const result = await updateOrderStatus(
      testOrderId,
      'scheduled',
      deliveryDate,
      timeSlot
    )

    expect(result.success).toBe(true)
    expect(result.order).toBeDefined()
    expect(result.order?.order_status).toBe('scheduled')
    expect(result.order?.delivery_date).toEqual(deliveryDate)
    expect(result.order?.delivery_time_slot).toBe(timeSlot)
  })

  it('should get orders by date range', async () => {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7)

    const orders = await getOrdersByDateRange(startDate, endDate)
    expect(Array.isArray(orders)).toBe(true)
    // No asumimos que hay órdenes, solo verificamos el formato
    if (orders.length > 0) {
      expect(orders[0]).toHaveProperty('id')
      expect(orders[0]).toHaveProperty('delivery_date')
    }
  })

  it('should get available time slots', async () => {
    const date = new Date()
    const slots = await getAvailableTimeSlots(date)
    
    expect(Array.isArray(slots)).toBe(true)
    expect(slots.length).toBeGreaterThan(0)
    expect(slots[0]).toMatch(/^\d{2}:\d{2}$/)
  })

  it('should validate order data', async () => {
    const invalidOrderData = {
      customer_name: '', // Nombre vacío
      customer_email: 'invalid-email', // Email inválido
      customer_phone: '123', // Teléfono muy corto
      customer_document: '12', // Documento muy corto
      delivery_option: 'pickup' as const,
      items: [], // Sin items
      requires_scheduling: false,
      payment_status: 'pending' as const,
      order_status: 'created' as const
    }

    const result = await createOrder(invalidOrderData)
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should handle scheduling conflicts', async () => {
    const orderData = {
      customer_name: 'Test Customer 2',
      customer_email: 'test2@example.com',
      customer_phone: '1234567890',
      customer_document: 'CC987654321',
      delivery_option: 'delivery' as const,
      delivery_address: 'Test Address',
      requires_scheduling: true,
      delivery_date: new Date(),
      delivery_time_slot: '10:00', // Mismo horario que el pedido anterior
      items: [
        {
          product_id: testProductId,
          product_name: 'Test Product',
          quantity: 5,
          unit_price: 100000,
          total: 500000
        }
      ],
      payment_status: 'pending' as const,
      order_status: 'created' as const
    }

    const result = await createOrder(orderData)
    expect(result.success).toBe(false)
    expect(result.error).toContain('horario no disponible')
  })
})
