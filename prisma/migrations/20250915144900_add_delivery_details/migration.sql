/*
  Warnings:

  - Added the required column `delivery_time_slot` to the `Order` table without a default value
  - Added the required column `delivery_date` to the `Order` table without a default value

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN "delivery_date" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "delivery_time_slot" TEXT;
