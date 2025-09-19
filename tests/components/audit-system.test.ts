import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { createAuditLog, type AuditAction, type AuditLogData } from '@/lib/audit'

describe('Audit System', () => {
  const testAdminId = 'test-admin-id'
  let testEntityId: string

  beforeAll(async () => {
    // Crear una entidad de prueba
    const category = await prisma.sqlCategory.create({
      data: {
        name: 'Audit Test Category',
        slug: 'audit-test-category'
      }
    })
    testEntityId = category.id
  })

  afterAll(async () => {
    // Limpieza
    await prisma.auditLog.deleteMany({
      where: {
        adminId: testAdminId
      }
    })
    await prisma.sqlCategory.delete({
      where: {
        id: testEntityId
      }
    })
  })

  it('should create an audit log entry', async () => {
    const logData: AuditLogData = {
      adminId: testAdminId,
      action: 'test_action' as AuditAction,
      entity: 'TestEntity',
      entityId: testEntityId,
      details: { test: 'data' }
    }

    await createAuditLog(logData)

    const log = await prisma.auditLog.findFirst({
      where: {
        adminId: testAdminId,
        action: 'test_action'
      }
    })

    expect(log).toBeDefined()
    expect(log?.entity).toBe('TestEntity')
    expect(log?.entityId).toBe(testEntityId)
    expect(log?.details).toEqual({ test: 'data' })
  })

  it('should handle missing optional fields', async () => {
    const logData: AuditLogData = {
      adminId: testAdminId,
      action: 'minimal_action',
      entity: 'TestEntity'
    }

    await createAuditLog(logData)

    const log = await prisma.auditLog.findFirst({
      where: {
        adminId: testAdminId,
        action: 'minimal_action'
      }
    })

    expect(log).toBeDefined()
    expect(log?.entityId).toBeNull()
    expect(log?.details).toBeNull()
  })

  it('should create multiple logs in order', async () => {
    const actions = ['action1', 'action2', 'action3']

    for (const action of actions) {
      await createAuditLog({
        adminId: testAdminId,
        action: action as AuditAction,
        entity: 'TestEntity'
      })
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        adminId: testAdminId,
        action: {
          in: actions
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    expect(logs).toHaveLength(actions.length)
    expect(logs.map(log => log.action)).toEqual(actions)
  })
})
