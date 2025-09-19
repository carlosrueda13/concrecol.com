#!/bin/bash

# Deployment script for SIIGO Integration

echo "Deploying SIIGO electronic invoicing integration..."

# 1. Apply database migrations
echo "Applying database migrations..."
npx prisma migrate deploy

# 2. Generate Prisma client with updated models
echo "Generating Prisma client..."
npx prisma generate

# 3. Check environment variables
echo "Checking environment variables..."
ENV_VARS=("SIIGO_CLIENT_ID" "SIIGO_CLIENT_SECRET" "SIIGO_USERNAME" "SIIGO_PASSWORD" "SIIGO_ENV")
MISSING_VARS=false

for var in "${ENV_VARS[@]}"
do
  if [ -z "${!var}" ]; then
    echo "⚠️ Missing environment variable: $var"
    MISSING_VARS=true
  fi
done

if [ "$MISSING_VARS" = true ]; then
  echo "⚠️ Please set all required environment variables before proceeding."
  echo "You can find the required variables in docs/SIIGO_INTEGRATION.md"
  exit 1
fi

# 4. Restart the application
echo "Restarting the application..."
npm run build
npm run start

echo "✅ SIIGO integration deployed successfully."
echo "IMPORTANT: Remember to configure the SIIGO webhook in the SIIGO dashboard."
echo "Set the webhook URL to: <your-domain>/api/webhooks/siigo"
