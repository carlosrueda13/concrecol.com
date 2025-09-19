import { Order, OrderItem, Product } from '@prisma/client';
import { siigoClient, SiigoInvoiceResponse } from './siigo-client';
import { prisma } from '@/lib/prisma';
import { OrderWithItems } from '@/types/prisma-extensions';

// Default document for electronic invoices in SIIGO (this would usually come from settings)
const DEFAULT_INVOICE_DOCUMENT_ID = 11979; // You should replace this with the actual document ID from SIIGO

/**
 * Maps an order to a SIIGO invoice data structure
 */
export async function mapOrderToSiigoInvoice(order: OrderWithItems) {
  // Extract document type and number
  const [docType, docNumber] = order.customer_document.split(' ', 2);
  
  // Get the appropriate document type code for SIIGO
  const documentTypeCode = siigoClient.getDocumentTypeCode(docType);
  
  // Format the document number
  const formattedDocNumber = siigoClient.formatDocumentNumber(docNumber || '');
  
  // Map items to SIIGO format
  const items = order.items.map(item => ({
    code: item.product.id, // Use product ID as code (this would need to be mapped to SIIGO product codes)
    description: item.product.name,
    quantity: Number(item.quantity),
    price: item.unit_price,
    // Add taxes if needed
    taxes: [
      {
        id: 6935 // You should replace this with the actual tax ID from SIIGO
      }
    ]
  }));
  
  // Format customer name
  const nameParts = order.customer_name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  
  // Construct SIIGO invoice data
  return {
    document: {
      id: DEFAULT_INVOICE_DOCUMENT_ID
    },
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    customer: {
      identification: formattedDocNumber,
      document_type: {
        code: documentTypeCode
      },
      name: [firstName, lastName],
      phones: [
        {
          number: order.customer_phone
        }
      ],
      email: order.customer_email
    },
    items,
    stamp: {
      send: true // Send for electronic invoicing
    },
    observations: `Orden #${order.order_number} - ${order.notes || ''}`
  };
}

/**
 * Creates a SIIGO invoice for an order
 */
export async function createSiigoInvoiceForOrder(orderId: string): Promise<SiigoInvoiceResponse> {
  // Get order with items and products
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });
  
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }
  
  // Map order to SIIGO invoice format
  const invoiceData = await mapOrderToSiigoInvoice(order as OrderWithItems);
  
  // Create invoice in SIIGO
  const siigoInvoice = await siigoClient.createInvoice(invoiceData);
  
  // Update order with SIIGO invoice ID and information
  await prisma.order.update({
    where: { id: orderId },
    data: {
      "siigo_invoice_id": siigoInvoice.id,
      "siigo_invoice_status": siigoInvoice.status,
      "siigo_pdf_url": siigoInvoice.stamp?.pdf_link,
      "siigo_xml_url": siigoInvoice.stamp?.xml_link,
      "siigo_qr_url": siigoInvoice.stamp?.qr_link,
      notes: order.notes 
        ? `${order.notes}\nFactura electrónica SIIGO: ${siigoInvoice.id}`
        : `Factura electrónica SIIGO: ${siigoInvoice.id}`
    } as any
  });
  
  return siigoInvoice;
}

/**
 * Gets the status and links for an electronic invoice
 */
export async function getSiigoInvoiceStatus(invoiceId: string): Promise<{
  status: string;
  pdfUrl?: string;
  xmlUrl?: string;
  qrUrl?: string;
} | null> {
  try {
    const invoice = await siigoClient.getInvoice(invoiceId);
    
    if (invoice.stamp) {
      return {
        status: invoice.stamp.status,
        pdfUrl: invoice.stamp.pdf_link,
        xmlUrl: invoice.stamp.xml_link,
        qrUrl: invoice.stamp.qr_link
      };
    }
    
    return { status: invoice.status };
  } catch (error) {
    console.error(`Error getting SIIGO invoice status for ${invoiceId}:`, error);
    return null;
  }
}
