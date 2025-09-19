import { prisma } from './prisma'

export type AuditAction =
  | 'login'
  | 'login_failed'
  | 'product_create'
  | 'product_update'
  | 'product_delete'
  | 'order_create'
  | 'order_update'
  | 'order_delete'
  | 'order_status_change'
  | 'order_paid'
  | 'payment_failed'
  | 'category_create'
  | 'category_update'
  | 'category_delete'
  // Acciones para pruebas
  | 'test_action'
  | 'minimal_action'
  | 'action1'
  | 'action2'
  | 'action3'

export interface AuditLogData {
  adminId?: string // Optional for system-generated logs
  action: AuditAction
  entity: string
  entityId?: string
  details?: Record<string, unknown>
}

export async function createAuditLog({
  adminId,
  action,
  entity,
  entityId,
  details
}: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: adminId || 'system',
        action,
        entity,
        entityId,
        details: details ? (details as any) : undefined,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export async function getAuditLogs(limit = 50) {
  return prisma.auditLog.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    }
  })
}
