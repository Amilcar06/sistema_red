/**
 * Seed con datos educativos inspirados en Entel Bolivia
 * 
 * ⚠️ DISCLAIMER: Este seed contiene datos ficticios creados únicamente para
 * fines educativos y de demostración del sistema. No tiene fines lucrativos
 * ni está asociado oficialmente con Entel Bolivia.
 * 
 * Los datos están basados en información pública sobre planes y promociones
 * de Entel, pero todos los nombres, números de teléfono y correos son
 * completamente ficticios.
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Nombres ficticios comunes en Bolivia (La Paz)
const nombres = [
  'María González', 'Carlos Mamani', 'Ana Quispe', 'Juan Pérez', 'Lucía Choque',
  'Roberto Condori', 'Patricia Morales', 'David Vargas', 'Sofía Huanca', 'José Fernández',
  'Carmen Acho', 'Luis Cáceres', 'Rosa Paredes', 'Miguel Yujra', 'Andrea Montes',
  'Fernando Alarcón', 'Gabriela Moya', 'Ricardo Apaza', 'Diana Limachi', 'Oscar Rojas',
  'Elena Ticona', 'Mario Flores', 'Laura Pari', 'Héctor Gutiérrez', 'Natalia Villarroel',
  'Pedro Chambi', 'Claudia Salinas', 'Esteban Cruz', 'Monica Puma', 'Gustavo Velasco'
];

// Planes inspirados en Entel Bolivia (EDUCATIVO)
const planes = [
  // Postpago
  'POSTPAGO-4G-10',
  'POSTPAGO-4G-20',
  'POSTPAGO-4G-50',
  'POSTPAGO-4G-80',
  'POSTPAGO-4G-100',
  // Prepago
  'PREPAGO-BASICO',
  'PREPAGO-MEDIO',
  'PREPAGO-PREMIUM',
  // Fibra (para productos)
  'FIBRA-15',
  'FIBRA-30',
  'FIBRA-65',
  'FIBRA-105',
  'FIBRA-150',
];

// Generar número de teléfono ficticio (formato Bolivia: 8 dígitos)
function generarTelefono(): string {
  // Prefijos comunes en Bolivia (Entel, Tigo, Viva)
  const prefijos = ['60', '61', '62', '63', '64', '65', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78'];
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
  // Necesitamos 6 dígitos más para completar los 8
  const numero = Math.floor(100000 + Math.random() * 900000);
  return `+591${prefijo}${numero}`;
}

// Generar correo ficticio
function generarCorreo(nombre: string): string {
  const partes = nombre.toLowerCase().split(' ');
  const dominio = ['gmail.com', 'yahoo.com', 'hotmail.com', 'entelnet.bo'];
  return `${partes[0]}.${partes[1] || 'user'}${Math.floor(Math.random() * 100)}@${dominio[Math.floor(Math.random() * dominio.length)]}`;
}

async function main() {
  console.log('🌱 Iniciando seed educativo con datos inspirados en Entel Bolivia...');
  console.log('⚠️  DISCLAIMER: Datos ficticios para fines educativos únicamente\n');

  // 1. Crear usuarios administrativos
  console.log('👤 Creando usuarios administrativos...');

  const hashedAdmin = await bcrypt.hash('admin123', 12);
  const admin = await prisma.usuario.upsert({
    where: { correo: 'admin@entel-educativo.bo' },
    update: {},
    create: {
      correo: 'admin@entel-educativo.bo',
      contrasena: hashedAdmin,
      nombre: 'Administrador Sistema',
      rol: 'ADMIN',
      activo: true,
    },
  });

  const hashedOp = await bcrypt.hash('operador123', 12);
  const operador = await prisma.usuario.upsert({
    where: { correo: 'operador@entel-educativo.bo' },
    update: {},
    create: {
      correo: 'operador@entel-educativo.bo',
      contrasena: hashedOp,
      nombre: 'Operador Marketing',
      rol: 'OPERADOR',
      activo: true,
    },
  });

  console.log('✅ Usuarios creados');
  console.log(`   Admin: ${admin.correo} / admin123`);
  console.log(`   Operador: ${operador.correo} / operador123\n`);

  // 2. Crear productos (planes de Entel - EDUCATIVO)
  console.log('📦 Creando productos (planes educativos)...');

  const productos = [
    // Postpago 4G
    {
      nombre: 'Paquete 4G POST - 10',
      descripcion: '1.200 MB + WhatsApp ilimitado (EDUCATIVO)',
      categoria: 'POSTPAGO',
      precio: 10.00,
    },
    {
      nombre: 'Paquete 4G POST - 20',
      descripcion: '2.500 MB + WhatsApp ilimitado (EDUCATIVO)',
      categoria: 'POSTPAGO',
      precio: 20.00,
    },
    {
      nombre: 'Paquete 4G POST - 50',
      descripcion: '7.000 MB + WhatsApp ilimitado (EDUCATIVO)',
      categoria: 'POSTPAGO',
      precio: 50.00,
    },
    {
      nombre: 'Paquete 4G POST - 80',
      descripcion: '12.000 MB + WhatsApp ilimitado (EDUCATIVO)',
      categoria: 'POSTPAGO',
      precio: 80.00,
    },
    {
      nombre: 'Paquete 4G POST - 100',
      descripcion: '16.000 MB + WhatsApp ilimitado (EDUCATIVO)',
      categoria: 'POSTPAGO',
      precio: 100.00,
    },
    // Prepago
    {
      nombre: 'PaqueGanes 5',
      descripcion: '900 MB + 3 SMS + WhatsApp ilimitado x 24hrs (EDUCATIVO)',
      categoria: 'PREPAGO',
      precio: 5.00,
    },
    {
      nombre: 'PaqueGanes Ilimitado 10',
      descripcion: 'Datos ilimitados + 3 SMS x 48hrs (EDUCATIVO)',
      categoria: 'PREPAGO',
      precio: 10.00,
    },
    {
      nombre: 'Paquete Ilimitado 6hrs',
      descripcion: 'Navegación ilimitada 6 horas + 4 SMS (EDUCATIVO)',
      categoria: 'PREPAGO',
      precio: 4.00,
    },
    {
      nombre: 'Paquete Ilimitado 12hrs',
      descripcion: 'Navegación ilimitada 12 horas + 4 SMS (EDUCATIVO)',
      categoria: 'PREPAGO',
      precio: 6.00,
    },
    {
      nombre: 'Paquete Ilimitado 2 días',
      descripcion: 'Navegación ilimitada 2 días + 7 SMS (EDUCATIVO)',
      categoria: 'PREPAGO',
      precio: 15.00,
    },
    // Fibra
    {
      nombre: 'Fibra 15',
      descripcion: 'Internet Fibra 15 Mbps (EDUCATIVO)',
      categoria: 'FIBRA',
      precio: 99.00,
    },
    {
      nombre: 'Fibra 30',
      descripcion: 'Internet Fibra 30 Mbps (EDUCATIVO)',
      categoria: 'FIBRA',
      precio: 149.00,
    },
    {
      nombre: 'Fibra 65',
      descripcion: 'Internet Fibra 65 Mbps (EDUCATIVO)',
      categoria: 'FIBRA',
      precio: 219.00,
    },
    {
      nombre: 'Fibra 105',
      descripcion: 'Internet Fibra 105 Mbps (EDUCATIVO)',
      categoria: 'FIBRA',
      precio: 340.00,
    },
  ];

  const productosCreados = await Promise.all(
    productos.map(async (producto) => {
      const existente = await prisma.producto.findFirst({
        where: { nombre: producto.nombre },
      });

      if (existente) {
        return prisma.producto.update({
          where: { id: existente.id },
          data: producto,
        });
      }

      return prisma.producto.create({
        data: producto,
      });
    })
  );

  console.log(`✅ ${productosCreados.length} productos creados\n`);

  // 3. Crear clientes ficticios
  console.log('👥 Creando clientes ficticios (La Paz, Bolivia)...');

  const clientes = await Promise.all(
    nombres.map((nombre, index) => {
      const plan = planes[Math.floor(Math.random() * planes.length)];
      const fechaRegistro = new Date();
      fechaRegistro.setDate(fechaRegistro.getDate() - Math.floor(Math.random() * 365));

      return prisma.cliente.create({
        data: {
          nombre,
          telefono: generarTelefono(),
          correo: generarCorreo(nombre),
          plan,
          estado: Math.random() > 0.2 ? 'ACTIVO' : 'INACTIVO',
          fechaRegistro,
          fechaUltimaActividad: Math.random() > 0.3 ? new Date() : null,
        },
      });
    })
  );

  console.log(`✅ ${clientes.length} clientes creados\n`);

  // 4. Crear promociones educativas inspiradas en Entel
  console.log('🎁 Creando promociones educativas...');

  const ahora = new Date();
  const enUnaSemana = new Date(ahora);
  enUnaSemana.setDate(enUnaSemana.getDate() + 7);

  const enUnMes = new Date(ahora);
  enUnMes.setMonth(enUnMes.getMonth() + 1);

  // Promoción 1: Doble Saldo Navidad (inspirada en promociones navideñas comunes)
  const promocion1 = await prisma.promocion.create({
    data: {
      nombre: 'Doble Saldo Navidad 2024',
      descripcion: 'Recarga doble saldo en paquetes prepago (EDUCATIVO)',
      tipoDescuento: 'PORCENTAJE',
      valorDescuento: 100.00, // 100% = doble saldo
      fechaInicio: ahora,
      fechaFin: enUnaSemana,
      estado: 'ACTIVA',
      segmentoObjetivo: JSON.stringify({
        plan: ['PREPAGO-BASICO', 'PREPAGO-MEDIO', 'PREPAGO-PREMIUM'],
      }),
      plantillaMensaje: '¡{nombre}! 🎄 Esta Navidad recarga doble saldo. Aprovecha nuestra promoción especial hasta el {fechaFin}. Marca *123# para activar. (EDUCATIVO)',
      totalEnviados: 0,
      totalConvertidos: 0,
    },
  });

  // Asociar productos prepago
  const productosPrepago = productosCreados.filter((p) => p.categoria === 'PREPAGO');
  await Promise.all(
    productosPrepago.map((producto) =>
      prisma.promocionProducto.create({
        data: {
          promocionId: promocion1.id,
          productoId: producto.id,
        },
      })
    )
  );

  // Promoción 2: PaqueGanes+ con Sorteo (inspirada en PaqueGanes+)
  const promocion2 = await prisma.promocion.create({
    data: {
      nombre: 'PaqueGanes+ Sorteo Navidad',
      descripcion: 'Compra PaqueGanes y participa en sorteo de premios (EDUCATIVO)',
      tipoDescuento: 'GRATIS',
      valorDescuento: 0.00,
      fechaInicio: ahora,
      fechaFin: enUnMes,
      estado: 'ACTIVA',
      segmentoObjetivo: JSON.stringify({
        plan: ['PREPAGO-BASICO', 'PREPAGO-MEDIO'],
      }),
      plantillaMensaje: '¡Hola {nombre}! 🎉 Al comprar PaqueGanes participas automáticamente en el sorteo de {monto} Bs. ¡Más datos, más oportunidades! (EDUCATIVO)',
      totalEnviados: 0,
      totalConvertidos: 0,
    },
  });

  // Asociar productos PaqueGanes
  const paqueganes = productosCreados.filter((p) => p.nombre.includes('PaqueGanes'));
  await Promise.all(
    paqueganes.map((producto) =>
      prisma.promocionProducto.create({
        data: {
          promocionId: promocion2.id,
          productoId: producto.id,
        },
      })
    )
  );

  // Promoción 3: Descuento Postpago (inspirada en promociones de retención)
  const promocion3 = await prisma.promocion.create({
    data: {
      nombre: '25% OFF Planes Postpago',
      descripcion: 'Descuento del 25% en planes postpago por 3 meses (EDUCATIVO)',
      tipoDescuento: 'PORCENTAJE',
      valorDescuento: 25.00,
      fechaInicio: ahora,
      fechaFin: enUnMes,
      estado: 'ACTIVA',
      segmentoObjetivo: JSON.stringify({
        plan: ['POSTPAGO-4G-10', 'POSTPAGO-4G-20', 'POSTPAGO-4G-50', 'POSTPAGO-4G-80', 'POSTPAGO-4G-100'],
      }),
      plantillaMensaje: '¡{nombre}! Obtén 25% de descuento en tu plan postpago por 3 meses. Válido hasta {fechaFin}. Llama al 103 o visita nuestras tiendas. (EDUCATIVO)',
      totalEnviados: 0,
      totalConvertidos: 0,
    },
  });

  // Asociar productos postpago
  const productosPostpago = productosCreados.filter((p) => p.categoria === 'POSTPAGO');
  await Promise.all(
    productosPostpago.map((producto) =>
      prisma.promocionProducto.create({
        data: {
          promocionId: promocion3.id,
          productoId: producto.id,
        },
      })
    )
  );

  // Promoción 4: Paquete Bicentenario (inspirada en PRO BICENTENARIO)
  const promocion4 = await prisma.promocion.create({
    data: {
      nombre: 'Paquete Especial Bicentenario',
      descripcion: '15.000 MB por Bs 99 válido 7 días (EDUCATIVO)',
      tipoDescuento: 'MONTO_FIJO',
      valorDescuento: 99.00,
      fechaInicio: ahora,
      fechaFin: enUnaSemana,
      estado: 'ACTIVA',
      segmentoObjetivo: JSON.stringify({
        plan: ['PREPAGO-BASICO', 'PREPAGO-MEDIO', 'PREPAGO-PREMIUM'],
      }),
      plantillaMensaje: '¡{nombre}! 📱 Paquete Especial: 15.000 MB por solo Bs 99 válido 7 días. Perfecto para navegar sin límites. Actívalo ahora marcando *123# (EDUCATIVO)',
      totalEnviados: 0,
      totalConvertidos: 0,
    },
  });

  // Promoción 5: Upgrade a Fibra (inspirada en promociones de servicios fijos)
  const promocion5 = await prisma.promocion.create({
    data: {
      nombre: 'Migra a Fibra - 30% OFF Primer Mes',
      descripcion: 'Descuento del 30% en el primer mes al migrar a Fibra (EDUCATIVO)',
      tipoDescuento: 'PORCENTAJE',
      valorDescuento: 30.00,
      fechaInicio: ahora,
      fechaFin: enUnMes,
      estado: 'PAUSADA', // Ejemplo de promoción pausada
      segmentoObjetivo: JSON.stringify({
        estado: ['ACTIVO'],
      }),
      plantillaMensaje: '¡{nombre}! 🚀 Disfruta de internet de alta velocidad. Migra a Fibra y obtén 30% OFF en tu primer mes. Velocidades desde 15 Mbps. (EDUCATIVO)',
      totalEnviados: 0,
      totalConvertidos: 0,
    },
  });

  // Asociar productos fibra
  const productosFibra = productosCreados.filter((p) => p.categoria === 'FIBRA');
  await Promise.all(
    productosFibra.map((producto) =>
      prisma.promocionProducto.create({
        data: {
          promocionId: promocion5.id,
          productoId: producto.id,
        },
      })
    )
  );

  console.log('✅ 5 promociones educativas creadas\n');

  // 5. Crear algunas notificaciones de ejemplo (historial)
  console.log('📬 Creando notificaciones de ejemplo...');

  const canales: Array<'SMS' | 'CORREO'> = ['SMS', 'CORREO'];
  const estados: Array<'ENVIADA' | 'ENTREGADA' | 'FALLIDA'> = ['ENVIADA', 'ENTREGADA', 'FALLIDA'];

  // Crear 20 notificaciones de ejemplo
  const notificaciones = await Promise.all(
    Array.from({ length: 20 }).map(async (_, index) => {
      const cliente = clientes[Math.floor(Math.random() * clientes.length)];
      const promocion = [promocion1, promocion2, promocion3][Math.floor(Math.random() * 3)];
      const canal = canales[Math.floor(Math.random() * canales.length)];
      const estado = estados[Math.floor(Math.random() * estados.length)];

      const fechaCreacion = new Date();
      fechaCreacion.setDate(fechaCreacion.getDate() - Math.floor(Math.random() * 30));

      // Todos los estados ya son enviados (no pendientes), así que siempre hay fechaEnviado
      const fechaEnviado = new Date(fechaCreacion.getTime() + Math.random() * 3600000);

      return prisma.notificacion.create({
        data: {
          clienteId: cliente.id,
          promocionId: promocion.id,
          canal,
          estado: estado as any,
          titulo: `Promoción ${promocion.nombre}`,
          mensaje: promocion.plantillaMensaje?.replace('{nombre}', cliente.nombre) || `Mensaje de prueba para ${cliente.nombre}`,
          fechaEnviado,
          fechaEntregado: estado === 'ENTREGADA' ? fechaEnviado : null,
          fechaFallido: estado === 'FALLIDA' ? fechaEnviado : null,
          mensajeError: estado === 'FALLIDA' ? 'Error de envío (simulado - EDUCATIVO)' : null,
        },
      });
    })
  );

  console.log(`✅ ${notificaciones.length} notificaciones de ejemplo creadas\n`);

  // 6. Crear algunas conversiones de ejemplo
  console.log('✅ Creando conversiones de ejemplo...');

  const conversiones = await Promise.all(
    clientes.slice(0, 8).map(async (cliente) => {
      const promocion = [promocion1, promocion2, promocion3][Math.floor(Math.random() * 3)];

      return prisma.clientePromocion.create({
        data: {
          clienteId: cliente.id,
          promocionId: promocion.id,
          estado: 'CONVERTIDA',
          fechaConversion: new Date(),
        },
      });
    })
  );

  // Actualizar totalConvertidos en promociones
  await Promise.all([
    prisma.promocion.update({
      where: { id: promocion1.id },
      data: {
        totalEnviados: notificaciones.filter((n) => n.promocionId === promocion1.id).length,
        totalConvertidos: conversiones.filter((c) => c.promocionId === promocion1.id).length,
      },
    }),
    prisma.promocion.update({
      where: { id: promocion2.id },
      data: {
        totalEnviados: notificaciones.filter((n) => n.promocionId === promocion2.id).length,
        totalConvertidos: conversiones.filter((c) => c.promocionId === promocion2.id).length,
      },
    }),
    prisma.promocion.update({
      where: { id: promocion3.id },
      data: {
        totalEnviados: notificaciones.filter((n) => n.promocionId === promocion3.id).length,
        totalConvertidos: conversiones.filter((c) => c.promocionId === promocion3.id).length,
      },
    }),
  ]);

  console.log(`✅ ${conversiones.length} conversiones de ejemplo creadas\n`);

  // Resumen final
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ SEED EDUCATIVO COMPLETADO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👤 Usuarios: ${2} (Admin + Operador)`);
  console.log(`👥 Clientes: ${clientes.length} (ficticios)`);
  console.log(`📦 Productos: ${productosCreados.length} (planes educativos)`);
  console.log(`🎁 Promociones: 5 (inspiradas en Entel)`);
  console.log(`📬 Notificaciones: ${notificaciones.length} (historial de ejemplo)`);
  console.log(`✅ Conversiones: ${conversiones.length} (ejemplo)`);
  console.log('');
  console.log('⚠️  RECORDATORIO:');
  console.log('   - Todos los datos son FICTICIOS y EDUCATIVOS');
  console.log('   - No tiene fines lucrativos');
  console.log('   - Inspirado en información pública de Entel Bolivia');
  console.log('   - Usar solo para demostración y aprendizaje');
  console.log('');
  console.log('🔑 Credenciales de acceso:');
  console.log(`   Admin: admin@entel-educativo.bo / admin123`);
  console.log(`   Operador: operador@entel-educativo.bo / operador123`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

