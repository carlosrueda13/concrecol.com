import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { type } = params;

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get URL search params (date, filter, etc.)
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    // Get start and end of month for current date
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);

    switch (type) {
      case "monthly-sales": {
        const monthlyData = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            order_status: {
              notIn: ["cancelled"],
            },
          },
          select: {
            id: true,
            order_number: true,
            customer_name: true,
            customer_email: true,
            total_amount: true,
            payment_status: true,
            order_status: true,
            createdAt: true,
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return NextResponse.json({
          report: {
            title: `Reporte de Ventas - ${startDate.toLocaleDateString("es-CO", {
              month: "long",
              year: "numeric",
            })}`,
            data: monthlyData,
            summary: {
              totalOrders: monthlyData.length,
              totalRevenue: monthlyData.reduce(
                (sum, order) => sum + order.total_amount,
                0
              ),
              paidOrders: monthlyData.filter(
                (order) => order.payment_status === "paid"
              ).length,
              paidRevenue: monthlyData
                .filter((order) => order.payment_status === "paid")
                .reduce((sum, order) => sum + order.total_amount, 0),
            },
          },
        });
      }

      case "top-products": {
        // Get all order items for the selected month
        const orderItems = await prisma.orderItem.findMany({
          where: {
            order: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
              order_status: {
                notIn: ["cancelled"],
              },
            },
          },
          include: {
            product: true,
          },
        });

        // Group by product and calculate totals
        const productMap = new Map();
        orderItems.forEach((item) => {
          const productId = item.product.id;
          if (!productMap.has(productId)) {
            productMap.set(productId, {
              product: item.product,
              totalQuantity: 0,
              totalRevenue: 0,
              orderCount: 0,
            });
          }

          const productData = productMap.get(productId);
          productData.totalQuantity += item.quantity;
          productData.totalRevenue += item.quantity * item.unit_price;
          productData.orderCount++;
        });

        // Convert to array and sort by revenue
        const topProducts = Array.from(productMap.values())
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .map((data) => ({
            id: data.product.id,
            name: data.product.name,
            unit_measure: data.product.unit_measure,
            totalQuantity: data.totalQuantity,
            totalRevenue: data.totalRevenue,
            orderCount: data.orderCount,
          }));

        return NextResponse.json({
          report: {
            title: `Productos Más Vendidos - ${startDate.toLocaleDateString("es-CO", {
              month: "long",
              year: "numeric",
            })}`,
            data: topProducts,
            summary: {
              totalProducts: topProducts.length,
              totalRevenue: topProducts.reduce(
                (sum, product) => sum + product.totalRevenue,
                0
              ),
            },
          },
        });
      }

      case "pending-orders": {
        const pendingOrders = await prisma.order.findMany({
          where: {
            order_status: {
              in: ["created", "confirmed", "scheduled"],
            },
          },
          select: {
            id: true,
            order_number: true,
            customer_name: true,
            customer_email: true,
            customer_phone: true,
            total_amount: true,
            payment_status: true,
            order_status: true,
            requires_scheduling: true,
            delivery_option: true,
            delivery_address: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return NextResponse.json({
          report: {
            title: "Órdenes Pendientes",
            data: pendingOrders,
            summary: {
              totalPending: pendingOrders.length,
              requiresScheduling: pendingOrders.filter(
                (order) => order.requires_scheduling
              ).length,
              pendingPayment: pendingOrders.filter(
                (order) => order.payment_status === "pending"
              ).length,
            },
          },
        });
      }

      default:
        return new NextResponse("Invalid report type", { status: 400 });
    }
  } catch (error) {
    console.error(`[REPORTS_GET_${params.type.toUpperCase()}]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
