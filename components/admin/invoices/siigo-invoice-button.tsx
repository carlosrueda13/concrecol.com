'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FileText, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface SiigoInvoiceButtonProps {
  orderId: string;
  isPaid: boolean;
}

type InvoiceStatus = 'not_generated' | 'pending' | 'stamped' | 'failed';

interface InvoiceData {
  invoice_id: string;
  status: string;
  pdfUrl?: string;
  xmlUrl?: string;
  qrUrl?: string;
}

export function SiigoInvoiceButton({ orderId, isPaid }: SiigoInvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>('not_generated');
  
  // Function to fetch invoice status
  const checkInvoiceStatus = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/orders/${orderId}/invoice`);
      
      if (response.ok) {
        const data = await response.json();
        setInvoiceData(data);
        setInvoiceStatus(data.status === 'stamped' ? 'stamped' : 'pending');
      } else {
        setInvoiceStatus('not_generated');
        setInvoiceData(null);
      }
    } catch (error) {
      console.error('Error checking invoice status:', error);
      setInvoiceStatus('not_generated');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to create new invoice
  const createInvoice = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Error al generar factura');
      }
      
      const data = await response.json();
      setInvoiceData(data.invoice);
      setInvoiceStatus('pending');
      
      toast.success('Factura electrónica generada exitosamente');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(`Error al generar factura: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle dialog open
  const handleOpen = async () => {
    setIsOpen(true);
    await checkInvoiceStatus();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleOpen}
        >
          <FileText size={16} />
          <span>Factura electrónica</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Factura electrónica SIIGO</DialogTitle>
          <DialogDescription>
            Genera y consulta el estado de la factura electrónica para esta orden.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Invoice Status Display */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Estado:</span>
                  {invoiceStatus === 'not_generated' && (
                    <Badge variant="outline">No generada</Badge>
                  )}
                  {invoiceStatus === 'pending' && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      Pendiente
                    </Badge>
                  )}
                  {invoiceStatus === 'stamped' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Emitida
                    </Badge>
                  )}
                  {invoiceStatus === 'failed' && (
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      Error
                    </Badge>
                  )}
                </div>
                
                {/* Invoice details */}
                {invoiceData && (
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">ID Factura:</span>
                      <span>{invoiceData.invoice_id}</span>
                    </div>
                    
                    {/* Invoice links */}
                    {invoiceData.pdfUrl && (
                      <div className="pt-2">
                        <a 
                          href={invoiceData.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <FileText size={16} /> Ver PDF de factura
                        </a>
                      </div>
                    )}
                    
                    {/* Error message */}
                    {invoiceStatus === 'failed' && (
                      <div className="pt-2 flex items-start gap-2 text-red-600">
                        <AlertCircle size={16} className="mt-0.5" />
                        <span>Ocurrió un error al generar la factura. Contacte soporte.</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Instructions */}
            {!invoiceData && (
              <div className="text-sm text-muted-foreground">
                <p>Puedes generar la factura electrónica para esta orden. Asegúrate de que la orden ya está pagada.</p>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          {!invoiceData && isPaid && (
            <Button 
              onClick={createInvoice} 
              disabled={isLoading || !isPaid}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generar factura electrónica
            </Button>
          )}
          {!isPaid && (
            <div className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={16} />
              <span>La orden debe estar pagada para generar la factura</span>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
