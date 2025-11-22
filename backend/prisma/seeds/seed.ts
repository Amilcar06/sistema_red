import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Verificar si ya existe un usuario admin
  const existingAdmin = await prisma.usuario.findFirst({
    where: {
      rol: 'ADMIN',
    },
  });

  if (existingAdmin) {
    console.log('⚠️  Ya existe un usuario ADMIN en la base de datos.');
    console.log(`   Correo: ${existingAdmin.correo}`);
    return;
  }

  // Crear usuario admin por defecto
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.usuario.create({
    data: {
      correo: 'admin@example.com',
      contrasena: hashedPassword,
      nombre: 'Administrador',
      rol: 'ADMIN',
      activo: true,
    },
  });

  console.log('✅ Usuario admin creado exitosamente!');
  console.log(`   Correo: ${admin.correo}`);
  console.log(`   Contraseña: admin123`);
  console.log(`   Rol: ${admin.rol}`);
  console.log('');
  console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión!');

  // Opcional: Crear usuario operador de ejemplo
  const operatorPassword = await bcrypt.hash('operador123', 12);
  const operator = await prisma.usuario.create({
    data: {
      correo: 'operador@example.com',
      contrasena: operatorPassword,
      nombre: 'Operador',
      rol: 'OPERADOR',
      activo: true,
    },
  });

  console.log('✅ Usuario operador creado exitosamente!');
  console.log(`   Correo: ${operator.correo}`);
  console.log(`   Contraseña: operador123`);
  console.log(`   Rol: ${operator.rol}`);
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

