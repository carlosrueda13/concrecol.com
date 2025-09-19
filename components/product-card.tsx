'use client'

import Link from 'next/link'
import { Product } from '@prisma/client'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SafeImage } from '@/components/ui/safe-image'
import { Carousel } from '@/components/carousel'

interface ProductCardProps {
  product: Product & {
    sqlCategory: {
      name: string
      slug: string
    }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        {product.images && product.images.length > 0 ? (
          <Carousel 
            images={product.images} 
            productName={product.name} 
          />
        ) : (
          <div className="aspect-square w-full bg-gray-200 flex items-center justify-center text-gray-500">
            {product.name.charAt(0).toUpperCase()}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-1.5 p-4">
        <Link
          href={`/productos/${product.slug}`}
          className="block hover:underline"
        >
          <CardTitle className="line-clamp-2">{product.name}</CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground">{product.sqlCategory.name}</p>
        <div className="flex items-center justify-between">
          <p className="font-semibold">
            {formatPrice(product.price_per_unit)} / {product.unit_measure}
          </p>
          {product.requires_scheduling && (
            <Badge variant="secondary">Requiere programación</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" asChild>
          <Link href={`/productos/${product.slug}`}>Ver Detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
