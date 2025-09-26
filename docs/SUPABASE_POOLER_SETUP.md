    # Configuración del Pooler de Supabase

## Problema
Supabase no acepta conexiones IPv4 directas desde Vercel sin un add-on de pago. La solución es usar el pooler de conexiones (pgBouncer) que Supabase proporciona gratuitamente.

## Solución: Connection Pooler

### 1. Obtener la URL del Pooler

Ve a tu dashboard de Supabase:
1. Navega a **Settings** > **Database**
2. En la sección **Connection parameters**, encontrarás:
   - **Connection string**: Para conexión directa (no funciona con IPv4)
   - **Connection pooling**: URLs del pooler

### 2. Tipos de Pooler

**Session Mode** (Puerto 5432):
- Para aplicaciones con pocas conexiones de larga duración
- URL: `postgresql://postgres.PROJECT_REF:[PASSWORD]@REGION.pooler.supabase.com:5432/postgres`

**Transaction Mode** (Puerto 6543):
- Para aplicaciones como Next.js con muchas conexiones cortas
- URL: `postgresql://postgres.PROJECT_REF:[PASSWORD]@REGION.pooler.supabase.com:6543/postgres`

### 3. Configuración Recomendada para Next.js

Para aplicaciones Next.js, usa **Transaction Mode** porque:
- Maneja mejor las conexiones cortas
- Optimizado para APIs serverless
- Menor uso de recursos

### 4. Configuración con Prisma

Prisma funciona bien con ambos modos, pero para producción con Vercel, recomendamos Transaction Mode.

## URLs Correctas para tu Proyecto

Basado en tu proyecto `ceaznbojkumfggrsckap`, las URLs serían:

**Session Mode:**
```
postgresql://postgres.ceaznbojkumfggrsckap:UjJeGAl6tMqIsK6H@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Transaction Mode:**
```
postgresql://postgres.ceaznbojkumfggrsckap:UjJeGAl6tMqIsK6H@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## Pasos para Verificar

1. Ve a tu dashboard de Supabase
2. Settings > Database
3. Copia la URL correcta del pooler
4. Actualiza las variables de entorno
5. Prueba la conexión