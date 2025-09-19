import { Metadata } from 'next'
import { CreateOrderForm } from '@/components/create-order-form'

export const metadata: Metadata = {
  title: 'Nuevo Pedido | Concrecol',
  description: 'Crear un nuevo pedido en el sistema',
}

export default function NewOrderPage() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nuevo Pedido</h1>
        <p className="text-muted-foreground">
          Complete el formulario para crear un nuevo pedido
        </p>
      </div>

      <CreateOrderForm />
    </div>
  )
}
