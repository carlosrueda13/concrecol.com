'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface CategoryFilterProps {
  categories: {
    id: string
    name: string
    slug: string
  }[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Categorías</h2>
      <div className="flex flex-wrap gap-2 md:flex-col">
        <Link
          href="/productos"
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'justify-start w-full'
          )}
        >
          Todos los productos
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/productos?categoria=${category.slug}`}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'justify-start w-full'
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
