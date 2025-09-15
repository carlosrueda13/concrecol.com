import { prisma } from '@/lib/prisma'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { columns } from '@/app/admin/clientes/columns'

export default async function CustomersPage() {
  const customers = await prisma.order.findMany({
    select: {
      customer_email: true,
      customer_name: true,
      customer_phone: true,
      customer_document: true,
      _count: {
        select: {
          items: true,
        },
      },
      created_by_admin: true,
      createdAt: true,
    },
    distinct: ['customer_email'],
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Transform orders into customer records
  const customerRecords = customers.map(order => ({
    id: order.customer_email,
    email: order.customer_email,
    name: order.customer_name,
    phone: order.customer_phone,
    document: order.customer_document,
    orderCount: order._count.items,
    isAdmin: order.created_by_admin,
    lastOrder: order.createdAt,
  }))

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>
      <DataTable columns={columns} data={customerRecords} searchKey="email" />
    </div>
  )
}
