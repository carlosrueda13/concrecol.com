'use client'

import { useState } from 'react'
import { Product } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { QuantityInput } from '@/components/quantity-input'

interface ProductDetailClientProps {
  product: Product & {
    sqlCategory: {
      name: string
      slug: string
    }
  }
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1)
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{product.sqlCategory.name}</Badge>
          {product.requires_scheduling && (
            <Badge variant="outline">Requiere programación de entrega</Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-2xl font-bold">
          {formatPrice(product.price_per_unit)} / {product.unit_measure}
        </p>
        {product.stock_quantity > 0 ? (
          <p className="text-sm text-muted-foreground">
            Stock disponible: {product.stock_quantity} {product.unit_measure}
          </p>
        ) : (
          <Badge variant="destructive">Sin stock</Badge>
        )}
      </div>

      {product.requires_scheduling && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <p>
            Este producto requiere programación de entrega. Al finalizar tu compra, nuestro equipo
            te contactará para coordinar la entrega.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="quantity" className="text-sm font-medium">
            Cantidad ({product.unit_measure})
          </label>
          <QuantityInput
            id="quantity"
            min={0}
            max={product.stock_quantity}
            step={product.unit_measure === 'M3' ? 0.01 : 1}
            defaultValue={1}
            onChange={setQuantity}
          />
        </div>

        <AddToCartButton
          productId={product.id}
          quantity={quantity}
          disabled={product.stock_quantity === 0}
        />
      </div>
    </div>
  )
}
