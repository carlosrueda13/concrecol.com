# 🚨 PLAN DE ACCIÓN INMEDIATA - VULNERABILIDADES CRÍTICAS

**FECHA:** 26 de Septiembre, 2025  
**PRIORIDAD:** CRÍTICA  
**TIEMPO ESTIMADO:** 2-4 horas  

---

## ⚡ ACCIONES CRÍTICAS (HACER AHORA)

### 1. **LIMPIAR INFORMACIÓN SENSIBLE DEL REPOSITORIO PÚBLICO**

```bash
# PASO 1: Eliminar clave maestra del archivo público
sed -i '' 's/concrecol_super_admin_master_key_2025_secure/[REDACTED]/g' SECURITY-ADMIN.md

# PASO 2: Generar nueva clave maestra
NEW_MASTER_KEY=$(openssl rand -hex 32)
echo "Nueva clave maestra: $NEW_MASTER_KEY"

# PASO 3: Actualizar .env.local
sed -i '' "s/ADMIN_MASTER_KEY=.*/ADMIN_MASTER_KEY=\"$NEW_MASTER_KEY\"/" .env.local
```

### 2. **ROTAR CREDENCIALES EN VERCEL**

```bash
# Acceder a: https://vercel.com/dashboard
# Environment Variables → Editar:

ADMIN_MASTER_KEY="[nueva_clave_generada_arriba]"
NEXTAUTH_SECRET="[nueva_clave_32_caracteres]"

# Generar nueva NEXTAUTH_SECRET:
openssl rand -base64 32
```

### 3. **ACTUALIZAR DEPENDENCIAS CRÍTICAS**

```bash
cd "/Users/carlosruedasarmiento/Desktop/Web concrecol"

# Actualizar dependencias con vulnerabilidades
npm update typeorm
npm update jose
npm update xml2js

# Para Next.js (breaking change)
npm install next@latest

# Verificar correcciones
npm audit
```

### 4. **REMOVER CONTRASEÑAS HARDCODEADAS**

```bash
# Archivo: e2e/auth.setup.ts
# CAMBIAR: .fill('admin123')
# POR: .fill(process.env.ADMIN_DEFAULT_PASSWORD!)
```

---

## 🔧 SCRIPT DE CORRECCIÓN AUTOMÁTICA

```bash
#!/bin/bash
# security-fix.sh

echo "🚨 Iniciando corrección de vulnerabilidades críticas..."

# 1. Generar nuevas credenciales
NEW_MASTER_KEY=$(openssl rand -hex 32)
NEW_NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "✅ Nuevas credenciales generadas"

# 2. Actualizar .env.local
cp .env.local .env.local.backup
sed -i '' "s/ADMIN_MASTER_KEY=.*/ADMIN_MASTER_KEY=\"$NEW_MASTER_KEY\"/" .env.local
sed -i '' "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$NEW_NEXTAUTH_SECRET\"/" .env.local

echo "✅ Archivo .env.local actualizado"

# 3. Limpiar archivos públicos
sed -i '' 's/concrecol_super_admin_master_key_2025_secure/[REDACTED_FOR_SECURITY]/g' SECURITY-ADMIN.md
sed -i '' 's/nueva_contraseña_segura/[EXAMPLE_PASSWORD]/g' SECURITY-ADMIN.md

echo "✅ Archivos públicos limpiados"

# 4. Actualizar dependencias
npm audit fix
npm update typeorm jose xml2js

echo "✅ Dependencias actualizadas"

# 5. Mostrar nuevas credenciales para Vercel
echo ""
echo "🔑 CREDENCIALES PARA VERCEL:"
echo "ADMIN_MASTER_KEY=\"$NEW_MASTER_KEY\""
echo "NEXTAUTH_SECRET=\"$NEW_NEXTAUTH_SECRET\""
echo ""
echo "📝 Copia estas credenciales y agrégalas a Vercel Environment Variables"

echo "✅ Corrección completa!"
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

### **ANTES DE CONTINUAR, VERIFICAR:**

- [ ] **Nueva clave maestra generada y guardada de forma segura**
- [ ] **Variables actualizadas en .env.local**
- [ ] **Variables actualizadas en Vercel Dashboard**
- [ ] **Archivos públicos limpiados de información sensible**
- [ ] **Dependencias actualizadas**
- [ ] **Contraseñas hardcodeadas removidas**

### **PRUEBAS POST-CORRECCIÓN:**

```bash
# 1. Verificar que la aplicación inicia
npm run dev

# 2. Probar login de admin
# Ir a: http://localhost:3000/admin

# 3. Probar script de admin seguro
npm run admin:secure [NUEVA_CLAVE_MAESTRA] admin@concrecol.co nueva_password

# 4. Verificar APIs funcionan
curl -X POST https://concrecol-co.vercel.app/api/contact -H "Content-Type: application/json" -d '{"nombre":"Test","email":"test@test.com","telefono":"123","asunto":"test","mensaje":"test message"}'
```

---

## 🔒 CONFIGURACIÓN DE HEADERS DE SEGURIDAD

```javascript
// next.config.js - AGREGAR INMEDIATAMENTE
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## ⚠️ COMUNICACIÓN DE SEGURIDAD

### **NO HACER:**
- ❌ No commitear las nuevas credenciales
- ❌ No compartir las claves por medios inseguros
- ❌ No documentar las claves en archivos públicos

### **SÍ HACER:**
- ✅ Guardar credenciales en gestor de contraseñas seguro
- ✅ Compartir solo por canales encriptados
- ✅ Documentar el proceso, no las credenciales

---

## 📞 CONTACTO DE EMERGENCIA

Si tienes problemas durante la implementación:

1. **Backup de emergencia disponible en**: `.env.local.backup`
2. **Revertir cambios**: `git checkout -- .`
3. **Credenciales de prueba**: Disponibles en variables de entorno

---

**PRIORIDAD:** CRÍTICA  
**DEADLINE:** 24 HORAS  
**RESPONSABLE:** Administrador del Sistema  
**ESTADO:** ⏳ PENDIENTE