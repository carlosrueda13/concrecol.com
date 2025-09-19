import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/options'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function LogsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const logs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  })

  function formatAction(action: string) {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Registro de Actividad</h1>
        <p className="text-muted-foreground">
          Últimas 100 acciones realizadas en el sistema
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {format(new Date(log.createdAt), 'PPpp', { locale: es })}
                </TableCell>
                <TableCell>{log.adminId}</TableCell>
                <TableCell>{formatAction(log.action)}</TableCell>
                <TableCell>{log.entity}</TableCell>
                <TableCell>
                  {log.details ? (
                    <pre className="text-xs">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
