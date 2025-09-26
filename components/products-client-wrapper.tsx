'use client'

import { ProductCard } from '@/components/product-card'
import { CategoryFilter } from '@/components/category-filter'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

interface ProductsClientWrapperProps {
  products: any[]
  categories: any[]
}

export function ProductsClientWrapper({ products, categories }: ProductsClientWrapperProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Filters - Mobile version has a collapsible menu, desktop version shows full sidebar */}
      <div className="w-full md:w-64 space-y-4 mb-2 md:mb-0">
        <CategoryFilter categories={categories} />
      </div>

      {/* Product Grid */}
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 px-2 md:px-4">
              {[...Array(6)].map((_, i) => (
                <div className="flex justify-center" key={i}>
                  <div className="w-full max-w-sm">
                    <Skeleton className="h-[350px]" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 px-2 md:px-4">
            {products.map((product) => (
              <div className="flex justify-center" key={product.id}>
                <div className="w-full max-w-sm">
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        </Suspense>

        {products.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No se encontraron productos</h3>
            <p className="text-muted-foreground mt-2">
              Intenta ajustar los filtros o busca con otros términos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
