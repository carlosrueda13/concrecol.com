'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface OrderStatusCounterProps {
  orderStatusCounts: Array<{
    order_status: string;
    _count: { id: number };
  }>;
  paymentStatusCounts: Array<{
    payment_status: string;
    _count: { id: number };
  }>;
}

type OrderStatus = 'created' | 'confirmed' | 'processing' | 'scheduled' | 'completed' | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

const orderStatusLabels: Record<OrderStatus, string> = {
  created: 'Creada',
  confirmed: 'Confirmada',
  processing: 'En Proceso',
  scheduled: 'Programada',
  completed: 'Completada',
  cancelled: 'Cancelada'
};

const orderStatusColors: Record<OrderStatus, string> = {
  created: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-indigo-100 text-indigo-800',
  processing: 'bg-amber-100 text-amber-800',
  scheduled: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
  refunded: 'Reembolsado'
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
};

export function OrderStatusCounter({ orderStatusCounts, paymentStatusCounts }: OrderStatusCounterProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <h3 className="font-medium mb-2">Estado de Órdenes</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(orderStatusLabels).map(([status, label]) => {
            const count = orderStatusCounts.find(item => item.order_status === status)?._count.id || 0;
            
            return (
              <div key={status} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={orderStatusColors[status as OrderStatus]}>
                    {count}
                  </Badge>
                  <span>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Estado de Pagos</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(paymentStatusLabels).map(([status, label]) => {
            const count = paymentStatusCounts.find(item => item.payment_status === status)?._count.id || 0;
            
            return (
              <div key={status} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={paymentStatusColors[status as PaymentStatus]}>
                    {count}
                  </Badge>
                  <span>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}
