import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { getCategories } from '@/app/actions/product'
import { ProductForm } from '@/components/admin/product-form'

const prisma = new PrismaClient()

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
    }),
    getCategories(),
  ])

  if (!product) {
    notFound()
    // TypeScript requires a return statement here
    return null
  }

  const formData = {
    name: product.name,
    slug: product.slug,
    price_per_unit: product.price_per_unit,
    unit_measure: product.unit_measure,
    lineaNegocio: product.lineaNegocio,
    stock_quantity: product.stock_quantity,
    requires_scheduling: product.requires_scheduling,
    images: product.images,
    is_active: product.is_active,
    sqlCategoryId: product.sqlCategoryId,
    description: product.description,
    applications: product.applications,
    advantages: product.advantages,
    specifications: product.specifications
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Editar Producto: {product.name}
        </h2>
        <p className="text-muted-foreground">
          Modificar los detalles del producto
        </p>
      </div>

      <ProductForm
        categories={categories}
        initialData={formData}
        productId={product.id}
      />
    </div>
  )
}
