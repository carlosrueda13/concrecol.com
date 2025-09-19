import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import { CreateOrderForm } from '@/components/create-order-form'
import { createOrder } from '@/app/actions/order'

// Mock de las acciones
vi.mock('@/app/actions/order', () => ({
  createOrder: vi.fn()
}))

// Mock de fetch para la carga de productos
global.fetch = vi.fn()

describe('CreateOrderForm', () => {
  const mockProducts = [
    {
      id: 'product-1',
      name: 'Test Product',
      price_per_unit: 100000,
      unit_measure: 'M3',
      stock_quantity: 100
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts)
    })
    ;(createOrder as any).mockResolvedValue({ success: true })
  })

  it('loads and displays products', async () => {
    render(<CreateOrderForm />)

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    render(<CreateOrderForm />)

    // Intentar enviar el formulario vacío
    fireEvent.click(screen.getByText('Crear pedido'))

    await waitFor(() => {
      expect(screen.getByText(/El nombre debe tener al menos 3 caracteres/i)).toBeInTheDocument()
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument()
      expect(screen.getByText(/El teléfono debe tener al menos 7 caracteres/i)).toBeInTheDocument()
      expect(screen.getByText(/El documento debe tener al menos 6 caracteres/i)).toBeInTheDocument()
      expect(screen.getByText(/Debe agregar al menos un producto/i)).toBeInTheDocument()
    })
  })

  it('handles successful order creation', async () => {
    render(<CreateOrderForm />)

    // Llenar los campos requeridos
    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), {
      target: { value: 'Test Customer' }
    })
    fireEvent.change(screen.getByPlaceholderText('CC/NIT 123456789'), {
      target: { value: 'CC123456789' }
    })
    fireEvent.change(screen.getByPlaceholderText('juan@ejemplo.com'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('300 123 4567'), {
      target: { value: '1234567890' }
    })

    // Agregar un producto
    await waitFor(() => {
      const quantityInput = screen.getByRole('spinbutton')
      fireEvent.change(quantityInput, { target: { value: '10' } })
    })

    // Enviar el formulario
    fireEvent.click(screen.getByText('Crear pedido'))

    await waitFor(() => {
      expect(createOrder).toHaveBeenCalled()
    })
  })

  it('handles delivery scheduling', async () => {
    render(<CreateOrderForm />)

    // Activar programación de entrega
    const schedulingCheckbox = screen.getByRole('checkbox')
    fireEvent.click(schedulingCheckbox)

    // Verificar que aparece el calendario
    await waitFor(() => {
      expect(screen.getByText(/Selecciona una fecha/i)).toBeInTheDocument()
    })
  })

  it('handles delivery address for delivery option', async () => {
    render(<CreateOrderForm />)

    // Seleccionar entrega a domicilio
    const deliverySelect = screen.getByRole('combobox')
    fireEvent.click(deliverySelect)
    fireEvent.click(screen.getByText('Entrega a domicilio'))

    // Verificar que aparece el campo de dirección
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Calle 123/i)).toBeInTheDocument()
    })
  })

  it('calculates total amount correctly', async () => {
    render(<CreateOrderForm />)

    // Agregar cantidad de producto
    await waitFor(() => {
      const quantityInput = screen.getByRole('spinbutton')
      fireEvent.change(quantityInput, { target: { value: '10' } })
    })

    // Verificar que el total se calcula correctamente
    await waitFor(() => {
      expect(screen.getByText('$1,000,000')).toBeInTheDocument()
    })
  })
})
