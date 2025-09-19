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

const orderStatuses = [
  { value: 'created', label: 'Creado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'scheduled', label: 'Programado' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
]

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function updateOrderStatus(newStatus: string) {
    if (newStatus === value) {
      setOpen(false)
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update order status: ${errorText}`)
      }

      setValue(newStatus)
      toast.success('Estado actualizado correctamente')
      
      // Reload the page to show all updated info
      window.location.reload()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Error al actualizar el estado')
    } finally {
      setLoading(false)
    }
  }

  // Define logical order flow transitions
  const getNextPossibleStatuses = () => {
    switch (value) {
      case 'created':
        return orderStatuses.filter(s => ['confirmed', 'cancelled'].includes(s.value))
      case 'confirmed':
        return orderStatuses.filter(s => ['scheduled', 'completed', 'cancelled'].includes(s.value))
      case 'scheduled':
        return orderStatuses.filter(s => ['completed', 'cancelled'].includes(s.value))
      case 'completed':
        return orderStatuses.filter(s => ['completed'].includes(s.value))
      case 'cancelled':
        return orderStatuses.filter(s => ['cancelled'].includes(s.value))
      default:
        return orderStatuses
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
          disabled={loading || ['completed', 'cancelled'].includes(value)}
        >
          {loading ? 'Actualizando...' : 
            value
              ? orderStatuses.find((status) => status.value === value)?.label
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
                  updateOrderStatus(currentValue)
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
