const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAdmins() {
  try {
    console.log('👥 Lista de Administradores de Concrecol\n');

    const admins = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        role: true,
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

    console.log(`📊 Total de administradores: ${admins.length}\n`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. 👤 ${admin.email}`);
      console.log(`   🆔 ID: ${admin.id}`);
      console.log(`   🎭 Rol: ${admin.role}`);
      console.log(`   📅 Creado: ${admin.createdAt.toLocaleDateString('es-CO')}`);
      console.log('');
    });

    console.log('🔗 Panel admin: https://concrecol-co.vercel.app/admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listAdmins();