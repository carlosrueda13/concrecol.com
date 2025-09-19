import { Metadata } from 'next'
import { DeliveryCalendar } from '@/components/delivery-calendar'
import { Card } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const metadata: Metadata = {
  title: 'Calendario de Entregas | Concrecol',
  description: 'Calendario y programación de entregas',
}

export default async function DeliverySchedulePage() {
  // Obtener los pedidos programados para hoy y el futuro
  const scheduledOrders = await prisma.order.findMany({
    where: {
      requires_scheduling: true,
      delivery_date: {
        gte: new Date(),
      },
      order_status: {
        not: 'canceled',
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      delivery_date: 'asc',
    },
  })

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calendario de Entregas</h1>
        <p className="text-muted-foreground">
          Visualiza y gestiona las entregas programadas
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Calendario</h2>
          <DeliveryCalendar />
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Entregas Programadas</h2>
          <div className="space-y-4">
            {scheduledOrders.length > 0 ? (
              scheduledOrders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Pedido #{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {order.delivery_date &&
                          format(order.delivery_date, "d 'de' MMMM", {
                            locale: es,
                          })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.delivery_time_slot}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.product.name} - {item.quantity}{' '}
                        {item.product.unit_measure}
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay entregas programadas
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
