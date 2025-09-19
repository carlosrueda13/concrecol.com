import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { createProduct, updateProduct, deleteProduct } from '@/app/actions/product'
import { UnitMeasure } from '@prisma/client'
import { createAuditLog } from '@/lib/audit'

// Mock de NextAuth
vi.mock('next-auth', () => {
  return {
    default: vi.fn(),
    getServerSession: vi.fn(() => ({
      user: {
        id: 'test-admin-id',
        email: 'admin@test.com',
        role: 'admin'
      }
    }))
  }
})

// Mock de Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

describe('Product Management', () => {
  let testCategoryId: string
  let testProductId: string

  beforeAll(async () => {
    // Crear categoría de prueba
    const category = await prisma.sqlCategory.create({
      data: {
        name: 'Test Category',
        slug: 'test-category'
      }
    })
    testCategoryId = category.id
  })

  afterAll(async () => {
    // Limpieza
    await prisma.product.deleteMany({
      where: {
        sqlCategoryId: testCategoryId
      }
    })
    await prisma.sqlCategory.delete({
      where: {
        id: testCategoryId
      }
    })
  })

  it('should create a new product', async () => {
    const productData = {
      name: 'Test Product',
      slug: 'test-product',
      price_per_unit: 100000,
      unit_measure: UnitMeasure.M3,
      stock_quantity: 10,
      requires_scheduling: true,
      images: ['https://example.com/test.jpg'],
      is_active: true,
      sqlCategoryId: testCategoryId
    }

    const result = await createProduct(productData)
    expect(result.success).toBe(true)
    expect(result.product).toBeDefined()
    expect(result.product?.name).toBe(productData.name)
    expect(result.product).toBeDefined()
    
    testProductId = result.product!.id
  })

  it('should update an existing product', async () => {
    const updateData = {
      name: 'Updated Test Product',
      price_per_unit: 150000
    }

    const result = await updateProduct(testProductId, updateData)
    expect(result.success).toBe(true)
    expect(result.product).toBeDefined()
    expect(result.product?.name).toBe(updateData.name)
    expect(result.product?.price_per_unit).toBe(updateData.price_per_unit)
  })

  it('should handle invalid product updates', async () => {
    const updateData = {
      price_per_unit: -100 // Precio inválido
    }

    try {
      await updateProduct(testProductId, updateData)
      throw new Error('Should not reach this point')
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it('should create audit logs for product changes', async () => {
    const logs = await prisma.auditLog.findMany({
      where: {
        entityId: testProductId
      }
    })

    expect(logs.length).toBeGreaterThan(0)
    expect(logs.some(log => log.action === 'product_create')).toBe(true)
    expect(logs.some(log => log.action === 'product_update')).toBe(true)
  })

  it('should soft delete a product', async () => {
    const result = await deleteProduct(testProductId)
    expect(result.success).toBe(true)

    const product = await prisma.product.findUnique({
      where: {
        id: testProductId
      }
    })

    expect(product?.is_active).toBe(false)
    expect(product).toBeDefined()
  })
})
