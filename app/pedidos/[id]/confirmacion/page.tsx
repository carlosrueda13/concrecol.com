'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'

interface OrderConfirmationProps {
  params: {
    id: string
  }
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  total_amount: number
  requires_scheduling: boolean
  payment_status: string
  items: Array<{
    product: {
      name: string
      unit_measure: string
    }
    quantity: number
    unit_price: number
  }>
}

export default function OrderConfirmationPage({ params }: OrderConfirmationProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        if (!response.ok) {
          throw new Error('Error fetching order')
        }
        const data = await response.json()
        setOrder(data)
      } catch (err) {
        setError('No pudimos cargar los detalles de tu pedido. Por favor contacta a atención al cliente.')
        console.error('Error fetching order:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id])

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Cargando detalles de tu orden...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/productos">Volver a Productos</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <Card>
        <CardHeader className="text-center border-b pb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">¡Gracias por tu pedido!</CardTitle>
          <CardDescription className="text-lg">
            Tu número de orden es <span className="font-bold">{order.order_number}</span>
          </CardDescription>
          {order.requires_scheduling ? (
            <div className="mt-4 bg-blue-50 p-4 rounded-lg text-left">
              <p className="font-semibold text-blue-800">Tu pedido requiere programación</p>
              <p className="text-sm text-blue-700 mt-1">
                Te contactaremos pronto para coordinar la entrega y el pago.
              </p>
            </div>
          ) : order.payment_status === 'pending' ? (
            <div className="mt-4 bg-yellow-50 p-4 rounded-lg text-left">
              <p className="font-semibold text-yellow-800">Pago pendiente</p>
              <p className="text-sm text-yellow-700 mt-1">
                Confirmaremos tu pago por transferencia y te enviaremos la factura electrónica.
              </p>
            </div>
          ) : (
            <div className="mt-4 bg-green-50 p-4 rounded-lg text-left">
              <p className="font-semibold text-green-800">¡Pago recibido!</p>
              <p className="text-sm text-green-700 mt-1">
                Tu pedido está siendo procesado. Te enviaremos una factura electrónica a tu correo.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Detalles del pedido</h3>
              <div className="mt-4 border rounded-lg overflow-hidden">
                <table className="w-full divide-y">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Precio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {item.product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {item.quantity} {item.product.unit_measure}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {formatPrice(item.unit_price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <th
                        colSpan={2}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">
                        {formatPrice(order.total_amount)}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Información del cliente</h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-sm">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm">{order.customer_email}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button asChild>
            <Link href="/productos">Seguir Comprando</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
