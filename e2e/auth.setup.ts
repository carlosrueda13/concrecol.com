import { test as setup } from '@playwright/test'

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/admin/login')

  // Fill in login form
  await page.getByLabel('Email').fill('admin@concrecol.com')
  await page.getByLabel('Password').fill('admin123')

  // Click sign in
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Wait for navigation
  await page.waitForURL('/admin')

  // Save signed-in state
  await page.context().storageState({ path: 'e2e/.auth/admin.json' })
})
