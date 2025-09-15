import { test, expect } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/admin.json' })

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
  })

  test('should display admin dashboard', async ({ page }) => {
    await expect(page.getByText('Concrecol Admin')).toBeVisible()
  })

  test('should manage products successfully', async ({ page }) => {
    // Navigate to products
    await page.goto('/admin/productos')
    await expect(page.getByRole('heading', { name: /productos/i })).toBeVisible()

    // Create new product
    await page.getByRole('link', { name: /nuevo producto/i }).click()
    await expect(page).toHaveURL('/admin/productos/nuevo')

    // Fill product form
    await page.getByLabel('Nombre').fill('Producto Test E2E')
    await page.getByLabel('Slug').fill('producto-test-e2e')
    await page.getByLabel('Precio por unidad').fill('50000')
    await page.getByLabel('Stock').fill('100')
    
    // Select unit measure
    await page.getByRole('combobox', { name: /unidad de medida/i }).click()
    await page.getByRole('option', { name: /metro cúbico/i }).click()

    // Select category (assuming Concreto exists from seed)
    await page.getByRole('combobox', { name: /categoría/i }).click()
    await page.getByRole('option', { name: /concreto/i }).click()

    // Toggle switches
    await page.getByRole('switch', { name: /requiere programación/i }).click()
    await page.getByRole('switch', { name: /activo/i }).click() // By default it's active, so this will make it inactive

    // Submit form
    await page.getByRole('button', { name: /crear producto/i }).click()

    // Verify success message and navigation
    await expect(page.getByText(/producto.*creado/i)).toBeVisible()
    await expect(page).toHaveURL('/admin/productos')

    // Verify product appears in list
    await expect(page.getByText('Producto Test E2E')).toBeVisible()
  })

  test('should handle product validation errors', async ({ page }) => {
    // Go to new product page
    await page.goto('/admin/productos/nuevo')

    // Try to submit empty form
    await page.getByRole('button', { name: /crear producto/i }).click()

    // Verify validation errors
    await expect(page.getByText(/el nombre debe tener al menos 3 caracteres/i)).toBeVisible()
    await expect(page.getByText(/el slug debe tener al menos 3 caracteres/i)).toBeVisible()
    await expect(page.getByText(/seleccione una categoría/i)).toBeVisible()
  })

  test('should validate price and stock fields', async ({ page }) => {
    // Go to new product page
    await page.goto('/admin/productos/nuevo')

    // Try invalid price and stock
    await page.getByLabel('Precio por unidad').fill('-100')
    await page.getByLabel('Stock').fill('-1')
    await page.getByRole('button', { name: /crear producto/i }).click()

    // Verify validation errors
    await expect(page.getByText(/el precio debe ser mayor a 0/i)).toBeVisible()
    await expect(page.getByText(/el stock debe ser mayor o igual a 0/i)).toBeVisible()

    // Fix values and verify errors disappear
    await page.getByLabel('Precio por unidad').fill('100000')
    await page.getByLabel('Stock').fill('10')
    
    // Errors should disappear
    await expect(page.getByText(/el precio debe ser mayor a 0/i)).not.toBeVisible()
    await expect(page.getByText(/el stock debe ser mayor o igual a 0/i)).not.toBeVisible()
  })
})
