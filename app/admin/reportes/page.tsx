'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Download, Loader2, RefreshCw } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"

export default function ReportsPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    monthlySales: false,
    topProducts: false,
    pendingOrders: false,
  })
  const [reports, setReports] = useState<Record<string, any>>({
    monthlySales: null,
    topProducts: null,
    pendingOrders: null,
  })

  const fetchReport = async (type: string) => {
    setIsLoading((prev) => ({ ...prev, [type]: true }))
    
    try {
      const dateParam = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(`/api/admin/reports/${type}?date=${dateParam}`)
      
      if (!response.ok) {
        throw new Error(`Error al obtener reporte: ${response.statusText}`)
      }
      
      const data = await response.json()
      setReports((prev) => ({ ...prev, [type]: data.report }))
      
    } catch (error) {
      console.error(`Error fetching ${type} report:`, error)
      toast.error(`Error al cargar el reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsLoading((prev) => ({ ...prev, [type]: false }))
    }
  }
  
  const generateDownload = (type: string) => {
    const report = reports[type]
    if (!report) return
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"
    
    if (type === 'monthlySales') {
      // Add headers
      csvContent += "Número de Orden,Cliente,Email,Total,Estado de Pago,Estado de Orden,Fecha\n"
      
      // Add data rows
      report.data.forEach((order: any) => {
        csvContent += `${order.order_number},`
        csvContent += `"${order.customer_name}",`
        csvContent += `${order.customer_email},`
        csvContent += `${order.total_amount},`
        csvContent += `${order.payment_status},`
        csvContent += `${order.order_status},`
        csvContent += `${new Date(order.createdAt).toLocaleDateString('es-CO')}\n`
      })
    } else if (type === 'topProducts') {
      // Add headers
      csvContent += "Producto,Unidad de Medida,Cantidad Total,Ingresos Totales,Número de Órdenes\n"
      
      // Add data rows
      report.data.forEach((product: any) => {
        csvContent += `"${product.name}",`
        csvContent += `${product.unit_measure},`
        csvContent += `${product.totalQuantity},`
        csvContent += `${product.totalRevenue},`
        csvContent += `${product.orderCount}\n`
      })
    } else if (type === 'pendingOrders') {
      // Add headers
      csvContent += "Número de Orden,Cliente,Email,Teléfono,Total,Estado de Pago,Estado de Orden,Requiere Programación,Fecha\n"
      
      // Add data rows
      report.data.forEach((order: any) => {
        csvContent += `${order.order_number},`
        csvContent += `"${order.customer_name}",`
        csvContent += `${order.customer_email},`
        csvContent += `${order.customer_phone},`
        csvContent += `${order.total_amount},`
        csvContent += `${order.payment_status},`
        csvContent += `${order.order_status},`
        csvContent += `${order.requires_scheduling ? 'Sí' : 'No'},`
        csvContent += `${new Date(order.createdAt).toLocaleDateString('es-CO')}\n`
      })
    }
    
    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${report.title.replace(/\s/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("Reporte descargado correctamente")
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
          <p className="text-muted-foreground">
            Generación y descarga de reportes de ventas y operaciones
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "MMMM yyyy", { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Report */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Reporte detallado de ventas del mes seleccionado con información de clientes y estados de pago.
            </p>
            
            {reports.monthlySales && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-lg">{reports.monthlySales.title}</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Órdenes</span>
                    <span className="font-medium">{reports.monthlySales.summary.totalOrders}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Ingresos Totales</span>
                    <span className="font-medium">{formatPrice(reports.monthlySales.summary.totalRevenue)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Pagadas</span>
                    <span className="font-medium">{reports.monthlySales.summary.paidOrders}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Ingresos Pagados</span>
                    <span className="font-medium">{formatPrice(reports.monthlySales.summary.paidRevenue)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => fetchReport('monthlySales')}
              disabled={isLoading.monthlySales}
            >
              {isLoading.monthlySales ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generar
                </>
              )}
            </Button>
            <Button 
              onClick={() => generateDownload('monthlySales')} 
              disabled={!reports.monthlySales || isLoading.monthlySales}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </CardFooter>
        </Card>
        
        {/* Top Products Report */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Reporte de productos ordenados por cantidad vendida e ingresos generados.
            </p>
            
            {reports.topProducts && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-lg">{reports.topProducts.title}</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Total Productos</span>
                    <span className="font-medium">{reports.topProducts.summary.totalProducts}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Ingresos Totales</span>
                    <span className="font-medium">{formatPrice(reports.topProducts.summary.totalRevenue)}</span>
                  </div>
                </div>
                
                {reports.topProducts.data.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Top 3 Productos:</h4>
                    {reports.topProducts.data.slice(0, 3).map((product: any, i: number) => (
                      <div key={product.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{i + 1}.</span>
                          <span>{product.name}</span>
                        </div>
                        <span>{formatPrice(product.totalRevenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => fetchReport('topProducts')}
              disabled={isLoading.topProducts}
            >
              {isLoading.topProducts ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generar
                </>
              )}
            </Button>
            <Button 
              onClick={() => generateDownload('topProducts')} 
              disabled={!reports.topProducts || isLoading.topProducts}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </CardFooter>
        </Card>
        
        {/* Pending Orders Report */}
        <Card>
          <CardHeader>
            <CardTitle>Órdenes Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Reporte de órdenes que requieren atención, incluye órdenes creadas, confirmadas y programadas.
            </p>
            
            {reports.pendingOrders && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-lg">{reports.pendingOrders.title}</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Total Pendientes</span>
                    <span className="font-medium">{reports.pendingOrders.summary.totalPending}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Requieren Programación</span>
                    <span className="font-medium">{reports.pendingOrders.summary.requiresScheduling}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Pendientes de Pago</span>
                    <span className="font-medium">{reports.pendingOrders.summary.pendingPayment}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => fetchReport('pendingOrders')}
              disabled={isLoading.pendingOrders}
            >
              {isLoading.pendingOrders ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generar
                </>
              )}
            </Button>
            <Button 
              onClick={() => generateDownload('pendingOrders')} 
              disabled={!reports.pendingOrders || isLoading.pendingOrders}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
