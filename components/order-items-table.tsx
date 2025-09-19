'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { type Product } from '@/types/product'
import { type OrderItemData } from '@/lib/validations/order'

interface OrderItemsTableProps {
  products: Product[]
  value: OrderItemData[]
  onChange: (items: OrderItemData[]) => void
}

export function OrderItemsTable({ products, value, onChange }: OrderItemsTableProps) {
  const [items, setItems] = useState(value)

  // Actualizar el estado local cuando cambian los valores externos
  useEffect(() => {
    setItems(value)
  }, [value])

  const updateQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const existingItemIndex = items.findIndex((item) => item.product_id === productId)

    if (existingItemIndex >= 0) {
      // Si la cantidad es 0 o negativa, eliminar el item
      if (quantity <= 0) {
        const newItems = items.filter((_, index) => index !== existingItemIndex)
        setItems(newItems)
        onChange(newItems)
        return
      }

      // Actualizar cantidad del item existente
      const newItems = [...items]
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity,
        total: quantity * product.price_per_unit
      }
      setItems(newItems)
      onChange(newItems)
    } else if (quantity > 0) {
      // Agregar nuevo item solo si la cantidad es positiva
      const newItem = {
        product_id: productId,
        product_name: product.name,
        quantity,
        unit_price: product.price_per_unit,
        total: quantity * product.price_per_unit
      }
      const newItems = [...items, newItem]
      setItems(newItems)
      onChange(newItems)
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const item = items.find((i) => i.product_id === product.id)
            const quantity = item?.quantity || 0
            const subtotal = quantity * product.price_per_unit

            return (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{formatCurrency(product.price_per_unit)}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step={['KG', 'TON'].includes(product.unit_measure) ? '0.1' : '1'}
                    value={quantity || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      updateQuantity(product.id, isNaN(value) ? 0 : value)
                    }}
                    className="w-24"
                  />
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(subtotal)}
                </TableCell>
              </TableRow>
            )
          })}
          <TableRow>
            <TableCell colSpan={3} className="text-right font-medium">
              Total
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(
                items.reduce(
                  (sum, item) => sum + item.quantity * item.unit_price,
                  0
                )
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
