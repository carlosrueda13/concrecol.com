# 🔧 Guía Paso a Paso: Configurar Pooler de Supabase

## ❌ Problema Identificado
- Supabase no acepta conexiones IPv4 directas desde Vercel
- Error: "Tenant or user not found" indica configuración incorrecta del pooler

## ✅ Solución: Configurar Connection Pooler

### Paso 1: Acceder al Dashboard de Supabase
1. Ve a https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto (ceaznbojkumfggrsckap)

### Paso 2: Verificar Estado del Proyecto
- **IMPORTANTE**: Verifica que tu proyecto no esté pausado
- Si aparece "Paused" o "Sleeping", haz clic en "Resume" o "Restore"
- Los proyectos gratuitos se pausan automáticamente después de inactividad

### Paso 3: Obtener la URL del Pooler
1. En el dashboard, ve a **Settings** (configuración)
2. Haz clic en **Database** en el menú lateral
3. Busca la sección **"Connection parameters"**
4. Encontrarás estas opciones:

#### A) Connection string (Conexión directa)
```
postgresql://postgres:[PASSWORD]@db.ceaznbojkumfggrsckap.supabase.co:5432/postgres
```
❌ **NO USAR** - No funciona con IPv4 desde Vercel

#### B) Connection pooling (Lo que necesitamos)
Busca URLs que contengan **"pooler.supabase.com"**:

**Session Mode (Puerto 5432):**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres
```

**Transaction Mode (Puerto 6543):**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres
```

### Paso 4: Copiar la URL Correcta
1. **Para Next.js/Vercel**: Usa **Transaction Mode** (puerto 6543)
2. Copia la URL completa exactamente como aparece
3. Reemplaza `[PASSWORD]` con tu contraseña de Supabase

### Paso 5: Ejemplo de URL Correcta
La URL debería verse así:
```
postgresql://postgres.ceaznbojkumfggrsckap:UjJeGAl6tMqIsK6H@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Donde `[REGION]` podría ser:
- `us-east-1`
- `us-west-1` 
- `eu-west-1`
- `ap-southeast-1`
- etc.

## 🚨 Problemas Comunes

### 1. Proyecto Pausado
**Síntoma**: "Tenant or user not found"
**Solución**: Reactivar proyecto en dashboard

### 2. URL Incorrecta
**Síntoma**: "getaddrinfo ENOTFOUND"
**Solución**: Copiar URL exacta del dashboard

### 3. Pooler No Habilitado
**Síntoma**: No aparece sección "Connection pooling"
**Solución**: El pooler está disponible en todos los planes, verifica la versión de Supabase

## 📝 Próximos Pasos

1. **Ve al dashboard y copia la URL exacta del pooler**
2. **Pégala aquí para que la probemos**
3. **Actualizaremos las variables de entorno**
4. **Deployaremos a Vercel**

## 🎯 Lo Que Necesito de Ti

Por favor, ve a tu dashboard de Supabase y proporciona:

1. **Estado del proyecto**: ¿Está activo o pausado?
2. **URL del pooler Transaction Mode**: La URL exacta del puerto 6543
3. **Región del proyecto**: ¿Dónde está alojado tu proyecto?

Una vez tengas esta información, podremos resolver el problema de conexión.