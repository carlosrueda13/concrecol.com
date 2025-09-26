-- Supabase Schema for Concrecol
-- Execute this script in Supabase SQL Editor

-- Create ENUM types
CREATE TYPE "UnitMeasure" AS ENUM ('M3', 'KG', 'TON', 'BOLSA', 'GALON');

-- Create SqlCategory table
CREATE TABLE "SqlCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SqlCategory_pkey" PRIMARY KEY ("id")
);

-- Create Product table
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price_per_unit" INTEGER NOT NULL,
    "unit_measure" "UnitMeasure" NOT NULL,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "requires_scheduling" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sqlCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Create Order table
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_document" TEXT NOT NULL,
    "delivery_option" TEXT NOT NULL,
    "delivery_address" TEXT,
    "delivery_date" TIMESTAMP(3),
    "delivery_time_slot" TEXT,
    "delivery_fee" INTEGER NOT NULL DEFAULT 0,
    "requires_scheduling" BOOLEAN NOT NULL DEFAULT false,
    "created_by_admin" BOOLEAN NOT NULL DEFAULT false,
    "payment_status" TEXT NOT NULL,
    "order_status" TEXT NOT NULL,
    "notes" TEXT,
    "payment_link_token" TEXT,
    "stripe_payment_intent_id" TEXT,
    "total_amount" INTEGER NOT NULL,
    "siigo_invoice_id" TEXT,
    "siigo_invoice_status" TEXT,
    "siigo_pdf_url" TEXT,
    "siigo_xml_url" TEXT,
    "siigo_qr_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- Create OrderItem table
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit_price" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- Create AdminUser table
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- Create AuditLog table
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Create Cart table
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "customer_email" TEXT,
    "customer_phone" TEXT,
    "customer_name" TEXT,
    "customer_document" TEXT,
    "delivery_option" TEXT,
    "delivery_address" TEXT,
    "delivery_date" TIMESTAMP(3),
    "delivery_time_slot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- Create CartItem table
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "SqlCategory_slug_key" ON "SqlCategory"("slug");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX "Order_order_number_key" ON "Order"("order_number");
CREATE UNIQUE INDEX "Order_payment_link_token_key" ON "Order"("payment_link_token");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE UNIQUE INDEX "Cart_cartId_key" ON "Cart"("cartId");
CREATE UNIQUE INDEX "CartItem_cart_id_product_id_key" ON "CartItem"("cart_id", "product_id");

-- Add foreign key constraints
ALTER TABLE "Product" ADD CONSTRAINT "Product_sqlCategoryId_fkey" FOREIGN KEY ("sqlCategoryId") REFERENCES "SqlCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_SqlCategory_updated_at BEFORE UPDATE ON "SqlCategory" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Product_updated_at BEFORE UPDATE ON "Product" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Order_updated_at BEFORE UPDATE ON "Order" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Cart_updated_at BEFORE UPDATE ON "Cart" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();