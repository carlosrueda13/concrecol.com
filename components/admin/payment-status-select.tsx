'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const paymentStatuses = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'failed', label: 'Fallido' },
  { value: 'refunded', label: 'Reembolsado' },
]

interface PaymentStatusSelectProps {
  orderId: string
  currentStatus: string
}

export function PaymentStatusSelect({ orderId, currentStatus }: PaymentStatusSelectProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function updatePaymentStatus(newStatus: string) {
    if (newStatus === value) {
      setOpen(false)
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update payment status: ${errorText}`)
      }

      setValue(newStatus)
      toast.success('Estado de pago actualizado correctamente')
      
      // Force refresh to update the UI
      window.location.reload()
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('Error al actualizar el estado de pago')
    } finally {
      setLoading(false)
    }
  }
  
  // Define logical payment flow transitions
  const getNextPossibleStatuses = () => {
    switch (value) {
      case 'pending':
        return paymentStatuses.filter(s => ['paid', 'failed'].includes(s.value))
      case 'paid':
        return paymentStatuses.filter(s => ['refunded', 'paid'].includes(s.value))
      case 'failed':
        return paymentStatuses.filter(s => ['pending', 'failed'].includes(s.value))
      case 'refunded':
        return paymentStatuses.filter(s => ['refunded'].includes(s.value))
      default:
        return paymentStatuses
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          disabled={loading || value === 'refunded'}
        >
          {loading ? 'Actualizando...' : 
            value
              ? paymentStatuses.find((status) => status.value === value)?.label
              : 'Seleccionar estado...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Buscar estado..." />
          <CommandEmpty>No se encontraron estados.</CommandEmpty>
          <CommandGroup>
            {getNextPossibleStatuses().map((status) => (
              <CommandItem
                key={status.value}
                value={status.value}
                onSelect={(currentValue: string) => {
                  updatePaymentStatus(currentValue)
                  setOpen(false)
                }}
                disabled={status.value === value}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === status.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {status.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
