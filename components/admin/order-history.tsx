'use client'

import { useState, useEffect } from 'react'
import { formatDateTime } from '@/lib/utils'

interface AuditLogEntry {
  id: string
  adminId: string
  action: string
  entity: string
  entityId: string
  details: any
  createdAt: Date
}

interface OrderHistoryProps {
  orderId: string
}

export function OrderHistory({ orderId }: OrderHistoryProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/admin/logs?entity=order&entityId=${orderId}`)
        if (!response.ok) throw new Error('Failed to fetch logs')
        const data = await response.json()
        setLogs(data)
      } catch (error) {
        console.error('Error fetching logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [orderId])

  const getActionDescription = (log: AuditLogEntry) => {
    switch (log.action) {
      case 'update':
        return `Estado cambiado de "${log.details.oldStatus}" a "${log.details.newStatus}"`
      case 'generate_payment_link':
        return 'Link de pago generado'
      case 'create':
        return 'Orden creada'
      case 'payment_update':
        return `Estado de pago cambiado a "${log.details.newStatus}"`
      default:
        return log.action
    }
  }

  if (loading) {
    return <div className="text-center py-4">Cargando historial...</div>
  }

  if (logs.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No hay registros disponibles</div>
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Historial de Cambios</h3>
      <div className="border rounded-md divide-y">
        {logs.map((log) => (
          <div key={log.id} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{getActionDescription(log)}</p>
                <p className="text-sm text-muted-foreground">Por: {log.adminId}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDateTime(new Date(log.createdAt))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
