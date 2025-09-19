import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { columns } from './columns'
import { prisma } from '@/lib/prisma'

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Órdenes</h2>
          <p className="text-muted-foreground">
            Gestión de órdenes y estados
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/ordenes/nueva">Nueva Orden</Link>
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={orders}
        searchKey="customer_name"
        searchPlaceholder="Buscar por cliente..."
        filters={[
          {
            columnId: 'payment_status',
            title: 'Estado de pago',
            options: [
              { label: 'Pendiente', value: 'pending' },
              { label: 'Pagado', value: 'paid' },
              { label: 'Fallido', value: 'failed' },
              { label: 'Reembolsado', value: 'refunded' },
            ],
          },
          {
            columnId: 'order_status',
            title: 'Estado de orden',
            options: [
              { label: 'Creado', value: 'created' },
              { label: 'Confirmado', value: 'confirmed' },
              { label: 'Programado', value: 'scheduled' },
              { label: 'Completado', value: 'completed' },
              { label: 'Cancelado', value: 'cancelled' },
            ],
          }
        ]}
      />
    </div>
  )
}
