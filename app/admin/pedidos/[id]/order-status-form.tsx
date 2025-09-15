'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface OrderStatusFormProps {
  orderId: string
  initialStatus: string
}

export function OrderStatusForm({ orderId, initialStatus }: OrderStatusFormProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit() {
    if (status === initialStatus) return

    try {
      setIsPending(true)
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      toast({
        title: 'Estado actualizado',
        description: 'El estado del pedido ha sido actualizado exitosamente.',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Hubo un error al actualizar el estado del pedido.',
        variant: 'destructive',
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Seleccionar estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="processing">En Proceso</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button onClick={onSubmit} disabled={isPending || status === initialStatus}>
        {isPending ? 'Actualizando...' : 'Actualizar estado'}
      </Button>
    </div>
  )
}
