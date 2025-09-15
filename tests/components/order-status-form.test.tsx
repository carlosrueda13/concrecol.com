import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OrderStatusForm } from '@/app/admin/pedidos/[id]/status-form'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock the modules
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
  })),
}))

vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}))

describe('OrderStatusForm', () => {
  const mockOrderId = '123'
  const mockInitialStatus = 'pending'
  let fetchMock: any

  beforeEach(() => {
    fetchMock = vi.spyOn(global, 'fetch')
    vi.clearAllMocks()
  })

  it('renders with initial status', () => {
    render(<OrderStatusForm orderId={mockOrderId} initialStatus={mockInitialStatus} />)
    
    // The select trigger will show the initial status
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /actualizar estado/i })).toBeInTheDocument()
  })

  it('disables submit button when status has not changed', () => {
    render(<OrderStatusForm orderId={mockOrderId} initialStatus={mockInitialStatus} />)
    
    const submitButton = screen.getByRole('button', { name: /actualizar estado/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when status changes', async () => {
    render(<OrderStatusForm orderId={mockOrderId} initialStatus={mockInitialStatus} />)
    
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    
    const processingOption = screen.getByRole('option', { name: /en proceso/i })
    fireEvent.click(processingOption)
    
    const submitButton = screen.getByRole('button', { name: /actualizar estado/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('shows success toast and refreshes page on successful update', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    })

    const mockToast = vi.fn()
    ;(useToast as any).mockReturnValue({ toast: mockToast })

    const mockRefresh = vi.fn()
    ;(useRouter as any).mockReturnValue({ refresh: mockRefresh })

    render(<OrderStatusForm orderId={mockOrderId} initialStatus={mockInitialStatus} />)
    
    // Change status
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    const processingOption = screen.getByRole('option', { name: /en proceso/i })
    fireEvent.click(processingOption)
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /actualizar estado/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/orders/${mockOrderId}/status`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'processing' }),
        })
      )
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Estado actualizado',
        })
      )
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('shows error toast on failed update', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Failed to update'))

    const mockToast = vi.fn()
    ;(useToast as any).mockReturnValue({ toast: mockToast })

    render(<OrderStatusForm orderId={mockOrderId} initialStatus={mockInitialStatus} />)
    
    // Change status
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    const processingOption = screen.getByRole('option', { name: /en proceso/i })
    fireEvent.click(processingOption)
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /actualizar estado/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          variant: 'destructive',
        })
      )
    })
  })
})
