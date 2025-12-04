/**
 * Seed Completo para Sistema de Promoción de Servicios
 * Contexto: La Paz, Bolivia (Inspirado en Entel)
 * 
 * Contiene:
 * 1. Usuarios Administrativos (Standard + Entel)
 * 2. Productos (Planes Postpago, Prepago, Fibra)
 * 3. Clientes (Datos realistas de La Paz)
 * 4. Promociones (Campañas completas)
 * 5. Notificaciones (Historial de envíos)
 * 6. Conversiones (Simulación de éxito)
 * 7. Reglas de Negocio
 * 8. Configuración del Sistema
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// --- Datos Maestros ---

// Nombres comunes en La Paz, Bolivia
const nombres = [
  'María González', 'Carlos Mamani', 'Ana Quispe', 'Juan Pérez', 'Lucía Choque',
  'Roberto Condori', 'Patricia Morales', 'David Vargas', 'Sofía Huanca', 'José Fernández',
  'Carmen Acho', 'Luis Cáceres', 'Rosa Paredes', 'Miguel Yujra', 'Andrea Montes',
  'Fernando Alarcón', 'Gabriela Moya', 'Ricardo Apaza', 'Diana Limachi', 'Oscar Rojas',
  'Elena Ticona', 'Mario Flores', 'Laura Pari', 'Héctor Gutiérrez', 'Natalia Villarroel',
  'Pedro Chambi', 'Claudia Salinas', 'Esteban Cruz', 'Monica Puma', 'Gustavo Velasco'
];

// Planes de servicio
const planes = [
  'POSTPAGO-4G-10', 'POSTPAGO-4G-20', 'POSTPAGO-4G-50', 'POSTPAGO-4G-80', 'POSTPAGO-4G-100',
  'PREPAGO-BASICO', 'PREPAGO-MEDIO', 'PREPAGO-PREMIUM',
  'FIBRA-15', 'FIBRA-30', 'FIBRA-65', 'FIBRA-105', 'FIBRA-150',
];

// Generadores de datos
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
  console.log('🌱 Iniciando seed completo (Contexto Bolivia)...');

  // 1. Usuarios
  console.log('👤 Creando usuarios...');
  const hashedAdmin = await bcrypt.hash('admin123', 12);
  const hashedOp = await bcrypt.hash('operador123', 12);

  // Admin General
  await prisma.usuario.upsert({
    where: { correo: 'admin@empresa.bo' },
    update: {},
    create: { correo: 'admin@empresa.bo', contrasena: hashedAdmin, nombre: 'Admin General', rol: 'ADMIN', activo: true },
  });

  // Operador General
  await prisma.usuario.upsert({
    where: { correo: 'operador@empresa.bo' },
    update: {},
    create: { correo: 'operador@empresa.bo', contrasena: hashedOp, nombre: 'Operador General', rol: 'OPERADOR', activo: true },
  });

  // Admin Entel (Demo)
  await prisma.usuario.upsert({
    where: { correo: 'admin@entel-educativo.bo' },
    update: {},
    create: { correo: 'admin@entel-educativo.bo', contrasena: hashedAdmin, nombre: 'Admin Entel Demo', rol: 'ADMIN', activo: true },
  });

  console.log('✅ Usuarios creados');

  // 2. Productos
  console.log('📦 Creando productos...');
  const productos = [
    // Postpago
    { nombre: 'Paquete 4G POST - 10', descripcion: '1.200 MB + WhatsApp ilimitado (EDUCATIVO)', categoria: 'POSTPAGO', precio: 10.00 },
    { nombre: 'Paquete 4G POST - 20', descripcion: '2.500 MB + WhatsApp ilimitado (EDUCATIVO)', categoria: 'POSTPAGO', precio: 20.00 },
    { nombre: 'Paquete 4G POST - 50', descripcion: '7.000 MB + WhatsApp ilimitado (EDUCATIVO)', categoria: 'POSTPAGO', precio: 50.00 },
    { nombre: 'Paquete 4G POST - 80', descripcion: '12.000 MB + WhatsApp ilimitado (EDUCATIVO)', categoria: 'POSTPAGO', precio: 80.00 },
    { nombre: 'Paquete 4G POST - 100', descripcion: '16.000 MB + WhatsApp ilimitado (EDUCATIVO)', categoria: 'POSTPAGO', precio: 100.00 },
    // Prepago
    { nombre: 'PaqueGanes 5', descripcion: '900 MB + 3 SMS + WhatsApp ilimitado x 24hrs', categoria: 'PREPAGO', precio: 5.00 },
    { nombre: 'PaqueGanes Ilimitado 10', descripcion: 'Datos ilimitados + 3 SMS x 48hrs', categoria: 'PREPAGO', precio: 10.00 },
    { nombre: 'Paquete Ilimitado 6hrs', descripcion: 'Navegación ilimitada 6 horas + 4 SMS', categoria: 'PREPAGO', precio: 4.00 },
    // Fibra
    { nombre: 'Fibra 15', descripcion: 'Internet Fibra 15 Mbps', categoria: 'FIBRA', precio: 99.00 },
    { nombre: 'Fibra 30', descripcion: 'Internet Fibra 30 Mbps', categoria: 'FIBRA', precio: 149.00 },
    { nombre: 'Fibra 65', descripcion: 'Internet Fibra 65 Mbps', categoria: 'FIBRA', precio: 219.00 },
    { nombre: 'Fibra 105', descripcion: 'Internet Fibra 105 Mbps', categoria: 'FIBRA', precio: 340.00 },
  ];

  const productosCreados = await Promise.all(
    productos.map(async (p) => {
      const existing = await prisma.producto.findFirst({ where: { nombre: p.nombre } });
      if (existing) return prisma.producto.update({ where: { id: existing.id }, data: p });
      return prisma.producto.create({ data: { ...p, activo: true } });
    })
  );
  console.log(`✅ ${productosCreados.length} productos procesados`);

  // 3. Clientes
  console.log('👥 Creando clientes...');
  const clientes = await Promise.all(
    nombres.map(async (nombreCompleto) => {
      const plan = planes[Math.floor(Math.random() * planes.length)];
      const telefono = generarTelefono();

      // Evitar duplicados por teléfono
      const existing = await prisma.cliente.findFirst({ where: { telefono } });
      if (existing) return existing;

      const partes = nombreCompleto.split(' ');
      return prisma.cliente.create({
        data: {
          nombre: partes[0],
          paterno: partes[1] || '',
          materno: partes[2],
          telefono,
          correo: generarCorreo(nombreCompleto),
          plan,
          estado: Math.random() > 0.2 ? 'ACTIVO' : 'INACTIVO',
          fechaRegistro: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 365))),
          fechaUltimaActividad: Math.random() > 0.3 ? new Date() : null,
        },
      });
    })
  );
  console.log(`✅ ${clientes.length} clientes procesados`);

  // 4. Promociones
  console.log('🎁 Creando promociones...');
  const ahora = new Date();
  const enUnaSemana = new Date(ahora); enUnaSemana.setDate(enUnaSemana.getDate() + 7);
  const enUnMes = new Date(ahora); enUnMes.setMonth(enUnMes.getMonth() + 1);

  // Promo 1: Navidad
  const promo1 = await prisma.promocion.create({
    data: {
      nombre: 'Doble Saldo Navidad 2024',
      descripcion: 'Recarga doble saldo en paquetes prepago',
      tipoDescuento: 'PORCENTAJE',
      valorDescuento: 100.00,
      fechaInicio: ahora,
      fechaFin: enUnaSemana,
      estado: 'ACTIVA',
      segmentoObjetivo: JSON.stringify({ plan: ['PREPAGO-BASICO', 'PREPAGO-MEDIO'] }),
      plantillaMensaje: '¡{nombre}! 🎄 Esta Navidad recarga doble saldo. Marca *123#.',
      totalEnviados: 0,
      totalConvertidos: 0,
    }
  });

  // Promo 2: Sorteo
  const promo2 = await prisma.promocion.create({
    data: {
      nombre: 'PaqueGanes+ Sorteo',
      descripcion: 'Compra PaqueGanes y participa en sorteo',
      tipoDescuento: 'GRATIS',
      valorDescuento: 0.00,
      fechaInicio: ahora,
      fechaFin: enUnMes,
      estado: 'ACTIVA',
      segmentoObjetivo: JSON.stringify({ plan: ['PREPAGO-BASICO'] }),
      plantillaMensaje: '¡Hola {nombre}! 🎉 Participa en el sorteo comprando PaqueGanes.',
      totalEnviados: 0,
      totalConvertidos: 0,
    }
  });

  // Promo 3: Descuento Postpago
  const promo3 = await prisma.promocion.create({
    data: {
      nombre: '25% OFF Planes Postpago',
      descripcion: 'Descuento del 25% en planes postpago',
      tipoDescuento: 'PORCENTAJE',
      valorDescuento: 25.00,
      fechaInicio: ahora,
      fechaFin: enUnMes,
      estado: 'ACTIVA',
      segmentoObjetivo: JSON.stringify({ categoria: ['POSTPAGO'] }),
      plantillaMensaje: '¡{nombre}! Obtén 25% de descuento en tu plan postpago.',
      totalEnviados: 0,
      totalConvertidos: 0,
    }
  });

  console.log('✅ Promociones creadas');

  // 5. Notificaciones (Historial)
  console.log('📬 Generando historial de notificaciones...');
  const canales: Array<'SMS' | 'CORREO' | 'WHATSAPP'> = ['SMS', 'CORREO', 'WHATSAPP'];
  const estados: Array<'ENVIADA' | 'ENTREGADA' | 'FALLIDA'> = ['ENVIADA', 'ENTREGADA', 'FALLIDA'];

  const notificaciones = await Promise.all(
    Array.from({ length: 50 }).map(async () => {
      const cliente = clientes[Math.floor(Math.random() * clientes.length)];
      const promocion = [promo1, promo2, promo3][Math.floor(Math.random() * 3)];
      const canal = canales[Math.floor(Math.random() * canales.length)];
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - Math.floor(Math.random() * 30));

      return prisma.notificacion.create({
        data: {
          clienteId: cliente.id,
          promocionId: promocion.id,
          canal,
          estado: estado as any,
          titulo: `Promo: ${promocion.nombre}`,
          mensaje: promocion.plantillaMensaje?.replace('{nombre}', cliente.nombre) || 'Mensaje demo',
          fechaEnviado: fecha,
          fechaEntregado: estado === 'ENTREGADA' ? fecha : null,
          fechaFallido: estado === 'FALLIDA' ? fecha : null,
        }
      });
    })
  );
  console.log(`✅ ${notificaciones.length} notificaciones generadas`);

  // 6. Conversiones
  console.log('💰 Generando conversiones...');
  const conversiones = await Promise.all(
    clientes.slice(0, 15).map(async (cliente) => {
      const promocion = [promo1, promo2, promo3][Math.floor(Math.random() * 3)];
      return prisma.clientePromocion.create({
        data: {
          clienteId: cliente.id,
          promocionId: promocion.id,
          estado: 'CONVERTIDA',
          fechaConversion: new Date(),
        }
      });
    })
  );
  console.log(`✅ ${conversiones.length} conversiones generadas`);

  // Actualizar contadores en promociones
  for (const promo of [promo1, promo2, promo3]) {
    const enviados = notificaciones.filter(n => n.promocionId === promo.id).length;
    const convertidos = conversiones.filter(c => c.promocionId === promo.id).length;
    await prisma.promocion.update({
      where: { id: promo.id },
      data: { totalEnviados: enviados, totalConvertidos: convertidos }
    });
  }

  // 7. Configuración del Sistema
  console.log('⚙️  Configurando sistema...');
  await prisma.configuracionSistema.upsert({
    where: { clave: 'companyName' },
    update: {},
    create: { clave: 'companyName', valor: 'Entel Bolivia (Demo)', categoria: 'general' }
  });
  await prisma.configuracionSistema.upsert({
    where: { clave: 'currency' },
    update: {},
    create: { clave: 'currency', valor: 'BOB', categoria: 'general' }
  });

  // 8. Reglas de Negocio
  console.log('rules Creando reglas de negocio...');
  const regla = await prisma.reglaNegocio.create({
    data: {
      nombre: 'Cliente Fiel > 1 Año',
      descripcion: 'Clientes con antigüedad mayor a 1 año',
      tipoRegla: 'ELEGIBILIDAD',
      condiciones: JSON.stringify({ operador: 'GT', campo: 'antiguedad', valor: 365 }),
      acciones: JSON.stringify({ permitir: true }),
      prioridad: 1
    }
  });

  // Vincular regla a promo
  await prisma.promocionRegla.create({
    data: { promocionId: promo3.id, reglaId: regla.id }
  });

  console.log('✅ SEED COMPLETADO');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
