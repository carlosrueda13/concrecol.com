import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerCart } from '@/lib/server-cart';
import { sendEmail } from '@/lib/email';
import { Order, OrderItem, Product } from '@prisma/client';
// Using the OrderWithItems type from our extensions file
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';

// ✅ Schema mejorado para órdenes de clientes
const customerOrderSchema = z.object({
  customer_name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, 'El nombre solo puede contener letras y espacios'),
  customer_email: z.string()
    .email('Correo electrónico inválido')
    .max(255, 'El email es demasiado largo'),
  customer_phone: z.string()
    .min(10, 'Teléfono inválido')
    .max(20, 'Teléfono demasiado largo')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Teléfono inválido'),
  document_type: z.enum(['CC', 'NIT', 'CE', 'PP']),
  document_number: z.string()
    .min(4, 'El número de documento debe tener al menos 4 caracteres')
    .max(20, 'El número de documento es demasiado largo')
    .regex(/^[\d\-\.]+$/, 'El número de documento solo debe contener números, puntos o guiones'),
  delivery_option: z.enum(['pickup', 'delivery']),
  delivery_address: z.string()
    .max(500, 'La dirección es demasiado larga')
    .optional(),
  payment_method: z.enum(['card', 'pse', 'transfer']).optional(),
  requires_scheduling: z.boolean().optional(),
  payment_status: z.enum(['pending', 'paid', 'failed']).optional(),
  items: z.array(
    z.object({
      product_id: z.string().uuid('ID de producto inválido'),
      quantity: z.number()
        .positive('La cantidad debe ser positiva')
        .max(1000, 'Cantidad máxima excedida'),
      product: z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255),
        price_per_unit: z.number().positive('El precio debe ser positivo'),
        unit_measure: z.string().min(1).max(50),
        requires_scheduling: z.boolean(),
        sqlCategory: z.object({
          id: z.string().uuid(),
          name: z.string().min(1).max(100),
        }).optional(),
      }),
    })
  ).min(1, 'Debe incluir al menos un producto'),
  notes: z.string().max(1000, 'Las notas son demasiado largas').optional(),
});

// Schema for admin creating orders
const adminOrderSchema = z.object({
  customer_name: z.string().min(1, 'El nombre es requerido'),
  customer_email: z.string().email('Email inválido'),
  customer_phone: z.string().min(1, 'El teléfono es requerido'),
  customer_document: z.string().min(1, 'El documento es requerido'),
  delivery_option: z.enum(['pickup', 'delivery']),
  delivery_address: z.string().optional(),
  notes: z.string().optional(),
  created_by_admin: z.boolean().default(true),
  order_number: z.string(),
  order_status: z.string(),
  payment_status: z.string(),
  requires_scheduling: z.boolean(),
  delivery_fee: z.number(),
  total_amount: z.number(),
  items: z.array(
    z.object({
      product_id: z.string(),
      quantity: z.number().min(0.1),
      unit_price: z.number(),
    })
  ),
});

// Define type for the order with items and products
interface OrderWithItems extends Order {
  items: (OrderItem & {
    product: Product;
  })[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if this is an admin creating an order or a customer
    const isAdminCreation = body.created_by_admin === true;
    const session = await getServerSession(authOptions);
    
    if (isAdminCreation) {
      // Admin order creation
      if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      
      // Validate admin order data
      const validatedData = adminOrderSchema.parse(body);
      
      // Create order
      const order = await prisma.order.create({
        data: {
          order_number: validatedData.order_number,
          customer_name: validatedData.customer_name,
          customer_email: validatedData.customer_email,
          customer_phone: validatedData.customer_phone,
          customer_document: validatedData.customer_document,
          delivery_option: validatedData.delivery_option,
          delivery_address: validatedData.delivery_option === 'delivery' ? validatedData.delivery_address : null,
          delivery_fee: validatedData.delivery_fee,
          requires_scheduling: validatedData.requires_scheduling,
          payment_status: validatedData.payment_status,
          order_status: validatedData.order_status,
          total_amount: validatedData.total_amount,
          notes: validatedData.notes,
          created_by_admin: true,
          items: {
            create: validatedData.items.map(item => ({
              product: { connect: { id: item.product_id } },
              quantity: item.quantity,
              unit_price: item.unit_price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      
      // Add order history entry for creation
      // Log the order creation event
      await prisma.auditLog.create({
        data: {
          adminId: session.user.email,
          action: 'create',
          entity: 'order',
          entityId: order.id,
          details: {
            message: 'Orden creada manualmente por administrador'
          }
        }
      });
      
      return NextResponse.json({ order }, { status: 201 });
    } else {
      // Customer order creation
      const validatedData = customerOrderSchema.parse(body);
      
      // Generate order number (YYYY-MM-XXXX format)
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      // Get count of orders for this month to generate sequential number
      const orderCount = await prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(date.getFullYear(), date.getMonth(), 1),
          },
        },
      });
      
      const sequentialNumber = String(orderCount + 1).padStart(4, '0');
      const orderNumber = `${year}-${month}-${sequentialNumber}`;
      
      // Calculate total amount
      const totalAmount = validatedData.items.reduce(
        (sum, item) => sum + (item.product.price_per_unit * item.quantity),
        0
      );
      
      // Check if order requires scheduling
      const requiresScheduling = validatedData.requires_scheduling || 
        validatedData.items.some(item => item.product.requires_scheduling);
      
      // Create customer document string
      const customerDocument = `${validatedData.document_type} ${validatedData.document_number}`;
      
      // Create order
      const order = await prisma.order.create({
        data: {
          order_number: orderNumber,
          customer_name: validatedData.customer_name,
          customer_email: validatedData.customer_email,
          customer_phone: validatedData.customer_phone,
          customer_document: customerDocument,
          delivery_option: validatedData.delivery_option,
          delivery_address: validatedData.delivery_option === 'delivery' ? validatedData.delivery_address : null,
          delivery_fee: 0, // Always 0 initially, will be updated manually if delivery
          requires_scheduling: requiresScheduling,
          payment_status: validatedData.payment_status || 'pending',
          order_status: 'created',
          total_amount: totalAmount,
          notes: validatedData.notes,
          created_by_admin: false,
          items: {
            create: validatedData.items.map(item => ({
              product: { connect: { id: item.product_id } },
              quantity: item.quantity,
              unit_price: item.product.price_per_unit,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      
      // Send email notifications
      await sendOrderEmails(order as OrderWithItems, requiresScheduling);
      
      return NextResponse.json({ order }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 });
  }
}

async function sendOrderEmails(order: OrderWithItems, requiresScheduling: boolean) {
  // Email to customer
  await sendEmail({
    to: order.customer_email,
    subject: requiresScheduling 
      ? `Concrecol - Solicitud de Programación #${order.order_number}`
      : `Concrecol - Confirmación de Orden #${order.order_number}`,
    html: `
      <h1>Gracias por tu pedido!</h1>
      <p>Hemos recibido tu orden #${order.order_number}.</p>
      ${requiresScheduling 
        ? '<p><strong>Tu pedido requiere programación.</strong> Te contactaremos pronto para coordinar la entrega y el pago.</p>' 
        : ''}
      <p>Puedes revisar los detalles a continuación:</p>
      <table border="1" cellpadding="8" style="border-collapse: collapse;">
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio</th>
        </tr>
        ${order.items.map((item) => `
          <tr>
            <td>${item.product.name}</td>
            <td>${item.quantity} ${item.product.unit_measure}</td>
            <td>$${(item.unit_price * item.quantity).toLocaleString('es-CO')}</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="2"><strong>Total</strong></td>
          <td><strong>$${order.total_amount.toLocaleString('es-CO')}</strong></td>
        </tr>
      </table>
      <p>Información de entrega:</p>
      <p>Método: ${order.delivery_option === 'pickup' ? 'Recoger en tienda' : 'Envío a domicilio'}</p>
      ${order.delivery_address ? `<p>Dirección: ${order.delivery_address}</p>` : ''}
    `,
  });

  // Email to sales team
  await sendEmail({
    to: process.env.SALES_EMAIL || 'ventas@concrecol.com',
    subject: requiresScheduling 
      ? `NUEVA SOLICITUD DE PROGRAMACIÓN - Orden #${order.order_number}` 
      : `NUEVO PEDIDO - Orden #${order.order_number}`,
    html: `
      <h1>${requiresScheduling ? 'Nueva Solicitud de Programación' : 'Nuevo Pedido'}</h1>
      <p><strong>Orden #${order.order_number}</strong></p>
      <p><strong>Cliente:</strong> ${order.customer_name}</p>
      <p><strong>Teléfono:</strong> ${order.customer_phone}</p>
      <p><strong>Email:</strong> ${order.customer_email}</p>
      <p><strong>Documento:</strong> ${order.customer_document}</p>
      <table border="1" cellpadding="8" style="border-collapse: collapse;">
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio</th>
        </tr>
        ${order.items.map((item) => `
          <tr>
            <td>${item.product.name}</td>
            <td>${item.quantity} ${item.product.unit_measure}</td>
            <td>$${(item.unit_price * item.quantity).toLocaleString('es-CO')}</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="2"><strong>Total</strong></td>
          <td><strong>$${order.total_amount.toLocaleString('es-CO')}</strong></td>
        </tr>
      </table>
      <p>Información de entrega:</p>
      <p>Método: ${order.delivery_option === 'pickup' ? 'Recoger en tienda' : 'Envío a domicilio'}</p>
      ${order.delivery_address ? `<p>Dirección: ${order.delivery_address}</p>` : ''}
      ${requiresScheduling ? '<p><strong>Este pedido requiere programación. Por favor contactar al cliente a la brevedad.</strong></p>' : ''}
      <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/ordenes/${order.id}">Ver en el panel de administración</a></p>
    `,
  });
}
