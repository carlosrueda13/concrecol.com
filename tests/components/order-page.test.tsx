import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import OrderPage from '@/app/admin/pedidos/[id]/page'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

// Mock the dependencies
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/app/admin/pedidos/[id]/status-form', () => ({
  OrderStatusForm: () => <div data-testid="order-status-form">Order Status Form</div>,
}))

describe('OrderPage', () => {
  const mockOrder = {
    id: '123',
    order_number: 'ORD-001',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '1234567890',
    customer_document: 'DOC123',
    delivery_address: 'Test Address',
    delivery_fee: 5000,
    requires_scheduling: true,
    payment_status: 'paid',
    order_status: 'processing',
    total_amount: 150000,
    createdAt: new Date('2025-09-02T10:00:00Z'),
    items: [
      {
        id: 'item1',
        quantity: 2,
        unit_price: 50000,
        product: {
          name: 'Concrete Mix',
          unit_measure: 'M3',
        },
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders order details correctly', async () => {
    ;(prisma.order.findUnique as any).mockResolvedValueOnce(mockOrder)

    const page = await OrderPage({ params: { id: '123' } })
    render(page)

    // Check basic order information
    expect(screen.getByText(`Pedido #${mockOrder.order_number}`)).toBeInTheDocument()

    // Check customer information
    expect(screen.getByText(mockOrder.customer_name)).toBeInTheDocument()
    expect(screen.getByText(mockOrder.customer_email)).toBeInTheDocument()
    expect(screen.getByText(`Tel: ${mockOrder.customer_phone}`)).toBeInTheDocument()
    expect(screen.getByText(`Doc: ${mockOrder.customer_document}`)).toBeInTheDocument()

    // Check delivery information
    expect(screen.getByText('Dirección de envío')).toBeInTheDocument()
    expect(screen.getByText(mockOrder.delivery_address)).toBeInTheDocument()

    // Check status badges
    const processingBadge = screen.getByText('En Proceso')
    const paidBadge = screen.getByText('Pagado')
    const schedulingBadge = screen.getByText('Sí')

    expect(processingBadge).toBeInTheDocument()
    expect(paidBadge).toBeInTheDocument()
    expect(schedulingBadge).toBeInTheDocument()

    // Check order items
    expect(screen.getByText(mockOrder.items[0].product.name)).toBeInTheDocument()
    expect(screen.getByText(`Cantidad: ${mockOrder.items[0].quantity} ${mockOrder.items[0].product.unit_measure}`)).toBeInTheDocument()

    // Check status form is rendered
    expect(screen.getByTestId('order-status-form')).toBeInTheDocument()
  })

  it('calls notFound when order is not found', async () => {
    ;(prisma.order.findUnique as any).mockResolvedValueOnce(null)

    try {
      await OrderPage({ params: { id: '123' } })
    } catch (error) {
      // Ignore the error since we expect it to throw when accessing null
    }

    expect(notFound).toHaveBeenCalled()
  })
})
