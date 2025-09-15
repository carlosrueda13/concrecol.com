import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductForm } from '@/components/admin/product-form'

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock the server actions
vi.mock('@/app/actions/product', () => ({
  createProduct: vi.fn(() => Promise.resolve({ success: true })),
  updateProduct: vi.fn(() => Promise.resolve({ success: true })),
}))

const mockCategories = [
  { id: '1', name: 'Concreto', slug: 'concreto' },
  { id: '2', name: 'Cemento', slug: 'cemento' }
]

// Mock the server actions
vi.mock('@/app/actions/product', () => ({
  createProduct: vi.fn(() => Promise.resolve({ success: true })),
  updateProduct: vi.fn(() => Promise.resolve({ success: true }))
}))

describe('ProductForm', () => {
  it('renders all form fields', () => {
    render(<ProductForm categories={mockCategories} />)

    // Check text inputs
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/precio por unidad/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/stock/i)).toBeInTheDocument()

    // Check select components (Radix UI renders these as buttons with role="combobox")
    const comboboxes = screen.getAllByRole('combobox')
    expect(comboboxes).toHaveLength(2)

    // Check switches
    expect(screen.getByRole('switch', { name: /requiere programación/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /activo/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<ProductForm categories={mockCategories} />)
    
    const submitButton = screen.getByRole('button', { name: /crear producto/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el nombre debe tener al menos 3 caracteres/i)).toBeInTheDocument()
      expect(screen.getByText(/el slug debe tener al menos 3 caracteres/i)).toBeInTheDocument()
    })
  })

  it('submits the form with valid data', async () => {
    const { createProduct } = await import('@/app/actions/product')
    render(<ProductForm categories={mockCategories} />)

    // Fill text inputs
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Concreto Test')
    await userEvent.type(screen.getByLabelText(/slug/i), 'concreto-test')
    await userEvent.type(screen.getByLabelText(/precio por unidad/i), '120000')
    await userEvent.type(screen.getByLabelText(/stock/i), '100')

    // Fill unit measure select
    const comboboxes = screen.getAllByRole('combobox')
    const [unitSelect, categorySelect] = comboboxes
    
    // Select unit measure
    await userEvent.click(unitSelect)
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('option', { name: /metro cúbico/i }))

    // Select category
    await userEvent.click(categorySelect)
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('option', { name: 'Concreto' }))

    const submitButton = screen.getByRole('button', { name: /crear producto/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(createProduct).toHaveBeenCalledWith({
        name: 'Concreto Test',
        slug: 'concreto-test',
        price_per_unit: 120000,
        stock_quantity: 100,
        sqlCategoryId: '1',
        unit_measure: 'M3',
        images: [],
        is_active: true,
        requires_scheduling: false
      })
    })
  })
})
