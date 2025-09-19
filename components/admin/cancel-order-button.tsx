'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface CancelOrderButtonProps {
  orderId: string
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')

  async function handleCancelOrder() {
    if (!reason.trim()) {
      toast.error('Por favor proporciona un motivo para la cancelación')
      return
    }

    setLoading(true)
    try {
      // First update the order status to cancelled
      const statusResponse = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (!statusResponse.ok) {
        throw new Error('Failed to cancel order')
      }

      // Then log the cancellation reason
      const logResponse = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })

      if (!logResponse.ok) {
        throw new Error('Failed to log cancellation reason')
      }

      toast.success('Orden cancelada correctamente')
      setOpen(false)
      
      // Reload the page to show the updated state
      window.location.reload()
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Error al cancelar la orden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Cancelar Orden
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancelar Orden</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. La orden será marcada como cancelada.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm mb-2">Motivo de la cancelación:</p>
          <Textarea
            placeholder="Indique el motivo de la cancelación..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive"
            onClick={handleCancelOrder}
            disabled={loading || !reason.trim()}
          >
            {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
