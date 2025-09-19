import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CategoryForm } from '@/components/admin/category-form'
import { CategoryFormData } from '@/lib/validations/category'

interface EditCategoryPageProps {
  params: {
    id: string
  }
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const category = await prisma.sqlCategory.findUnique({
    where: { id: params.id },
  })

  if (!category) {
    notFound()
    // TypeScript requires a return statement here
    return null
  }

  const formData: Partial<CategoryFormData> = {
    name: category.name,
    slug: category.slug,
    is_active: category.is_active,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Editar Categoría: {category.name}
        </h2>
        <p className="text-muted-foreground">
          Modificar los detalles de la categoría
        </p>
      </div>

      <CategoryForm initialData={formData} categoryId={category.id} />
    </div>
  )
}
