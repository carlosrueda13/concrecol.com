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
import { Row } from '@tanstack/react-table'

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
    cell: ({ row }) => {
      const order = row.original
      return (
        <div>
          <div className="font-medium">{order.customer_name}</div>
          <div className="text-sm text-muted-foreground">
            {order.customer_email}
          </div>
        </div>
      )
    },
    filterFn: (row: Row<OrderWithItems>, id: string, value: string) => {
      return String(row.getValue(id)).toLowerCase().includes(value.toLowerCase())
    },
  },
  {
    accessorKey: 'total_amount',
    header: 'Total',
    cell: ({ row }) => formatPrice(row.getValue('total_amount') as number),
  },
  {
    accessorKey: 'payment_status',
    header: 'Pago',
    cell: ({ row }) => {
      const status = row.getValue('payment_status') as string
      return (
        <Badge
          variant={
            status === 'paid'
              ? 'default'
              : status === 'pending'
              ? 'secondary'
              : 'destructive'
          }
        >
          {getPaymentStatusLabel(status)}
        </Badge>
      )
    },
    filterFn: (row: Row<OrderWithItems>, id: string, value: string[]) => {
      return value.includes(row.getValue(id) as string)
    },
  },
  {
    accessorKey: 'order_status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.getValue('order_status') as string
      return (
        <Badge variant="outline">
          {getOrderStatusLabel(status)}
        </Badge>
      )
    },
    filterFn: (row: Row<OrderWithItems>, id: string, value: string[]) => {
      return value.includes(row.getValue(id) as string)
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
    cell: ({ row }) => {
      const order = row.original
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

          if (!response.ok) throw new Error('Error updating status')
          
          toast.success('Estado actualizado correctamente')
          router.refresh()
        } catch (error) {
          console.error('Error:', error)
          toast.error('Error al actualizar el estado')
        } finally {
          setLoading(false)
        }
      }

      const handleGeneratePaymentLink = async () => {
        setLoading(true)
        try {
          const response = await fetch(`/api/orders/${order.id}/payment-link`, {
            method: 'POST',
          })

          if (!response.ok) throw new Error('Error generating payment link')

          const { paymentLink } = await response.json()
          await navigator.clipboard.writeText(paymentLink)
          
          toast.success('Link de pago copiado al portapapeles')
        } catch (error) {
          console.error('Error:', error)
          toast.error('Error al generar el link de pago')
        } finally {
          setLoading(false)
        }
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
    },
  },
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
