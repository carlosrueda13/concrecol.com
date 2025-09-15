'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { categorySchema, type CategoryFormData } from '@/lib/validations/category'
import { createAuditLog } from '@/lib/audit'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'

export async function createCategory(data: CategoryFormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('No autorizado')
    }

    const validatedData = categorySchema.parse(data)

    const category = await prisma.sqlCategory.create({
      data: validatedData,
    })

    await createAuditLog({
      adminId: session.user.id,
      action: 'category_create',
      entity: 'SqlCategory',
      entityId: category.id,
      details: validatedData,
    })

    revalidatePath('/admin/categorias')
    return { success: true }
  } catch (error) {
    console.error('Error creating category:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear la categoría',
    }
  }
}

export async function updateCategory(id: string, data: CategoryFormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('No autorizado')
    }

    const validatedData = categorySchema.parse(data)

    const category = await prisma.sqlCategory.update({
      where: { id },
      data: validatedData,
    })

    await createAuditLog({
      adminId: session.user.id,
      action: 'category_update',
      entity: 'SqlCategory',
      entityId: category.id,
      details: validatedData,
    })

    revalidatePath('/admin/categorias')
    return { success: true }
  } catch (error) {
    console.error('Error updating category:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar la categoría',
    }
  }
}

export async function deleteCategory(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('No autorizado')
    }

    const category = await prisma.sqlCategory.delete({
      where: { id },
    })

    await createAuditLog({
      adminId: session.user.id,
      action: 'category_delete',
      entity: 'SqlCategory',
      entityId: category.id,
    })

    revalidatePath('/admin/categorias')
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar la categoría',
    }
  }
}

export async function getCategories() {
  try {
    return await prisma.sqlCategory.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}
