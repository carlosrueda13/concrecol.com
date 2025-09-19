'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { useCart } from '@/contexts/cart-provider'
import { CartItem } from '@/contexts/cart-provider'
import { QuoteRequestModal } from '@/components/quote-request-modal'
import { PDFViewer } from '@/components/pdf-viewer'

export default function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart, hasScheduledProduct } = useCart()
  const { toast } = useToast()
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [pdfPath, setPdfPath] = useState<string>()
  const [requestingQuote, setRequestingQuote] = useState(false)

  const getSubtotal = (items: CartItem[]) => {
    return items.reduce(
      (total, item) => total + item.product.price_per_unit * item.quantity,
      0
    )
  }

  const handleQuoteRequest = async (data: {
    customerName: string
    customerEmail: string
    customerPhone: string
    notes?: string
  }) => {
    setRequestingQuote(true)
    
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al generar la cotización')
      }

      const result = await response.json()
      setPdfPath(result.pdfPath)
      setPdfViewerOpen(true)
      
      return result
    } finally {
      setRequestingQuote(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando carrito...</div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
          <p className="text-muted-foreground mb-8">
            Agrega algunos productos para continuar
          </p>
          <Button asChild>
            <Link href="/productos">Ver Productos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8 animate-fadeIn">
        Carrito
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-md">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                            {item.product.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.product.sqlCategory.name}
                        </p>
                        {item.product.requires_scheduling && (
                          <Badge variant="outline" className="mt-1">
                            Requiere programación
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatPrice(item.product.price_per_unit)} /{' '}
                    {item.product.unit_measure}
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQuantity = parseFloat(e.target.value)
                        if (!isNaN(newQuantity) && newQuantity >= 0) {
                          updateQuantity(item.product_id, newQuantity)
                        }
                      }}
                      min={0}
                      step={item.product.unit_measure === 'M3' ? 0.01 : 1}
                      className="w-20 rounded-md border border-input px-3 py-1"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(item.product.price_per_unit * item.quantity)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.product_id)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Resumen</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(getSubtotal(cart.items))}</span>
              </div>
              {hasScheduledProduct && (
                <div className="pt-4 text-sm animate-fadeIn">
                  <Badge variant="secondary" className="mb-2">
                    Información Importante
                  </Badge>
                  <p className="text-muted-foreground">
                    Tu pedido incluye productos que requieren programación. Te
                    contactaremos para coordinar la entrega y el pago.
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 space-y-4">
              <Button asChild className="w-full hover-scale">
                <Link href="/checkout">Continuar al Pago</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full hover-scale"
                onClick={() => setQuoteModalOpen(true)}
              >
                Solicitar Cotización
              </Button>
              
              <QuoteRequestModal 
                open={quoteModalOpen}
                onClose={() => setQuoteModalOpen(false)}
                onSubmit={handleQuoteRequest}
              />
              
              <PDFViewer
                open={pdfViewerOpen}
                onClose={() => setPdfViewerOpen(false)}
                pdfUrl={pdfPath}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
