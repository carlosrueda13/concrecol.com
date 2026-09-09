'use client'

import Link from 'next/link'
import { Product } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ProductDetailClientProps {
  product: Product & {
    sqlCategory: {
      name: string
      slug: string
    }
  }
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const hasDescription = Boolean(
    product.description && product.description.trim().length > 0
  )

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{product.sqlCategory.name}</Badge>
          {product.requires_scheduling && (
            <Badge variant="outline">Requiere programación</Badge>
          )}
        </div>
      </div>

      {hasDescription && (
        <p className="text-muted-foreground">{product.description}</p>
      )}

      <div className="space-y-3">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/contacto">Solicitar cotización</Link>
        </Button>
        <Link
          href="/productos"
          className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  )
}
