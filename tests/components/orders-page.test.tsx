import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import OrdersPage from '@/app/admin/pedidos/page'
import { prisma } from '@/lib/prisma'

// Mock the dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
    },
  },
}))

// Mock the data table
vi.mock('@/components/orders-table', () => ({
  OrdersTable: ({ data }: any) => (
    <div data-testid="orders-table">
      {data.map((order: any) => (
        <div key={order.id} data-testid="order-row">
          {order.order_number}
        </div>
      ))}
    </div>
  ),
}))

describe('OrdersPage', () => {
  const mockOrders = [
    {
      id: '1',
      order_number: 'ORD-001',
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      payment_status: 'paid',
      order_status: 'completed',
      total_amount: 100000,
      createdAt: new Date('2025-09-02T10:00:00Z'),
      items: [],
    },
    {
      id: '2',
      order_number: 'ORD-002',
      customer_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      payment_status: 'pending',
      order_status: 'processing',
      total_amount: 150000,
      createdAt: new Date('2025-09-02T11:00:00Z'),
      items: [],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders orders page with table', async () => {
    ;(prisma.order.findMany as any).mockResolvedValueOnce(mockOrders)

    const page = await OrdersPage()
    render(page)

    // Check page title
    expect(screen.getByText('Pedidos')).toBeInTheDocument()

    // Check orders table is rendered
    expect(screen.getByTestId('orders-table')).toBeInTheDocument()

    // Check order rows are rendered
    const orderRows = screen.getAllByTestId('order-row')
    expect(orderRows).toHaveLength(2)
    expect(orderRows[0]).toHaveTextContent('ORD-001')
    expect(orderRows[1]).toHaveTextContent('ORD-002')
  })

  it('renders empty orders table when no orders exist', async () => {
    ;(prisma.order.findMany as any).mockResolvedValueOnce([])

    const page = await OrdersPage()
    render(page)

    expect(screen.getByTestId('orders-table')).toBeInTheDocument()
    expect(screen.queryAllByTestId('order-row')).toHaveLength(0)
  })
})
