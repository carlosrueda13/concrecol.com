'use client'

import { useCallback, useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAvailableTimeSlots } from '@/app/actions/order'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DeliveryCalendarProps {
  onDateSelect?: (date: Date | undefined) => void
  onTimeSelect?: (time: string | undefined) => void
  defaultDate?: Date
  defaultTime?: string
}

export function DeliveryCalendar({ 
  onDateSelect, 
  onTimeSelect,
  defaultDate,
  defaultTime 
}: DeliveryCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(defaultDate)
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string | undefined>(defaultTime)

  const loadTimeSlots = useCallback(async (selectedDate: Date) => {
    try {
      const slots = await getAvailableTimeSlots(selectedDate)
      setTimeSlots(slots)
      if (!slots.includes(selectedTime || '')) {
        setSelectedTime(undefined)
        onTimeSelect?.(undefined)
      }
    } catch (error) {
      console.error('Error loading time slots:', error)
      setTimeSlots([])
    }
  }, [selectedTime, onTimeSelect])

  useEffect(() => {
    if (date) {
      loadTimeSlots(date)
    }
  }, [date, loadTimeSlots])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate)
            onDateSelect?.(newDate)
            if (!newDate) {
              setSelectedTime(undefined)
              onTimeSelect?.(undefined)
            }
          }}
          locale={es}
          disabled={(date) => {
            const now = new Date()
            const maxDate = new Date()
            maxDate.setMonth(now.getMonth() + 2)
            return date < now || date > maxDate
          }}
          initialFocus
        />
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-4">Horarios disponibles</h3>
        {date ? (
          timeSlots.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {format(date, "EEEE d 'de' MMMM", { locale: es })}
              </p>
              <Select
                value={selectedTime}
                onValueChange={(value) => {
                  setSelectedTime(value)
                  onTimeSelect?.(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un horario" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="text-center py-6">
              <Badge variant="secondary">No hay horarios disponibles</Badge>
            </div>
          )
        ) : (
          <div className="text-center py-6">
            <Badge variant="secondary">Selecciona una fecha</Badge>
          </div>
        )}
      </Card>
    </div>
  )
}
