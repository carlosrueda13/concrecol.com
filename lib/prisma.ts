import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuración optimizada para entornos serverless
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasourceUrl: process.env.DATABASE_URL,
    // Configuraciones para evitar el error de prepared statements
    errorFormat: "minimal",
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Solo almacenar en global en desarrollo
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Función para cerrar la conexión de manera segura
export const disconnectPrisma = async () => {
  if (prisma) {
    await prisma.$disconnect()
  }
}
