import { PrismaClient } from '@prisma/client'

// Wrapper para operaciones de base de datos en entornos serverless
export class DatabaseWrapper {
  private static instance: DatabaseWrapper | null = null
  private client: PrismaClient | null = null
  private isConnected = false

  private constructor() {}

  static getInstance(): DatabaseWrapper {
    if (!DatabaseWrapper.instance) {
      DatabaseWrapper.instance = new DatabaseWrapper()
    }
    return DatabaseWrapper.instance
  }

  private async connect(): Promise<PrismaClient> {
    if (this.client && this.isConnected) {
      return this.client
    }

    try {
      this.client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        errorFormat: 'minimal',
        datasourceUrl: process.env.DATABASE_URL,
      })

      // Verificar conectividad
      await this.client.$connect()
      this.isConnected = true
      
      console.log('✅ Database connected successfully')
      return this.client
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      await this.disconnect()
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.$disconnect()
        console.log('🔌 Database disconnected')
      } catch (error) {
        console.error('⚠️ Error disconnecting from database:', error)
      } finally {
        this.client = null
        this.isConnected = false
      }
    }
  }

  async executeQuery<T>(operation: (client: PrismaClient) => Promise<T>): Promise<T> {
    const client = await this.connect()
    
    try {
      const result = await operation(client)
      return result
    } catch (error) {
      console.error('❌ Database query failed:', error)
      
      // Si es un error de prepared statement, intentar reconectar
      if (error instanceof Error && error.message.includes('prepared statement')) {
        console.log('🔄 Reconnecting due to prepared statement error...')
        await this.disconnect()
        const newClient = await this.connect()
        return await operation(newClient)
      }
      
      throw error
    }
  }

  // Método para obtener el cliente directamente (para compatibilidad)
  async getClient(): Promise<PrismaClient> {
    return await this.connect()
  }
}

// Instancia singleton
const dbWrapper = DatabaseWrapper.getInstance()

// Función helper para ejecutar consultas de manera segura
export async function safeQuery<T>(operation: (client: PrismaClient) => Promise<T>): Promise<T> {
  return dbWrapper.executeQuery(operation)
}

// Función para obtener el cliente (para compatibilidad con código existente)
export async function getPrismaClient(): Promise<PrismaClient> {
  return dbWrapper.getClient()
}

// Función para cerrar todas las conexiones (útil para cleanup)
export async function closeAllConnections(): Promise<void> {
  await dbWrapper.disconnect()
}