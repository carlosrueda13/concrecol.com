#!/bin/bash

# Generate Prisma migration
echo "Generating Prisma migration for SIIGO integration..."
npx prisma migrate dev --name add_siigo_invoice_fields

echo "Migration complete"
