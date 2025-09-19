import { CategoryForm } from '@/components/admin/category-form'

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nueva Categoría</h2>
        <p className="text-muted-foreground">
          Crear una nueva categoría para los productos
        </p>
      </div>

      <CategoryForm />
    </div>
  )
}
