import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const productsCount = await prisma.product.count()
  const ordersCount = await prisma.order.count()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{productsCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ordersCount}</div>
        </CardContent>
      </Card>
    </div>
  )
}
