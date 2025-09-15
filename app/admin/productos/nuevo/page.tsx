import { getCategories } from '@/app/actions/product'
import { ProductForm } from '@/components/admin/product-form'

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nuevo Producto</h2>
        <p className="text-muted-foreground">
          Crear un nuevo producto en el catálogo
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  )
}
