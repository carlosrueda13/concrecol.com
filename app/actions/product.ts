'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/options'
import { productSchema, productUpdateSchema, type ProductFormData } from '@/lib/validations/product'
import { createAuditLog } from '@/lib/audit'

const prisma = new PrismaClient()

function normalizeText(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function normalizeApplications(value: string[] | undefined): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => item.trim()).filter((item) => item !== '')
}

export async function createProduct(data: ProductFormData) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error('No autorizado')
  }

  try {
    // Validate data
    const validatedData = productSchema.parse(data)

    // Create product
    const product = await prisma.product.create({
      data: {
        ...validatedData,
        description: normalizeText(validatedData.description),
        applications: normalizeApplications(validatedData.applications),
        advantages: normalizeText(validatedData.advantages),
        specifications: normalizeText(validatedData.specifications),
      },
    })

    // Log action
    await createAuditLog({
      adminId: session.user.id,
      action: 'product_create',
      entity: 'Product',
      entityId: product.id,
      details: validatedData
    })

    revalidatePath('/admin/productos')
    return { success: true, product }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Error al crear el producto' }
  }
}

export async function updateProduct(id: string, data: Partial<ProductFormData>) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error('No autorizado')
  }

  try {
    // Validate data
    const validatedData = productUpdateSchema.parse(data)

    // Normalize the optional fields without overwriting omitted ones
    const updateData = { ...validatedData }

    if (validatedData.description !== undefined) {
      updateData.description = normalizeText(validatedData.description)
    }
    if (validatedData.applications !== undefined) {
      updateData.applications = normalizeApplications(validatedData.applications)
    }
    if (validatedData.advantages !== undefined) {
      updateData.advantages = normalizeText(validatedData.advantages)
    }
    if (validatedData.specifications !== undefined) {
      updateData.specifications = normalizeText(validatedData.specifications)
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    })

    // Log action
    await createAuditLog({
      adminId: session.user.id,
      action: 'product_update',
      entity: 'Product',
      entityId: product.id,
      details: validatedData
    })

    revalidatePath('/admin/productos')
    return { success: true, product }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Error al actualizar el producto' }
  }
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error('No autorizado')
  }

  try {
    // Soft delete product
    const product = await prisma.product.update({
      where: { id },
      data: { is_active: false }
    })

    // Log action
    await createAuditLog({
      adminId: session.user.id,
      action: 'product_delete',
      entity: 'Product',
      entityId: product.id,
      details: { productId: id }
    })

    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Error al eliminar el producto' }
  }
}

export async function getCategories() {
  const categories = await prisma.sqlCategory.findMany({
    where: { is_active: true },
    orderBy: { name: 'asc' },
  })
  return categories
}