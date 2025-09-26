const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('🔧 Creador de cuenta Admin para Concrecol\n');

    const email = await question('📧 Email del nuevo admin: ');
    const password = await question('🔒 Contraseña: ');
    
    if (!email || !password) {
      console.log('❌ Email y contraseña son requeridos');
      return;
    }

    // Verificar si el admin ya existe
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('⚠️  Ya existe un admin con ese email');
      const overwrite = await question('¿Deseas actualizar la contraseña? (y/n): ');
      
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Operación cancelada');
        return;
      }

      // Actualizar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.adminUser.update({
        where: { email },
        data: { password: hashedPassword }
      });

      console.log('✅ Contraseña actualizada exitosamente');
    } else {
      // Crear nuevo admin
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = await prisma.adminUser.create({
        data: {
          email,
          password: hashedPassword,
          role: 'admin'
        }
      });

      console.log('✅ Admin creado exitosamente');
      console.log(`📧 Email: ${newAdmin.email}`);
      console.log(`🆔 ID: ${newAdmin.id}`);
    }

    console.log('\n🔗 Puedes acceder al panel admin en: https://concrecol-co.vercel.app/admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();