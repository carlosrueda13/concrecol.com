import { PrismaClient } from '@prisma/client'

// Wrapper para operaciones de base de datos en entornos serverless
export class DatabaseWrapper {
  private static instance: DatabaseWrapper | null = null
  private client: PrismaClient | null = null
  private isConnected = false
  private connectionPromise: Promise<PrismaClient> | null = null

  private constructor() {}

  static getInstance(): DatabaseWrapper {
    if (!DatabaseWrapper.instance) {
      DatabaseWrapper.instance = new DatabaseWrapper()
    }
    return DatabaseWrapper.instance
  }

  private async connect(): Promise<PrismaClient> {
    // Si ya hay una conexión en progreso, esperarla
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    // Si ya está conectado, reutilizar
    if (this.client && this.isConnected) {
      try {
        // Verificar que la conexión sigue activa
        await this.client.$queryRaw`SELECT 1`
        return this.client
      } catch (error) {
        console.log('🔄 Reconnecting due to stale connection...')
        await this.disconnect()
      }
    }

    // Crear nueva conexión
    this.connectionPromise = this.createNewConnection()
    const client = await this.connectionPromise
    this.connectionPromise = null
    return client
  }

  private async createNewConnection(): Promise<PrismaClient> {
    try {
      // Limpiar conexión anterior si existe
      await this.disconnect()

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

  async executeQuery<T>(operation: (client: PrismaClient) => Promise<T>, retries = 2): Promise<T> {
    let currentRetry = 0
    
    while (currentRetry <= retries) {
      try {
        const client = await this.connect()
        const result = await operation(client)
        return result
      } catch (error) {
        console.error(`❌ Database query failed (attempt ${currentRetry + 1}):`, error)
        
        // Si es un error de prepared statement y tenemos intentos restantes
        if (error instanceof Error && 
            (error.message.includes('prepared statement') || 
             error.message.includes('already exists')) && 
            currentRetry < retries) {
          
          console.log(`🔄 Reconnecting due to prepared statement error (attempt ${currentRetry + 1})...`)
          await this.disconnect()
          currentRetry++
          
          // Esperar un poco antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 100 * currentRetry))
          continue
        }
        
        // Si no es un error de prepared statement o se agotaron los intentos
        throw error
      }
    }
    
    throw new Error('Max retries exceeded')
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
  // Para evitar completamente los errores de prepared statements,
  // crear un cliente completamente nuevo para cada operación
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
    errorFormat: 'minimal',
    datasourceUrl: process.env.DATABASE_URL,
  })

  try {
    await client.$connect()
    const result = await operation(client)
    return result
  } catch (error) {
    console.error('❌ Database query failed:', error)
    throw error
  } finally {
    await client.$disconnect()
  }
}

// Función para obtener el cliente (para compatibilidad con código existente)
export async function getPrismaClient(): Promise<PrismaClient> {
  return dbWrapper.getClient()
}

// Función para cerrar todas las conexiones (útil para cleanup)
export async function closeAllConnections(): Promise<void> {
  await dbWrapper.disconnect()
}