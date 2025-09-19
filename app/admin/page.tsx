import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CalendarIcon, 
  CheckCircle2Icon, 
  Clock, 
  CreditCardIcon, 
  DollarSignIcon, 
  PackageIcon, 
  UsersIcon 
} from "lucide-react"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { SalesChart } from '@/components/admin/sales-chart'
import { ProductsChart } from '@/components/admin/products-chart'
import { OrderStatusCounter } from '@/components/admin/order-status-counter'
import { RecentOrders } from '@/components/admin/recent-orders'

export const revalidate = 0;

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return <div>Cargando...</div>
  }

  // Fetch KPIs and dashboard data
  const [
    productsCount,
    ordersCount,
    orderStatusCounts,
    paymentStatusCounts,
    recentOrders,
    dailyStats,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.groupBy({
      by: ['order_status'],
      _count: {
        id: true
      }
    }),
    prisma.order.groupBy({
      by: ['payment_status'],
      _count: {
        id: true
      }
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.order.groupBy({
      by: ['payment_status'],
      _sum: {
        total_amount: true,
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    }),
  ]);

  // Calculate totals and summaries
  const dailyRevenue = dailyStats
    .filter((stat) => stat.payment_status === 'paid')
    .reduce((sum, stat) => sum + (stat._sum.total_amount || 0), 0);
    
  const pendingScheduling = await prisma.order.count({
    where: {
      requires_scheduling: true,
      order_status: 'created',
    },
  });
  
  // Get total sales (excluding cancelled orders)
  const totalSales = await prisma.order.aggregate({
    _sum: {
      total_amount: true,
    },
    where: {
      order_status: {
        notIn: ['cancelled']
      }
    }
  });
  
  // Get new customers (orders with unique emails in the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const newCustomers = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT customer_email) as count 
    FROM "Order" 
    WHERE "createdAt" >= ${thirtyDaysAgo}
  `;
  
  // Get pending deliveries (orders that are confirmed but not completed)
  const pendingDeliveries = await prisma.order.count({
    where: {
      order_status: {
        in: ['confirmed', 'scheduled']
      }
    }
  });

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="analytics">Analítica</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* KPI Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                <DollarSignIcon className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(totalSales._sum.total_amount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% comparado al mes pasado
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Órdenes Totales</CardTitle>
                <PackageIcon className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ordersCount}</div>
                <p className="text-xs text-muted-foreground">
                  +15% comparado al mes pasado
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(newCustomers as any)[0].count}</div>
                <p className="text-xs text-muted-foreground">
                  +7% en los últimos 30 días
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entregas Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingDeliveries}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingDeliveries > 0 ? 'Requieren atención' : 'Al día'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Sales Chart - Wider */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Ventas Recientes</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <SalesChart />
              </CardContent>
            </Card>
            
            {/* Products Chart - Narrower */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Productos Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductsChart />
              </CardContent>
            </Card>
          </div>
          
          {/* Order Status Counters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Órdenes por Estado</CardTitle>
                <CardDescription>
                  Distribución de órdenes según su estado actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderStatusCounter 
                  orderStatusCounts={orderStatusCounts}
                  paymentStatusCounts={paymentStatusCounts}
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Órdenes Recientes</CardTitle>
                <CardDescription>
                  Últimas 5 órdenes recibidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrders />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>Análisis de Ventas</CardTitle>
                <CardDescription>
                  Comparativa de ventas por período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <SalesChart extended={true} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Disponibles</CardTitle>
              <CardDescription>
                Descarga reportes generados automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">Ventas Mensuales</div>
                  <div className="text-sm text-muted-foreground">Reporte de ventas del mes actual</div>
                </div>
                <button className="text-blue-500 hover:underline">Descargar</button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">Productos Más Vendidos</div>
                  <div className="text-sm text-muted-foreground">Productos ordenados por cantidad vendida</div>
                </div>
                <button className="text-blue-500 hover:underline">Descargar</button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">Órdenes Pendientes</div>
                  <div className="text-sm text-muted-foreground">Listado de órdenes que requieren atención</div>
                </div>
                <button className="text-blue-500 hover:underline">Descargar</button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
