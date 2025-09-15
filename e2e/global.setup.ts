import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { test as setup, expect } from '@playwright/test'
import * as dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

const prisma = new PrismaClient()

setup('setup database', async () => {
  // Clean database
  await prisma.$executeRaw`TRUNCATE TABLE "AdminUser" CASCADE`
  await prisma.$executeRaw`TRUNCATE TABLE "SqlCategory" CASCADE`
  await prisma.$executeRaw`TRUNCATE TABLE "Product" CASCADE`

  // Create admin user
  await prisma.adminUser.create({
    data: {
      email: process.env.ADMIN_DEFAULT_EMAIL!,
      password: await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD!, 10),
      role: 'admin'
    }
  })

  // Create test category
  await prisma.sqlCategory.create({
    data: {
      name: 'Concreto',
      slug: 'concreto',
      is_active: true
    }
  })

  await prisma.$disconnect()
})

// Run auth setup after database is ready
setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/admin/login')

  // Fill in login form
  await page.getByLabel('Email').fill(process.env.ADMIN_DEFAULT_EMAIL!)
  await page.getByLabel('Password').fill(process.env.ADMIN_DEFAULT_PASSWORD!)

  // Click sign in
  await page.getByRole('button', { name: /iniciar sesión/i }).click()

  // Wait for navigation
  await expect(page).toHaveURL('/admin')

  // Save signed-in state
  await page.context().storageState({ path: 'e2e/.auth/admin.json' })
})
