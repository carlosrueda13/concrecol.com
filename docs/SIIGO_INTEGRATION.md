<div align="center">
  <img src="/public/images/concrecol_logo.svg" alt="Concrecol Logo" width="300" />
</div>

# SIIGO Electronic Invoicing Integration

This document outlines the integration between Concrecol E-commerce and SIIGO for electronic invoicing in Colombia.

## Overview

The integration allows the generation of electronic invoices for paid orders through SIIGO's API. The system supports:

- Creating electronic invoices for paid orders
- Tracking invoice status
- Viewing and downloading generated invoices (PDF and XML)
- Receiving webhook notifications from SIIGO

## Setup

1. Set the required environment variables in your `.env` file:

```bash
# SIIGO
SIIGO_CLIENT_ID=your-siigo-client-id
SIIGO_CLIENT_SECRET=your-siigo-client-secret
SIIGO_USERNAME=your-siigo-username
SIIGO_PASSWORD=your-siigo-password
SIIGO_ENV=sandbox  # Change to 'production' for production environment
```

2. Apply the database migration:

```bash
npx prisma migrate deploy
```

3. Configure SIIGO Webhook (in SIIGO dashboard):
   - Set the webhook URL to: `https://your-domain.com/api/webhooks/siigo`
   - Select the events to listen for: `invoice.stamped`, `invoice.failed`

## Usage

### Admin Panel

In the admin panel, you can:

1. View the invoice status in the order details page
2. Generate a new invoice for a paid order
3. View and download generated invoices

### API Endpoints

- `POST /api/orders/[id]/invoice` - Generate a new electronic invoice
- `GET /api/orders/[id]/invoice` - Get the status of an electronic invoice
- `POST /api/webhooks/siigo` - Webhook endpoint for SIIGO notifications

## Data Model

The Order model has been extended with the following fields:

- `siigo_invoice_id` - The ID of the SIIGO invoice
- `siigo_invoice_status` - The status of the electronic invoice
- `siigo_pdf_url` - URL to the PDF version of the invoice
- `siigo_xml_url` - URL to the XML version of the invoice
- `siigo_qr_url` - URL to the QR code for the invoice

## Common Issues

### Invoice Generation Fails

Possible causes:
- Invalid customer document number or format
- Missing or incorrect product information
- Network connectivity issues with SIIGO
- Invalid SIIGO credentials

### Invoice Status Doesn't Update

- Check that the webhook URL is correctly configured in SIIGO
- Verify that your server can receive incoming webhook requests

## Support

For issues with electronic invoicing, contact:
- SIIGO support at support@siigo.com
- Internal support at tech@concrecol.com
