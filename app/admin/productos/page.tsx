import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AdminProductsClient } from '@/components/admin/admin-products-client'
import { prisma } from '@/lib/prisma'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      sqlCategory: true,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Productos</h2>
        <Link href="/admin/productos/nuevo">
          <Button>Nuevo Producto</Button>
        </Link>
      </div>

      <AdminProductsClient products={products} />
    </div>
  )
}
