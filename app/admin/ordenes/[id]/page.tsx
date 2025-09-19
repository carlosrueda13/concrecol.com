import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, ClockIcon, TruckIcon, MapPinIcon } from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { OrderStatusSelect } from '@/components/admin/order-status-select'
import { PaymentStatusSelect } from '@/components/admin/payment-status-select'
import { OrderHistory } from '@/components/admin/order-history'
import { prisma } from '@/lib/prisma'
import { GeneratePaymentLinkButton } from '@/components/admin/generate-payment-link-button'
import { CancelOrderButton } from '@/components/admin/cancel-order-button'
import { SiigoInvoiceButton } from '@/components/admin/invoices/siigo-invoice-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

interface OrderPageProps {
  params: {
    id: string
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Orden #{order.order_number}
          </h2>
          <p className="text-muted-foreground mt-2">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="/admin/ordenes">Volver a Órdenes</a>
          </Button>
          {order.order_status !== 'cancelled' && (
            <CancelOrderButton orderId={order.id} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-wrap gap-4 items-center">
          <Badge
            className="px-3 py-1 text-base"
            variant={
              order.order_status === 'completed'
                ? 'default'
                : order.order_status === 'cancelled'
                ? 'destructive'
                : 'outline'
            }
          >
            Estado: {getOrderStatusLabel(order.order_status)}
          </Badge>
          
          <Badge
            className="px-3 py-1 text-base"
            variant={
              order.payment_status === 'paid'
                ? 'default'
                : order.payment_status === 'pending'
                ? 'secondary'
                : 'destructive'
            }
          >
            Pago: {getPaymentStatusLabel(order.payment_status)}
          </Badge>

          {order.requires_scheduling && (
            <Badge variant="outline" className="px-3 py-1 text-base">
              Requiere programación
            </Badge>
          )}
          
          <div className="flex-grow"></div>
          
          <div className="text-2xl font-bold">
            {formatPrice(order.total_amount)}
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Order Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Estado de la Orden</h3>
                  <div className="flex items-center space-x-4">
                    <OrderStatusSelect orderId={order.id} currentStatus={order.order_status} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Estado del Pago</h3>
                  <div className="flex items-center space-x-4">
                    <PaymentStatusSelect orderId={order.id} currentStatus={order.payment_status} />
                    {order.payment_status === 'pending' && (
                      <GeneratePaymentLinkButton orderId={order.id} />
                    )}
                    {(order.payment_status === 'paid' || order.payment_status === 'manually_paid') && (
                      <div className="ml-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1"
                          asChild
                        >
                          <a href={`/admin/ordenes/${order.id}/factura`}>
                            Factura electrónica
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                  {order.payment_link_token && order.payment_status === 'pending' && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                      <p className="text-sm font-medium">
                        Link de pago generado:
                      </p>
                      <p className="text-sm break-all">
                        {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pagos/{order.payment_link_token}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Información del Cliente</h3>
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <div className="grid gap-1">
                      <p>
                        <span className="font-medium">Nombre:</span>{' '}
                        {order.customer_name}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{' '}
                        {order.customer_email}
                      </p>
                      <p>
                        <span className="font-medium">Teléfono:</span>{' '}
                        {order.customer_phone}
                      </p>
                      <p>
                        <span className="font-medium">Documento:</span>{' '}
                        {order.customer_document}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Información de Entrega</h3>
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <div className="grid gap-3">
                      <div className="flex items-center gap-2">
                        <TruckIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Método:</span>{' '}
                        {order.delivery_option === 'pickup'
                          ? 'Recoger en tienda'
                          : 'Envío a domicilio'}
                      </div>
                      
                      {order.delivery_option === 'delivery' && (
                        <div className="flex items-start gap-2">
                          <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium">Dirección:</span>{' '}
                            <p className="text-muted-foreground">{order.delivery_address}</p>
                          </div>
                        </div>
                      )}
                      
                      {order.delivery_date && (
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Fecha:</span>{' '}
                          {formatDateTime(order.delivery_date)}
                        </div>
                      )}
                      
                      {order.delivery_time_slot && (
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Horario:</span>{' '}
                          {order.delivery_time_slot}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Notas</h3>
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <p className="text-muted-foreground">{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {order.requires_scheduling && !order.delivery_date && (
              <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                <p className="text-blue-800 font-medium">
                  Esta orden requiere programación de entrega.
                </p>
                {(order.order_status === 'created' || order.order_status === 'confirmed') && (
                  <p className="text-sm text-blue-600 mt-2">
                    Pendiente de programar la entrega. Contacte al cliente para coordinar una fecha.
                  </p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="products">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Productos Ordenados</h3>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4">Precio Unitario</th>
                      <th className="py-3 px-4">Cantidad</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.product.unit_measure}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {formatPrice(item.unit_price)}
                        </td>
                        <td className="py-4 px-4">
                          {item.quantity} {item.product.unit_measure}
                        </td>
                        <td className="py-4 px-4 text-right font-medium">
                          {formatPrice(item.unit_price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t bg-muted/50">
                    {order.delivery_fee > 0 && (
                      <tr>
                        <td colSpan={3} className="py-3 px-4 text-right font-medium">
                          Gastos de envío
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatPrice(order.delivery_fee)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-right text-lg font-bold">
                        Total
                      </td>
                      <td className="py-3 px-4 text-right text-lg font-bold">
                        {formatPrice(order.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <OrderHistory orderId={order.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
