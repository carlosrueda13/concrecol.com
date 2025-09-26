# 🔒 Guía de Seguridad - Gestión de Administradores

## ⚠️ IMPORTANTE: Capas de Seguridad Implementadas

### 🛡️ **Nivel 1: Scripts Locales (Riesgo Medio)**
Los scripts básicos (`npm run admin:create`) son para desarrollo local:
- ✅ **Protección**: Requieren acceso físico a tu máquina
- ✅ **Protección**: Necesitan variables de entorno (DATABASE_URL)
- ❌ **Riesgo**: Si alguien tiene acceso a tu código + credenciales

### 🔐 **Nivel 2: Script Seguro (Riesgo Bajo)**
```bash
npm run admin:secure [MASTER_KEY] [email] [password]
```
**Protecciones adicionales:**
- 🔑 Requiere clave maestra (`ADMIN_MASTER_KEY`)
- 👑 Solo super administradores autorizados
- 🔒 Contraseñas con 12 rounds de bcrypt
- 📝 Validaciones estrictas

### 🌐 **Nivel 3: API Web (Riesgo Mínimo)**
Endpoint: `/api/admin/manage-admins`
**Máxima seguridad:**
- 🔐 Requiere sesión admin activa
- 👑 Solo super administradores (`admin@concrecol.co`)
- 🔑 Clave maestra requerida
- 🛡️ Validaciones múltiples
- 📊 Auditoría completa

## 🔑 **Tu Clave Maestra Actual:**
```
ADMIN_MASTER_KEY="[REDACTED_FOR_SECURITY_REASONS]"
```

## 🚀 **Uso Seguro Recomendado:**

**Para cambiar tu contraseña actual:**
```bash
npm run admin:secure [TU_CLAVE_MAESTRA] admin@concrecol.co nueva_contraseña_segura
```

**Para crear admin adicional:**
```bash
npm run admin:secure [TU_CLAVE_MAESTRA] nuevo@concrecol.co contraseña_del_nuevo
```

## ⚠️ **Medidas de Seguridad Adicionales:**

### **1. Variables de Entorno en Producción (Vercel):**
```bash
# Agregar a Vercel:
ADMIN_MASTER_KEY="concrecol_super_admin_master_key_2025_secure"
```

### **2. Cambiar Clave Maestra Regularmente:**
- Genera nueva clave cada 3-6 meses
- Actualiza en `.env.local` y Vercel
- Notifica a otros admins autorizados

### **3. Lista de Super Admins:**
Ubicación: `app/api/admin/manage-admins/route.ts`
```javascript
const AUTHORIZED_SUPER_ADMINS = [
  'admin@concrecol.co', // ← Tu cuenta principal
  // Agregar más super admins aquí
]
```

## 🚨 **En Caso de Compromiso:**

### **Si sospechas acceso no autorizado:**
1. Cambia `ADMIN_MASTER_KEY` inmediatamente
2. Cambia todas las contraseñas de admin
3. Revisa logs de acceso al panel admin
4. Considera rotar `DATABASE_URL` si es necesario

### **Para emergencias:**
```bash
# Cambiar contraseña de emergencia
npm run admin:secure [NUEVA_MASTER_KEY] admin@concrecol.co nueva_contraseña_ultra_segura
```

## 📊 **Resumen de Protecciones:**

| Método | Clave Maestra | Super Admin | Sesión Web | Nivel Seguridad |
|--------|---------------|-------------|------------|-----------------|
| `admin:create` | ❌ | ❌ | ❌ | 🟡 Básico |
| `admin:secure` | ✅ | ✅ | ❌ | 🟠 Alto |
| API Web | ✅ | ✅ | ✅ | 🟢 Máximo |

## 💡 **Recomendación Final:**
- Usa `admin:secure` para gestión local
- Planifica implementar interfaz web para máxima seguridad
- Mantén siempre al menos una cuenta super admin
- Documenta todos los cambios de administradores