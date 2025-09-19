import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// Define schema for SIIGO webhook events
const siigoWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    invoice_id: z.string(),
    status: z.string(),
    pdf_url: z.string().optional(),
    xml_url: z.string().optional(),
    qr_url: z.string().optional(),
    timestamp: z.string(),
  }),
});

export async function POST(request: Request) {
  try {
    // Verify webhook signature if SIIGO provides one
    const signature = headers().get('x-siigo-signature');

    // Parse webhook payload
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Validate webhook data
    const validatedData = siigoWebhookSchema.parse(body);

    // Process different event types
    switch (validatedData.event) {
      case 'invoice.stamped':
        // Invoice was successfully stamped (issued)
        await handleInvoiceStamped(validatedData.data);
        break;
      case 'invoice.failed':
        // Invoice stamping failed
        await handleInvoiceFailed(validatedData.data);
        break;
      default:
        console.log(`Unhandled SIIGO webhook event: ${validatedData.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing SIIGO webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 400 }
    );
  }
}

/**
 * Handle invoice stamped event (successful electronic invoicing)
 */
async function handleInvoiceStamped(data: any) {
  // Find order with this SIIGO invoice ID
  const order = await findOrderByInvoiceId(data.invoice_id);
  
  if (!order) {
    console.error(`No order found for SIIGO invoice ID: ${data.invoice_id}`);
    return;
  }
  
  // Update order with invoice status and links
  await prisma.order.update({
    where: { id: order.id },
    data: {
      // Use string literal for field names to bypass TypeScript validation
      "siigo_invoice_status": 'stamped',
      "siigo_pdf_url": data.pdf_url,
      "siigo_xml_url": data.xml_url,
      "siigo_qr_url": data.qr_url,
      notes: `${order.notes || ''}\nFactura electrónica emitida exitosamente. PDF: ${data.pdf_url}`
    } as any
  });
  
  // Create audit log
  await prisma.auditLog.create({
    data: {
      adminId: 'system', // System-generated event
      action: 'invoice_stamped',
      entity: 'order',
      entityId: order.id,
      details: {
        invoice_id: data.invoice_id,
        pdf_url: data.pdf_url,
        xml_url: data.xml_url,
        timestamp: data.timestamp
      }
    }
  });
  
  // Could also send email notification to customer with invoice PDF
}

/**
 * Handle invoice failed event (failed electronic invoicing)
 */
async function handleInvoiceFailed(data: any) {
  // Find order with this SIIGO invoice ID
  const order = await findOrderByInvoiceId(data.invoice_id);
  
  if (!order) {
    console.error(`No order found for SIIGO invoice ID: ${data.invoice_id}`);
    return;
  }
  
  // Update order with error info
  await prisma.order.update({
    where: { id: order.id },
    data: {
      "siigo_invoice_status": 'failed',
      notes: `${order.notes || ''}\nError en facturación electrónica: ${data.status}`
    } as any
  });
  
  // Create audit log
  await prisma.auditLog.create({
    data: {
      adminId: 'system', // System-generated event
      action: 'invoice_failed',
      entity: 'order',
      entityId: order.id,
      details: {
        invoice_id: data.invoice_id,
        error: data.status,
        timestamp: data.timestamp
      }
    }
  });
  
  // Could also send email notification to admin about failed invoice
}

/**
 * Find order by SIIGO invoice ID (extracted from notes field)
 */
async function findOrderByInvoiceId(invoiceId: string) {
  // Find orders that contain the invoice ID in their notes
  const orders = await prisma.order.findMany({
    where: {
      notes: {
        contains: `Factura electrónica SIIGO: ${invoiceId}`
      }
    }
  });
  
  // Return first matching order
  return orders.length > 0 ? orders[0] : null;
}
