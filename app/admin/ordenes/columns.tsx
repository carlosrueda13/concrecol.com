'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatPrice, formatDateTime } from '@/lib/utils'
import type { OrderColumns } from './types'
import type { OrderWithItems } from '@/types/prisma-extensions'

// Componente separado para las acciones
function OrderActionsCell({ order }: { order: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success('Estado actualizado correctamente')
      window.location.reload()
    } catch (error) {
      toast.error('Error al actualizar el estado')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePaymentLink = async () => {
    toast.info('Función no implementada')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={loading}>
          {loading ? 'Cargando...' : 'Acciones'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => router.push(`/admin/ordenes/${order.id}`)}
        >
          Ver Detalles
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={order.order_status === 'created'}
          onClick={() => handleStatusChange('created')}
        >
          Creado
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={order.order_status === 'confirmed'}
          onClick={() => handleStatusChange('confirmed')}
        >
          Confirmado
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={order.order_status === 'scheduled'}
          onClick={() => handleStatusChange('scheduled')}
        >
          Programado
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={order.order_status === 'completed'}
          onClick={() => handleStatusChange('completed')}
        >
          Completado
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={order.order_status === 'cancelled'}
          onClick={() => handleStatusChange('cancelled')}
        >
          Cancelado
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {order.payment_status === 'pending' && (
          <DropdownMenuItem onClick={handleGeneratePaymentLink}>
            Generar Link de Pago
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: OrderColumns = [
  {
    accessorKey: 'order_number',
    header: 'Número',
    cell: ({ row }) => (
      <div className="font-medium">#{row.getValue('order_number') as string}</div>
    ),
  },
  {
    accessorKey: 'customer_name',
    header: 'Cliente',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('customer_name') as string}</div>
    ),
  },
  {
    accessorKey: 'customer_email',
    header: 'Email',
  },
  {
    accessorKey: 'total_amount',
    header: 'Total',
    cell: ({ row }) => formatPrice(row.getValue('total_amount') as number),
  },
  {
    accessorKey: 'order_status',
    header: 'Estado del Pedido',
    cell: ({ row }) => {
      const status = row.getValue('order_status') as string
      return (
        <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
          {getOrderStatusLabel(status)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'payment_status',
    header: 'Estado del Pago',
    cell: ({ row }) => {
      const status = row.getValue('payment_status') as string
      return (
        <Badge variant={status === 'paid' ? 'default' : 'destructive'}>
          {getPaymentStatusLabel(status)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Fecha',
    cell: ({ row }) =>
      formatDateTime(row.getValue('createdAt') as Date),
  },
  {
    id: 'actions',
    cell: ({ row }) => <OrderActionsCell order={row.original} />
  }
]

function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
  }
  return labels[status] || status
}

function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    created: 'Creado',
    confirmed: 'Confirmado',
    scheduled: 'Programado',
    completed: 'Completado',
    cancelled: 'Cancelado',
  }
  return labels[status] || status
}