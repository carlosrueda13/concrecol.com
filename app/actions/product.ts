'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { productSchema, productUpdateSchema, type ProductFormData } from '@/lib/validations/product'
import { createAuditLog } from '@/lib/audit'

const prisma = new PrismaClient()

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
      data: validatedData,
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

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: validatedData,
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
    // Delete product
    const product = await prisma.product.delete({
      where: { id },
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