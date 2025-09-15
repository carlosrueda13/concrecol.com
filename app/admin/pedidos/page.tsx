import { prisma } from '@/lib/prisma'
import { columns } from './columns'
import { OrdersTable } from '@/components/orders-table'

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
      </div>

      <OrdersTable data={orders} columns={columns} />
    </div>
  )
}
