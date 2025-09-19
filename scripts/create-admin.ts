import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createNewAdmin() {
  // New admin credentials - you can customize these
  const email = 'nuevoadmin@concrecol.com'
  const password = 'Admin123!'
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newAdmin = await prisma.adminUser.create({
      data: {
        email: email,
        password: hashedPassword,
        role: 'admin'
      }
    })
    
    console.log(`Successfully created new admin user:`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`User ID: ${newAdmin.id}`)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createNewAdmin()
