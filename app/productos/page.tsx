import { prisma } from '@/lib/prisma'
import { ProductsClientWrapper } from '@/components/products-client-wrapper'

interface ProductsPageProps {
  searchParams?: {
    categoria?: string
    q?: string
  }
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const where = {
    is_active: true,
    ...(searchParams?.categoria
      ? {
          sqlCategory: {
            slug: searchParams.categoria,
          },
        }
      : {}),
    ...(searchParams?.q
      ? {
          OR: [
            { name: { contains: searchParams.q } },
            { sqlCategory: { name: { contains: searchParams.q } } },
          ],
        }
      : {}),
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        sqlCategory: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.sqlCategory.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ])

  return (
    <div className="space-y-6 container mx-auto px-4 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de Productos</h1>
        <p className="text-muted-foreground mt-2">
          Explora nuestra selección de productos para construcción
        </p>
      </div>

      <ProductsClientWrapper 
        products={products} 
        categories={categories} 
      />
    </div>
  )
}
