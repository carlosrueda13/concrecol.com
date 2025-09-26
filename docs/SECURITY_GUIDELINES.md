# 🔒 Guía de Seguridad - Concrecol

## ⚠️ ARCHIVOS SENSIBLES NUNCA INCLUIR EN GIT

### Archivos eliminados del repositorio:
- ✅ `.env` - Variables de entorno locales
- ✅ `.env.local` - Configuración local de desarrollo  
- ✅ `.env.production` - Variables de producción
- ✅ `.env.test` - Variables de pruebas
- ✅ `test-*.js` - Scripts de prueba con credenciales
- ✅ `setup-*.js` - Scripts de configuración con datos sensibles
- ✅ `supabase-schema.sql` - Esquema de base de datos con datos
- ✅ `*.tsbuildinfo` - Cache de TypeScript
- ✅ `.DS_Store` - Archivos de sistema macOS

## 🛡️ CONFIGURACIÓN DE SEGURIDAD

### Variables de entorno en producción:
1. **Vercel Dashboard**: Configurar variables en Settings > Environment Variables
2. **Nunca hardcodear**: Credenciales, URLs de base de datos, claves API
3. **Usar secretos seguros**: Generar con `openssl rand -base64 32`

### Archivos protegidos por .gitignore:
```
.env*
*.key
*.pem
credentials.json
test-*.js
setup-*.js
supabase-schema.sql
```

## 🔐 CREDENCIALES SEGURAS

### Para desarrollo local:
1. Copia `.env.example` a `.env.local`
2. Completa con tus credenciales reales
3. **NUNCA** hagas commit de `.env.local`

### Para producción:
1. Configura variables en el dashboard del proveedor
2. Usa secretos generados automáticamente
3. Rota credenciales regularmente

## ✅ VERIFICACIÓN DE SEGURIDAD

Antes de cada commit, verifica que no incluyes:
- [ ] Archivos `.env*`
- [ ] Credenciales en código
- [ ] URLs de base de datos con passwords
- [ ] Archivos de prueba con datos sensibles
- [ ] Claves API o tokens

## 🚨 SI EXPONES CREDENCIALES ACCIDENTALMENTE

1. **Inmediatamente**: Revocar/cambiar todas las credenciales expuestas
2. **Cambiar passwords**: De base de datos y servicios
3. **Regenerar tokens**: API keys, secretos de JWT
4. **Limpiar historial**: `git filter-branch` o `git-filter-repo`
5. **Notificar al equipo**: Si es necesario

## 📋 CHECKLIST DE SEGURIDAD

- ✅ `.gitignore` actualizado
- ✅ Variables de entorno configuradas en el proveedor
- ✅ `.env.example` sin datos reales
- ✅ Archivos temporales eliminados
- ✅ Credenciales rotadas si fueron expuestas
- ✅ Build exitoso sin warnings de seguridad