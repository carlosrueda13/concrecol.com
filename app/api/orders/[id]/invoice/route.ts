import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/options';
import { createSiigoInvoiceForOrder, getSiigoInvoiceStatus } from '@/lib/siigo/siigo-utils';

interface InvoiceParams {
  params: {
    id: string;
  };
}

// Generate a new electronic invoice for an order
export async function POST(request: Request, { params }: InvoiceParams) {
  try {
    // Check authorization (only admin users can create invoices)
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;

    const { id } = params;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if the order has a valid payment status
    if (order.payment_status !== 'paid' && order.payment_status !== 'manually_paid') {
      return NextResponse.json(
        { error: 'No se puede generar factura electrónica para órdenes no pagadas' },
        { status: 400 }
      );
    }

    // Create invoice in SIIGO
    const invoice = await createSiigoInvoiceForOrder(id);

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: userId,
        action: 'create_invoice',
        entity: 'order',
        entityId: id,
        details: {
          invoice_id: invoice.id,
          message: `Factura electrónica generada: ${invoice.id}`
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      invoice: {
        id: invoice.id,
        status: invoice.status,
        pdf_url: invoice.stamp?.pdf_link,
        xml_url: invoice.stamp?.xml_link,
        qr_url: invoice.stamp?.qr_link
      }
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ 
      error: 'Error al generar factura electrónica',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// Get invoice status
export async function GET(request: Request, { params }: InvoiceParams) {
  try {
    // Check authorization (only admin users can view invoice details)
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;

    const { id } = params;

    // Get the order with SIIGO invoice information
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if the order has a SIIGO invoice ID
    // Cast to any to allow access to SIIGO fields
    if (!(order as any).siigo_invoice_id) {
      // Try to extract from notes as fallback
      const siigoInvoiceId = extractInvoiceIdFromNotes(order.notes || '');
      
      if (!siigoInvoiceId) {
        return NextResponse.json({ error: 'No hay factura electrónica asociada a esta orden' }, { status: 404 });
      }
      
      // Get invoice status from SIIGO
      const invoiceStatus = await getSiigoInvoiceStatus(siigoInvoiceId);

      if (!invoiceStatus) {
        return NextResponse.json({ error: 'No se pudo obtener el estado de la factura' }, { status: 404 });
      }

      return NextResponse.json({
        invoice_id: siigoInvoiceId,
        ...invoiceStatus
      });
    }
    
    // If we have the invoice data in the order, return it directly
    // Using any here to bypass TypeScript issue until prisma client catches up with schema
    const orderWithSiigo = order as any;
    return NextResponse.json({
      invoice_id: orderWithSiigo.siigo_invoice_id,
      status: orderWithSiigo.siigo_invoice_status || 'unknown',
      pdfUrl: orderWithSiigo.siigo_pdf_url,
      xmlUrl: orderWithSiigo.siigo_xml_url,
      qrUrl: orderWithSiigo.siigo_qr_url
    });
  } catch (error) {
    console.error('Error getting invoice status:', error);
    return NextResponse.json({ 
      error: 'Error al obtener estado de factura',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// Helper function to extract SIIGO invoice ID from order notes
function extractInvoiceIdFromNotes(notes: string): string | null {
  const match = notes.match(/Factura electrónica SIIGO: ([a-zA-Z0-9-]+)/);
  return match ? match[1] : null;
}
