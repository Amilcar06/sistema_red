/**
 * Seed Unificado (Standard + Entel Bolivia Data)
 * 
 * Contiene:
 * 1. Usuarios administrativos estándar (admin@empresa.bo)
 * 2. Datos educativos inspirados en Entel Bolivia (Productos, Clientes, Promociones)
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// --- Datos para Seed Entel ---
const nombres = [
  'María González', 'Carlos Mamani', 'Ana Quispe', 'Juan Pérez', 'Lucía Choque',
  'Roberto Condori', 'Patricia Morales', 'David Vargas', 'Sofía Huanca', 'José Fernández',
  'Carmen Acho', 'Luis Cáceres', 'Rosa Paredes', 'Miguel Yujra', 'Andrea Montes',
  'Fernando Alarcón', 'Gabriela Moya', 'Ricardo Apaza', 'Diana Limachi', 'Oscar Rojas',
  'Elena Ticona', 'Mario Flores', 'Laura Pari', 'Héctor Gutiérrez', 'Natalia Villarroel',
  'Pedro Chambi', 'Claudia Salinas', 'Esteban Cruz', 'Monica Puma', 'Gustavo Velasco'
];

const planes = [
  'POSTPAGO-4G-10', 'POSTPAGO-4G-20', 'POSTPAGO-4G-50', 'POSTPAGO-4G-80', 'POSTPAGO-4G-100',
  'PREPAGO-BASICO', 'PREPAGO-MEDIO', 'PREPAGO-PREMIUM',
  'FIBRA-15', 'FIBRA-30', 'FIBRA-65', 'FIBRA-105', 'FIBRA-150',
];

function generarTelefono(): string {
  const prefijos = ['60', '61', '62', '63', '64', '65', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78'];
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
  const numero = Math.floor(100000 + Math.random() * 900000);
  return `+591${prefijo}${numero}`;
}

function generarCorreo(nombre: string): string {
  const partes = nombre.toLowerCase().split(' ');
  const dominio = ['gmail.com', 'yahoo.com', 'hotmail.com', 'entelnet.bo'];
  return `${partes[0]}.${partes[1] || 'user'}${Math.floor(Math.random() * 100)}@${dominio[Math.floor(Math.random() * dominio.length)]}`;
}

async function main() {
  console.log('🌱 Iniciando seed unificado...');

  // 1. Crear Usuarios Administrativos Estándar
  console.log('👤 Creando usuarios estándar...');

  const hashedAdmin = await bcrypt.hash('admin123', 12);
  const admin = await prisma.usuario.upsert({
    where: { correo: 'admin@empresa.bo' },
    update: {},
    create: {
      correo: 'admin@empresa.bo',
      contrasena: hashedAdmin,
      nombre: 'Administrador Sistema',
      rol: 'ADMIN',
      activo: true,
    },
  });

  const hashedOp = await bcrypt.hash('operador123', 12);
  const operador = await prisma.usuario.upsert({
    where: { correo: 'operador@empresa.bo' },
    update: {},
    create: {
      correo: 'operador@empresa.bo',
      contrasena: hashedOp,
      nombre: 'Operador Ventas',
      rol: 'OPERADOR',
      activo: true,
    },
  });

  console.log(`   ✅ Admin Standard: ${admin.correo} / admin123`);
  console.log(`   ✅ Operador Standard: ${operador.correo} / operador123`);

  // 2. Crear Usuarios Demo Entel
  console.log('\n👤 Creando usuarios demo Entel...');

  const adminEntel = await prisma.usuario.upsert({
    where: { correo: 'admin@entel-educativo.bo' },
    update: {},
    create: {
      correo: 'admin@entel-educativo.bo',
      contrasena: hashedAdmin,
      nombre: 'Admin Entel Demo',
      rol: 'ADMIN',
      activo: true,
    },
  });

  console.log(`   ✅ Admin Entel: ${adminEntel.correo} / admin123`);

  // 3. Crear Productos (Planes)
  console.log('\n📦 Creando productos (planes educativos)...');
  const productos = [
    { nombre: 'Paquete 4G POST - 10', descripcion: '1.200 MB + WhatsApp ilimitado', categoria: 'POSTPAGO', precio: 10.00 },
    { nombre: 'Paquete 4G POST - 20', descripcion: '2.500 MB + WhatsApp ilimitado', categoria: 'POSTPAGO', precio: 20.00 },
    { nombre: 'Paquete 4G POST - 50', descripcion: '7.000 MB + WhatsApp ilimitado', categoria: 'POSTPAGO', precio: 50.00 },
    { nombre: 'PaqueGanes 5', descripcion: '900 MB + 3 SMS x 24hrs', categoria: 'PREPAGO', precio: 5.00 },
    { nombre: 'PaqueGanes Ilimitado 10', descripcion: 'Datos ilimitados x 48hrs', categoria: 'PREPAGO', precio: 10.00 },
    { nombre: 'Fibra 30', descripcion: 'Internet Fibra 30 Mbps', categoria: 'FIBRA', precio: 149.00 },
    { nombre: 'Fibra 65', descripcion: 'Internet Fibra 65 Mbps', categoria: 'FIBRA', precio: 219.00 },
  ];

  const productosCreados = await Promise.all(
    productos.map(async (p) => {
      const existing = await prisma.producto.findFirst({ where: { nombre: p.nombre } });
      if (existing) return existing;
      return prisma.producto.create({ data: { ...p, activo: true } });
    })
  );
  console.log(`   ✅ ${productosCreados.length} productos creados/verificados`);

  // 4. Crear Clientes Ficticios
  console.log('\n👥 Creando clientes ficticios...');
  const clientes = await Promise.all(
    nombres.map(async (nombreCompleto) => {
      const plan = planes[Math.floor(Math.random() * planes.length)];
      const partes = nombreCompleto.split(' ');

      // Verificar si existe por teléfono (para evitar duplicados en re-runs)
      const telefono = generarTelefono();
      const existing = await prisma.cliente.findFirst({ where: { telefono } });
      if (existing) return existing;

      return prisma.cliente.create({
        data: {
          nombre: partes[0],
          paterno: partes[1] || '',
          materno: partes[2],
          telefono,
          correo: generarCorreo(nombreCompleto),
          plan,
          estado: Math.random() > 0.2 ? 'ACTIVO' : 'INACTIVO',
          fechaRegistro: new Date(),
        },
      });
    })
  );
  console.log(`   ✅ ${clientes.length} clientes procesados`);

  // 5. Crear Promociones Demo
  console.log('\n🎁 Creando promociones demo...');
  const ahora = new Date();
  const finMes = new Date(); finMes.setMonth(finMes.getMonth() + 1);

  const promoData = {
    nombre: 'Doble Saldo Navidad 2024',
    descripcion: 'Recarga doble saldo en paquetes prepago',
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: 100.00,
    fechaInicio: ahora,
    fechaFin: finMes,
    estado: 'ACTIVA',
    segmentoObjetivo: JSON.stringify({ plan: ['PREPAGO-BASICO'] }),
    plantillaMensaje: '¡{nombre}! Doble saldo hasta {fechaFin}.',
  };

  // Upsert promoción
  // Nota: Prisma no tiene upsert nativo simple sin unique where, así que buscamos primero
  let promo = await prisma.promocion.findFirst({ where: { nombre: promoData.nombre } });
  if (!promo) {
    promo = await prisma.promocion.create({
      data: {
        ...promoData,
        tipoDescuento: 'PORCENTAJE', // Asegurar tipo correcto
        estado: 'ACTIVA'
      } as any // Casting rápido para evitar problemas de tipado estricto en seed
    });
  }
  console.log(`   ✅ Promoción "${promo.nombre}" lista`);

  console.log('\n✅ SEED COMPLETADO EXITOSAMENTE');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

