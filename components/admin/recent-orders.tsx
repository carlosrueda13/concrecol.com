'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDateTime, formatPrice } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  createdAt: string;
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await fetch('/api/admin/recent-orders')
        if (!response.ok) throw new Error('Failed to fetch recent orders')
        
        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error('Error fetching recent orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentOrders()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between items-center p-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No hay órdenes recientes</div>
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          href={`/admin/ordenes/${order.id}`}
          key={order.id}
          className="flex justify-between items-center p-2 hover:bg-muted rounded-md transition-colors"
        >
          <div>
            <div className="font-medium">{order.order_number}</div>
            <div className="text-sm text-muted-foreground">{order.customer_name}</div>
          </div>
          <div className="text-right">
            <div className="font-medium">{formatPrice(order.total_amount)}</div>
            <div className="text-xs text-muted-foreground">
              {formatStatus(order.payment_status)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pendiente',
    'paid': 'Pagado',
    'failed': 'Fallido',
    'refunded': 'Reembolsado',
    'created': 'Creado',
    'confirmed': 'Confirmado',
    'processing': 'En Proceso',
    'completed': 'Completado',
    'cancelled': 'Cancelado'
  }
  
  return statusMap[status] || status
}
