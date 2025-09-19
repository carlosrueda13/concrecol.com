import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { CreateOrderForm } from '@/components/admin/create-order-form'

export default async function NewOrderPage() {
  // Fetch all active products for the form
  const products = await prisma.product.findMany({
    where: {
      is_active: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nueva Orden</h2>
          <p className="text-muted-foreground">
            Crear una orden manualmente para un cliente
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/admin/ordenes">Cancelar</a>
        </Button>
      </div>
      
      <CreateOrderForm products={products} />
    </div>
  )
}
