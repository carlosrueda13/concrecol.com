export type AuditAction = 
  | 'product_create'
  | 'product_update'
  | 'product_delete'
  | 'order_create'
  | 'order_update'
  | 'order_status_change'
  | 'category_create'
  | 'category_update'
  | 'category_delete'
  | 'test_action'  // Para pruebas
  | 'minimal_action'  // Para pruebas
  | 'action1'  // Para pruebas
  | 'action2'  // Para pruebas
  | 'action3'  // Para pruebas

export interface AuditLogData {
  adminId: string
  action: AuditAction
  entity: string
  entityId?: string
  details?: Record<string, any>
}
