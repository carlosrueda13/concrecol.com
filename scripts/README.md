# 🔧 Scripts de Administración - Concrecol

Este directorio contiene scripts para gestionar cuentas de administrador del sistema Concrecol.

## 📋 Scripts Disponibles

### 1. Crear/Actualizar Admin
```bash
npm run admin:create
```
- ✨ Crea una nueva cuenta de administrador
- 🔄 Actualiza la contraseña si el email ya existe
- 🔒 Hashea automáticamente las contraseñas

### 2. Listar Admins
```bash
npm run admin:list
```
- 👥 Muestra todos los administradores registrados
- 📊 Información: Email, ID, Rol, Fecha de creación

### 3. Eliminar Admin
```bash
npm run admin:delete
```
- 🗑️ Elimina una cuenta de administrador
- ⚠️ Incluye confirmaciones de seguridad
- 🛡️ Previene eliminar el último admin

## 🚀 Uso Rápido

### Crear tu primera cuenta admin:
```bash
cd "/Users/carlosruedasarmiento/Desktop/Web concrecol"
npm run admin:create
```

### Cambiar contraseña de admin existente:
```bash
npm run admin:create
# Usa el mismo email y nueva contraseña
```

### Ver todos los admins:
```bash
npm run admin:list
```

## 🔐 Acceso al Panel Admin

Una vez creada tu cuenta, accede en:
- **Producción**: https://concrecol-co.vercel.app/admin
- **Local**: http://localhost:3000/admin

## ⚠️ Notas de Seguridad

- 🔒 Las contraseñas se hashean con bcrypt (10 rounds)
- 🛡️ Siempre mantén al menos una cuenta admin activa
- 📧 Usa emails seguros y contraseñas fuertes
- 🔄 Cambia las contraseñas regularmente

## 🐛 Troubleshooting

Si tienes problemas:
1. Verifica que la base de datos esté accesible
2. Asegúrate de tener las variables de entorno configuradas
3. Ejecuta `npx prisma generate` si hay errores de cliente

## 📱 Contacto

Para soporte técnico, contacta al administrador del sistema.