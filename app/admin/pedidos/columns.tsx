'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export type Order = {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  total_amount: number
  payment_status: string
  order_status: string
  createdAt: Date
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'order_number',
    header: 'Número de Orden',
  },
  {
    accessorKey: 'customer_name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'total_amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = row.getValue('total_amount') as number
      return formatCurrency(amount)
    },
  },
  {
    accessorKey: 'payment_status',
    header: 'Estado de Pago',
    cell: ({ row }) => {
      const status = row.getValue('payment_status') as string
      return (
        <Badge variant={status === 'paid' ? 'success' : 'destructive'}>
          {status === 'paid' ? 'Pagado' : 'Pendiente'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'order_status',
    header: 'Estado de Orden',
    cell: ({ row }) => {
      const status = row.getValue('order_status') as string
      const variant = 
        status === 'completed' ? 'success' :
        status === 'processing' ? 'warning' :
        status === 'cancelled' ? 'destructive' : 'default'
      
      const label =
        status === 'completed' ? 'Completada' :
        status === 'processing' ? 'En Proceso' :
        status === 'cancelled' ? 'Cancelada' : 'Pendiente'

      return (
        <Badge variant={variant}>
          {label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fecha
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      })
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => window.location.href = `/admin/pedidos/${order.id}`}
            >
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(order.order_number)
              }}
            >
              Copiar # de orden
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(order.customer_email)
              }}
            >
              Copiar email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
