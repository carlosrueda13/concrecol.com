import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Check, XCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'

interface PaymentPageProps {
  params: {
    token: string
  }
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { token } = params

  const order = await prisma.order.findUnique({
    where: {
      payment_link_token: token,
    },
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

  const isPaid = order.payment_status === 'paid'
  const isExpired = order.payment_status === 'failed'
  
  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Pago de Orden</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Orden #{order.order_number}
            </h2>
            
            {isPaid ? (
              <div className="flex items-center text-green-600">
                <Check className="mr-2 h-5 w-5" />
                <span className="font-medium">Pagado</span>
              </div>
            ) : isExpired ? (
              <div className="flex items-center text-red-600">
                <XCircle className="mr-2 h-5 w-5" />
                <span className="font-medium">Expirado</span>
              </div>
            ) : (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                Pendiente de Pago
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Detalles de la Orden</h3>
            <div className="border rounded-lg divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex justify-between">
                  <div>
                    <p>{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} {item.product.unit_measure}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.unit_price * item.quantity)}</p>
                  </div>
                </div>
              ))}
              
              {order.delivery_fee > 0 && (
                <div className="p-4 flex justify-between text-sm">
                  <span>Gastos de envío</span>
                  <span>{formatPrice(order.delivery_fee)}</span>
                </div>
              )}
              
              <div className="p-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Información del Cliente</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <p><span className="font-medium">Nombre:</span> {order.customer_name}</p>
              <p><span className="font-medium">Email:</span> {order.customer_email}</p>
              <p><span className="font-medium">Teléfono:</span> {order.customer_phone}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {!isPaid && !isExpired && (
            <Button 
              size="lg" 
              className="w-full max-w-md"
              // This would normally connect to your payment processor
              // For now we'll just simulate a payment
              asChild
            >
              <a href={`/api/payments/simulate?orderId=${order.id}&token=${token}`}>
                Pagar {formatPrice(order.total_amount)}
              </a>
            </Button>
          )}
          
          {isPaid && (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-2">
                ¡Gracias por tu pago! Tu orden ha sido confirmada.
              </p>
              <Button variant="outline" asChild>
                <a href="/">Volver a la tienda</a>
              </Button>
            </div>
          )}
          
          {isExpired && (
            <div className="text-center">
              <p className="text-red-600 font-medium mb-2">
                Este link de pago ha expirado o ya no es válido.
              </p>
              <Button variant="outline" asChild>
                <a href="/">Volver a la tienda</a>
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
