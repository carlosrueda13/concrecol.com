const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Lista de administradores autorizados (solo estos pueden crear/modificar admins)
const AUTHORIZED_SUPER_ADMINS = [
  'admin@concrecol.co', // Tu cuenta principal
  // Agregar más super admins aquí si es necesario
];

// Clave maestra requerida para operaciones críticas
const MASTER_KEY = process.env.ADMIN_MASTER_KEY;

async function createSecureAdmin() {
  try {
    console.log('🔐 Sistema Seguro de Gestión de Admins - Concrecol\n');

    // Verificación 1: Clave maestra
    if (!MASTER_KEY) {
      console.log('❌ ADMIN_MASTER_KEY no configurada en variables de entorno');
      console.log('💡 Agrega ADMIN_MASTER_KEY="tu_clave_super_secreta" a tu .env.local');
      process.exit(1);
    }

    const inputMasterKey = process.argv[2];
    if (!inputMasterKey || inputMasterKey !== MASTER_KEY) {
      console.log('❌ Clave maestra requerida');
      console.log('💡 Uso: npm run admin:secure [MASTER_KEY] [email] [password]');
      process.exit(1);
    }

    // Verificación 2: Parámetros
    const email = process.argv[3];
    const password = process.argv[4];

    if (!email || !password) {
      console.log('❌ Email y contraseña requeridos');
      console.log('💡 Uso: npm run admin:secure [MASTER_KEY] [email] [password]');
      process.exit(1);
    }

    // Verificación 3: Solo super admins pueden crear otros admins
    const existingAdmins = await prisma.adminUser.findMany();
    
    if (existingAdmins.length > 0) {
      const hasAuthorizedAdmin = existingAdmins.some(admin => 
        AUTHORIZED_SUPER_ADMINS.includes(admin.email)
      );
      
      if (!hasAuthorizedAdmin) {
        console.log('❌ No hay super administradores autorizados en el sistema');
        process.exit(1);
      }
    }

    // Verificación 4: Validaciones de seguridad
    if (password.length < 8) {
      console.log('❌ La contraseña debe tener al menos 8 caracteres');
      process.exit(1);
    }

    if (!email.includes('@') || !email.includes('.')) {
      console.log('❌ Email inválido');
      process.exit(1);
    }

    // Crear o actualizar admin
    const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds para mayor seguridad

    const admin = await prisma.adminUser.upsert({
      where: { email },
      update: { 
        password: hashedPassword
      },
      create: {
        email,
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log('✅ Administrador procesado exitosamente');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🆔 ID: ${admin.id}`);
    console.log(`📅 Última actualización: ${new Date().toLocaleString('es-CO')}`);
    
    // Log de auditoría
    console.log(`\n📝 Operación registrada: ${new Date().toISOString()}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSecureAdmin();