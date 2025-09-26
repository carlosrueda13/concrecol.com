'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'

interface CategoryFilterProps {
  categories: {
    id: string
    name: string
    slug: string
  }[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('categoria')
  
  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }
  
  // Determinar el nombre de la categoría actual para mostrar en el botón del móvil
  const currentCategoryName = currentCategory 
    ? categories.find(cat => cat.slug === currentCategory)?.name 
    : 'Todos los productos'

  return (
    <div className="space-y-4">
      {/* Título para vista desktop */}
      <h2 className="font-semibold hidden md:block">Categorías</h2>
      
      {/* Botón desplegable para móvil */}
      <button 
        onClick={toggleMenu}
        className="flex md:hidden w-full justify-between items-center px-4 py-3 bg-gray-100 rounded-md"
      >
        <span className="font-medium">{currentCategoryName}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>
      
      {/* Menú de categorías - siempre visible en desktop, colapsable en móvil */}
      <div className={cn(
        "flex flex-col gap-1",
        isOpen ? "block" : "hidden md:block"
      )}>
        <Link
          href="/productos"
          className={cn(
            buttonVariants({ 
              variant: !currentCategory ? 'default' : 'ghost'
            }),
            'justify-start w-full'
          )}
          onClick={() => setIsOpen(false)}
        >
          Todos los productos
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/productos?categoria=${category.slug}`}
            className={cn(
              buttonVariants({ 
                variant: currentCategory === category.slug ? 'default' : 'ghost'
              }),
              'justify-start w-full'
            )}
            onClick={() => setIsOpen(false)}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
