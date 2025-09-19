'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { categorySchema, type CategoryFormData } from '@/lib/validations/category'
import { createAuditLog } from '@/lib/audit'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/options'

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

    // Revalidamos tanto la página de admin como las páginas de cliente
    revalidatePath('/admin/categorias')
    revalidatePath('/productos')
    revalidatePath('/')
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

    // Revalidamos tanto la página de admin como las páginas de cliente
    revalidatePath('/admin/categorias')
    revalidatePath('/productos')
    revalidatePath('/')
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
    
    // Primero verificamos si hay productos asociados con esta categoría
    const productsCount = await prisma.product.count({
      where: { sqlCategoryId: id }
    });
    
    console.log(`Encontrados ${productsCount} productos asociados a la categoría ${id}`);

    // Verificamos si hay elementos en el carrito que usan productos de esta categoría
    const cartItemsWithProducts = await prisma.cartItem.findMany({
      where: {
        product: {
          sqlCategoryId: id
        }
      },
      include: {
        product: true
      }
    });
    
    console.log(`Encontrados ${cartItemsWithProducts.length} items de carrito con productos de esta categoría`);

    // Si hay items en carrito con estos productos, primero los eliminamos
    if (cartItemsWithProducts.length > 0) {
      const cartItemIds = cartItemsWithProducts.map(item => item.id);
      await prisma.cartItem.deleteMany({
        where: {
          id: {
            in: cartItemIds
          }
        }
      });
      console.log(`Eliminados ${cartItemIds.length} items de carrito`);
    }

    // Verificamos si hay elementos en órdenes que usan productos de esta categoría
    const orderItemsWithProducts = await prisma.orderItem.findMany({
      where: {
        product: {
          sqlCategoryId: id
        }
      },
      include: {
        product: true,
        order: true
      }
    });
    
    console.log(`Encontrados ${orderItemsWithProducts.length} items de órdenes con productos de esta categoría`);
    
    // Si hay pedidos con estos productos, alertamos sobre esto
    if (orderItemsWithProducts.length > 0) {
      throw new Error(`No se puede eliminar la categoría porque hay ${orderItemsWithProducts.length} productos en órdenes existentes. Debes eliminar o modificar estas órdenes primero.`);
    }

    // Ahora podemos eliminar los productos
    const deletedProducts = await prisma.product.deleteMany({
      where: { sqlCategoryId: id },
    });
    
    console.log(`Eliminados ${deletedProducts.count} productos`);

    // Luego eliminamos la categoría
    const category = await prisma.sqlCategory.delete({
      where: { id },
    });
    
    console.log(`Categoría ${category.name} eliminada con éxito`);

    await createAuditLog({
      adminId: session.user.id,
      action: 'category_delete',
      entity: 'SqlCategory',
      entityId: category.id,
      details: {
        deletedProductsCount: deletedProducts.count,
        categoryName: category.name
      },
    });

    // Revalidamos tanto la página de admin como las páginas de cliente
    revalidatePath('/admin/categorias');
    revalidatePath('/productos');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Error detallado al eliminar categoría:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar la categoría',
    };
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
