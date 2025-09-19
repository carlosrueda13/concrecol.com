-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "siigo_invoice_id" TEXT,
ADD COLUMN     "siigo_invoice_status" TEXT,
ADD COLUMN     "siigo_pdf_url" TEXT,
ADD COLUMN     "siigo_xml_url" TEXT,
ADD COLUMN     "siigo_qr_url" TEXT;
