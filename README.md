# Concrecol E-Commerce

E-commerce platform for Concrecol, a concrete plant in Colombia.

## Features

- Full e-commerce functionality
- Product catalog with categories
- Cart management
- Secure checkout process
- Admin panel for product and order management
- Integration with Stripe, SIIGO, and WhatsApp Business API

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma (PostgreSQL)
- NextAuth.js
- Stripe Payments
- And more...

## Prerequisites

- Node.js 18+
- PostgreSQL
- npm or yarn

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in all required environment variables

## Installation

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Run database seeds
npm run seed

# Run development server
npm run dev
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run e2e
```

## Deployment

The application is configured for deployment on Vercel.

## License

Private - All rights reserved
