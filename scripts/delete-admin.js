const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function deleteAdmin() {
  try {
    console.log('🗑️  Eliminar Administrador de Concrecol\n');

    // Listar admins existentes
    const admins = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (admins.length === 0) {
      console.log('❌ No hay administradores registrados');
      return;
    }

    if (admins.length === 1) {
      console.log('⚠️  Solo hay un administrador. No se recomienda eliminarlo.');
      const confirm = await question('¿Estás seguro de continuar? (y/n): ');
      if (confirm.toLowerCase() !== 'y') {
        console.log('❌ Operación cancelada');
        return;
      }
    }

    console.log('📋 Administradores existentes:\n');
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email} (ID: ${admin.id})`);
    });

    const email = await question('\n📧 Email del admin a eliminar: ');
    
    if (!email) {
      console.log('❌ Email es requerido');
      return;
    }

    const adminToDelete = admins.find(admin => admin.email === email);
    
    if (!adminToDelete) {
      console.log('❌ No se encontró un admin con ese email');
      return;
    }

    console.log(`\n⚠️  Vas a eliminar el admin: ${adminToDelete.email}`);
    const confirm = await question('¿Estás seguro? Esta acción no se puede deshacer (y/n): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Operación cancelada');
      return;
    }

    await prisma.adminUser.delete({
      where: { email }
    });

    console.log('✅ Administrador eliminado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

deleteAdmin();