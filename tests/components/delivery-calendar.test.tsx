import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import { DeliveryCalendar } from '@/components/delivery-calendar'
import { getAvailableTimeSlots } from '@/app/actions/order'

// Mock del módulo de acciones
vi.mock('@/app/actions/order', () => ({
  getAvailableTimeSlots: vi.fn()
}))

describe('DeliveryCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(getAvailableTimeSlots as any).mockResolvedValue([
      '08:00',
      '09:00',
      '10:00'
    ])
  })

  it('renders calendar and time slots correctly', async () => {
    // Usar una fecha válida un mes adelante
    const mockDate = new Date()
    mockDate.setMonth(mockDate.getMonth() + 1)
    mockDate.setDate(15)

    render(<DeliveryCalendar />)

    // Verificar que el calendario se renderiza
    const calendar = screen.getByRole('grid')
    expect(calendar).toBeInTheDocument()

    // Verificar mensaje inicial sin fecha seleccionada
    const selectDateBadge = screen.getByText('Selecciona una fecha')
    expect(selectDateBadge).toBeInTheDocument()
    expect(selectDateBadge.tagName).toBe('SPAN')
  })

  it('calls onDateSelect and onTimeSelect when selections change', async () => {
    const onDateSelect = vi.fn()
    const onTimeSelect = vi.fn()
    
    // Establecer una fecha válida (un mes adelante para evitar restricciones)
    const mockDate = new Date()
    mockDate.setMonth(mockDate.getMonth() + 1) // Un mes adelante
    mockDate.setDate(15) // Día del mes que sabemos que estará disponible
    
    // Simular un slot de horario disponible
    const mockTimeSlot = '10:00 AM'
    ;(getAvailableTimeSlots as any).mockResolvedValue([mockTimeSlot])

    render(
      <DeliveryCalendar
        onDateSelect={onDateSelect}
        onTimeSelect={onTimeSelect}
        defaultDate={mockDate} // Establecer la fecha por defecto
      />
    )

    // Esperar y avanzar al mes siguiente
    const nextMonthButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextMonthButton)
    
    await waitFor(() => {
      const table = screen.getByRole('grid')
      const label = table.getAttribute('aria-label') || ''
      expect(label.toLowerCase()).toContain('octubre')
    })

    // Seleccionar una fecha
    const dateCell = screen.getByRole('gridcell', { 
      name: new RegExp(`.*${mockDate.getDate()}.*`, 'i') 
    })
    
    // La fecha no debe estar deshabilitada
    expect(dateCell).not.toHaveAttribute('data-disabled')
    
    fireEvent.click(dateCell)

    // Verificar que onDateSelect fue llamado con una fecha
    expect(onDateSelect).toHaveBeenCalledWith(expect.any(Date))
    
    // Esperar a que se carguen los horarios
    await waitFor(() => {
      expect(screen.getByText(mockTimeSlot)).toBeInTheDocument()
    })

    // Seleccionar un horario
    const timeSelect = screen.getByRole('combobox')
    fireEvent.click(timeSelect)

    const timeOption = await screen.findByRole('option', { name: mockTimeSlot })
    fireEvent.click(timeOption)

    // Verificar que onTimeSelect fue llamado con el horario seleccionado
    expect(onTimeSelect).toHaveBeenCalledWith(mockTimeSlot)
  })

  it('displays no available slots message when appropriate', async () => {
    // Simular que no hay horarios disponibles
    ;(getAvailableTimeSlots as any).mockResolvedValue([])

    // Usar una fecha válida un mes adelante
    const mockDate = new Date()
    mockDate.setMonth(mockDate.getMonth() + 1)
    mockDate.setDate(15)

    render(<DeliveryCalendar defaultDate={mockDate} />)

    // Esperar a que el calendario se renderice con el mes correcto
    await waitFor(() => {
      const table = screen.getByRole('grid')
      expect(table).toHaveAttribute('aria-label', expect.stringMatching(/octubre|noviembre|diciembre/i))
    })

    // Seleccionar una fecha válida
    const dateCell = screen.getByRole('gridcell', { 
      name: new RegExp(`.*${mockDate.getDate()}.*`, 'i')
    })
    fireEvent.click(dateCell)

    // Esperar y verificar el mensaje en el segundo Card
    await waitFor(() => {
      const cards = screen.getAllByRole('generic').filter(el => 
        el.className.includes('Card') || el.className.includes('card')
      )
      expect(cards).toHaveLength(2)
      
      const timeSlotCard = cards[1]
      const badge = within(timeSlotCard).getByText(/no hay horarios disponibles/i)
      expect(badge).toBeInTheDocument()
      expect(badge.tagName).toBe('SPAN')
    })
  })

  it('handles error when loading time slots', async () => {
    ;(getAvailableTimeSlots as any).mockRejectedValue(new Error('Failed to load'))

    // Usar una fecha válida un mes adelante
    const mockDate = new Date()
    mockDate.setMonth(mockDate.getMonth() + 1)
    mockDate.setDate(15)

    render(<DeliveryCalendar defaultDate={mockDate} />)

    // Esperar a que el calendario se renderice con el mes correcto
    await waitFor(() => {
      const table = screen.getByRole('grid')
      expect(table).toHaveAttribute('aria-label', expect.stringMatching(/octubre|noviembre|diciembre/i))
    })

    // Seleccionar una fecha válida
    const dateCell = screen.getByRole('gridcell', { 
      name: new RegExp(`.*${mockDate.getDate()}.*`, 'i')
    })
    fireEvent.click(dateCell)

    // Esperar y verificar que el mensaje de error se muestre en el segundo Card
    await waitFor(() => {
      const cards = screen.getAllByRole('generic').filter(el => 
        el.className.includes('Card') || el.className.includes('card')
      )
      expect(cards).toHaveLength(2)
      
      const timeSlotCard = cards[1]
      const badge = within(timeSlotCard).getByText(/no hay horarios disponibles/i)
      expect(badge).toBeInTheDocument()
      expect(badge.tagName).toBe('SPAN')
    })
  })

  it('disables past dates and dates too far in the future', () => {
    render(<DeliveryCalendar />)

    // Verificar que las fechas pasadas están deshabilitadas
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const pastDate = screen.getByRole('gridcell', { name: yesterday.getDate().toString() })
    expect(pastDate).toHaveClass('rdp-disabled')

    // Verificar que las fechas muy futuras están deshabilitadas
    const tooFarFuture = new Date()
    tooFarFuture.setMonth(tooFarFuture.getMonth() + 3)
    const futureDate = screen.getByRole('gridcell', { name: tooFarFuture.getDate().toString() })
    expect(futureDate).toHaveClass('rdp-disabled')
  })
})
