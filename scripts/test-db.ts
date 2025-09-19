import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as result`
    console.log('Database connection successful!')
    console.log(result)
    
    // Count existing admin users
    const adminCount = await prisma.adminUser.count()
    console.log(`Found ${adminCount} admin users in the database`)
  } catch (error) {
    console.error('Database connection failed:')
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
