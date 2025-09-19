'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceData {
  invoice_id: string;
  status: string;
  pdfUrl?: string;
  xmlUrl?: string;
  qrUrl?: string;
}

export default function OrderInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [orderData, setOrderData] = useState<{
    id: string;
    order_number: string;
    customer_name: string;
    payment_status: string;
  } | null>(null);

  // Function to check if order has invoice
  useEffect(() => {
    const fetchInvoiceStatus = async () => {
      try {
        setIsLoading(true);
        
        // First fetch the order details
        const orderResponse = await fetch(`/api/orders/${params.id}`);
        if (!orderResponse.ok) {
          throw new Error('Error al cargar la orden');
        }
        
        const order = await orderResponse.json();
        setOrderData(order);
        
        // Then check if it has an invoice
        const invoiceResponse = await fetch(`/api/orders/${params.id}/invoice`);
        
        if (invoiceResponse.ok) {
          const data = await invoiceResponse.json();
          setInvoiceData(data);
        } else {
          // No invoice yet, that's ok
          setInvoiceData(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvoiceStatus();
  }, [params.id]);

  // Function to generate invoice
  const generateInvoice = async () => {
    try {
      setIsGenerating(true);
      
      const response = await fetch(`/api/orders/${params.id}/invoice`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Error al generar factura');
      }
      
      const data = await response.json();
      setInvoiceData(data.invoice);
      toast.success('Factura electrónica generada exitosamente');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(`Error al generar factura: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to refresh status
  const refreshStatus = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/orders/${params.id}/invoice`);
      
      if (response.ok) {
        const data = await response.json();
        setInvoiceData(data);
        toast.success('Estado actualizado');
      } else {
        toast.error('No se pudo obtener el estado de la factura');
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
      toast.error('Error al actualizar estado');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Orden no encontrada</h2>
        <p className="text-muted-foreground mt-2">No se pudo encontrar la información de esta orden</p>
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/ordenes')}
          className="mt-6"
        >
          Volver a órdenes
        </Button>
      </div>
    );
  }

  const isPaid = orderData.payment_status === 'paid' || orderData.payment_status === 'manually_paid';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Facturación electrónica
          </h2>
          <p className="text-muted-foreground mt-2">
            Orden #{orderData.order_number}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/admin/ordenes/${params.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la orden
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Factura electrónica SIIGO</CardTitle>
          <CardDescription>
            {!invoiceData 
              ? 'Genera la factura electrónica para esta orden' 
              : `Factura #${invoiceData.invoice_id}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order details */}
          <div className="grid gap-2">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Cliente:</span>
              <span>{orderData.customer_name}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Estado de pago:</span>
              <span>{isPaid ? 'Pagado' : 'Pendiente'}</span>
            </div>
          </div>
          
          {/* Invoice status */}
          {invoiceData && (
            <>
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Estado de factura</h3>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">ID Factura:</span>
                    <span>{invoiceData.invoice_id}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Estado:</span>
                    <span>{
                      invoiceData.status === 'stamped' ? 'Emitida' : 
                      invoiceData.status === 'processing' ? 'En procesamiento' :
                      invoiceData.status === 'failed' ? 'Error' : invoiceData.status
                    }</span>
                  </div>
                </div>
              </div>
              
              {/* Invoice documents */}
              {invoiceData.pdfUrl && (
                <div className="space-y-4 pt-2">
                  <a 
                    href={invoiceData.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText size={16} />
                    Ver PDF de factura electrónica
                  </a>
                  
                  {invoiceData.xmlUrl && (
                    <a 
                      href={invoiceData.xmlUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <FileText size={16} />
                      Descargar XML
                    </a>
                  )}
                </div>
              )}
              
              {/* Error message */}
              {invoiceData.status === 'failed' && (
                <div className="rounded-md bg-red-50 p-4 border border-red-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Error en la facturación electrónica</p>
                      <p className="text-sm text-red-700 mt-1">
                        Ocurrió un error al generar la factura. Por favor, intente nuevamente o contacte soporte.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Instructions when no invoice */}
          {!invoiceData && !isPaid && (
            <div className="rounded-md bg-amber-50 p-4 border border-amber-100">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Orden no pagada</p>
                  <p className="text-sm text-amber-700 mt-1">
                    No se puede generar una factura electrónica para órdenes que no están pagadas.
                    Actualice el estado de pago antes de generar la factura.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Processing message */}
          {invoiceData && invoiceData.status === 'processing' && (
            <div className="rounded-md bg-blue-50 p-4 border border-blue-100">
              <div className="flex items-start gap-2">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <div>
                  <p className="font-medium text-blue-800">Factura en procesamiento</p>
                  <p className="text-sm text-blue-700 mt-1">
                    La factura electrónica está siendo procesada por SIIGO. Este proceso puede tomar unos minutos.
                    Puede actualizar el estado para verificar si ya está disponible.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/admin/ordenes/${params.id}`)}
          >
            Volver
          </Button>
          <div className="space-x-2">
            {invoiceData && (
              <Button 
                variant="outline" 
                onClick={refreshStatus} 
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                {isLoading ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" /> 
                ) : (
                  <RefreshCw className="mr-1 h-4 w-4" />
                )}
                Actualizar estado
              </Button>
            )}
            
            {!invoiceData && isPaid && (
              <Button 
                onClick={generateInvoice} 
                disabled={isGenerating || !isPaid}
              >
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generar factura electrónica
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
