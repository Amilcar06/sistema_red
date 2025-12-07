import prisma from '../config/database';
import { AppError } from '../utils/errors';
import axios from 'axios';

interface CreatePromotionData {
  nombre: string;
  descripcion?: string;
  tipoDescuento: 'PORCENTAJE' | 'MONTO_FIJO' | 'GRATIS';
  valorDescuento: number;
  fechaInicio: Date;
  fechaFin: Date;
  segmentoObjetivo?: string;
  plantillaMensaje?: string;
  productoIds?: string[];
}

class PromotionService {
  async create(data: CreatePromotionData) {
    // Validar fechas
    const fechaInicio = new Date(data.fechaInicio);
    const fechaFin = new Date(data.fechaFin);

    if (fechaFin <= fechaInicio) {
      throw new AppError('La fecha de fin debe ser posterior a la de inicio', 400);
    }

    const promocion = await prisma.promocion.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipoDescuento: data.tipoDescuento,
        valorDescuento: data.valorDescuento,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        segmentoObjetivo: data.segmentoObjetivo,
        plantillaMensaje: data.plantillaMensaje,
        estado: 'BORRADOR',
      },
    });

    // Asociar productos si se proporcionan
    if (data.productoIds && data.productoIds.length > 0) {
      await prisma.promocionProducto.createMany({
        data: data.productoIds.map((productoId) => ({
          promocionId: promocion.id,
          productoId,
        })),
      });
    }

    return this.findById(promocion.id);
  }

  async findAll(filters: any = {}) {
    const {
      estado,
      busqueda,
      pagina = 1,
      limite = 10,
    } = filters;

    // Convertir a números ya que los query params vienen como strings
    const paginaNum = typeof pagina === 'string' ? parseInt(pagina, 10) : pagina;
    const limiteNum = typeof limite === 'string' ? parseInt(limite, 10) : limite;
    const skip = (paginaNum - 1) * limiteNum;
    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    const [promociones, total] = await Promise.all([
      prisma.promocion.findMany({
        where,
        skip,
        take: limiteNum,
        include: {
          productos: {
            include: {
              producto: true,
            },
          },
        },
        orderBy: { fechaCreacion: 'desc' },
      }),
      prisma.promocion.count({ where }),
    ]);

    return {
      datos: promociones,
      paginacion: {
        pagina: paginaNum,
        limite: limiteNum,
        total,
        totalPaginas: Math.ceil(total / limiteNum),
      },
    };
  }

  async findById(id: string) {
    const promocion = await prisma.promocion.findUnique({
      where: { id },
      include: {
        productos: {
          include: {
            producto: true,
          },
        },
        reglas: {
          include: {
            regla: true,
          },
        },
        clientes: {
          include: {
            cliente: true,
          },
        },
      },
    });

    if (!promocion) {
      throw new AppError('Promoción no encontrada', 404);
    }

    return promocion;
  }

  async activate(id: string) {
    const promocion = await this.findById(id);

    if (promocion.estado !== 'BORRADOR' && promocion.estado !== 'PAUSADA') {
      throw new AppError('Solo se pueden activar promociones en borrador o pausadas', 400);
    }

    if (new Date() > promocion.fechaFin) {
      throw new AppError('La promoción ya expiró', 400);
    }

    return prisma.promocion.update({
      where: { id },
      data: {
        estado: 'ACTIVA',
      },
    });
  }

  async pause(id: string) {
    return prisma.promocion.update({
      where: { id },
      data: {
        estado: 'PAUSADA',
      },
    });
  }

  async getStatistics(id: string) {
    const promocion = await this.findById(id);

    const tasaConversion =
      promocion.totalEnviados > 0
        ? (promocion.totalConvertidos / promocion.totalEnviados) * 100
        : 0;

    return {
      ...promocion,
      tasaConversion: parseFloat(tasaConversion.toFixed(2)),
    };
  }

  async update(id: string, data: Partial<CreatePromotionData>) {
    return prisma.promocion.update({
      where: { id },
      data: {
        ...data,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
      },
    });
  }

  async delete(id: string) {
    return prisma.promocion.delete({
      where: { id },
    });
  }

  async getSegments() {
    const segments = await prisma.promocion.findMany({
      select: {
        segmentoObjetivo: true,
      },
      where: {
        segmentoObjetivo: {
          not: null,
        },
      },
      distinct: ['segmentoObjetivo'],
      orderBy: {
        segmentoObjetivo: 'asc',
      },
    });
    return segments.map((s) => s.segmentoObjetivo).filter(Boolean);
  }

  async launch(id: string, canal: 'SMS' | 'WHATSAPP' | 'EMAIL', plantillaMensaje?: string) {
    const promocion = await this.findById(id);

    if (!promocion) {
      throw new AppError('Promoción no encontrada', 404);
    }

    const notifications = [];

    for (const clientePromocion of promocion.clientes) {
      const cliente = clientePromocion.cliente;

      // Personalizar mensaje
      let mensajePersonalizado = plantillaMensaje || promocion.plantillaMensaje || '';
      mensajePersonalizado = mensajePersonalizado
        .replace(/{nombre}/g, cliente.nombre)
        .replace(/{plan}/g, cliente.plan);

      notifications.push({
        clientId: cliente.id,
        promotionId: id,
        channel: canal,
        message: mensajePersonalizado,
      });
    }

    // Enviar notificaciones vía HTTP al microservicio de notificaciones
    const NOTIFICATIONS_SERVICE_URL = process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3004';

    try {
      const response = await axios.post(`${NOTIFICATIONS_SERVICE_URL}/api/v1/notifications/send-batch`, {
        notifications
      });
      return response.data;
    } catch (error: any) {
      console.error('Error sending batch notifications:', error.message);
      throw new AppError('Error al enviar notificaciones: ' + (error.response?.data?.message || error.message), 502);
    }
  }

  async addClient(promocionId: string, clienteId: string) {
    const promocion = await this.findById(promocionId);

    // Verificar si ya existe la relación
    const existing = await prisma.clientePromocion.findUnique({
      where: {
        clienteId_promocionId: {
          clienteId,
          promocionId,
        },
      },
    });

    if (existing) {
      throw new AppError('El cliente ya está asignado a esta promoción', 400);
    }

    return prisma.clientePromocion.create({
      data: {
        promocionId,
        clienteId,
        estado: 'PENDIENTE',
      },
    });
  }

  async removeClient(promocionId: string, clienteId: string) {
    return prisma.clientePromocion.delete({
      where: {
        clienteId_promocionId: {
          clienteId,
          promocionId,
        },
      },
    });
  }

  async getAudience(promocionId: string) {
    const promocion = await prisma.promocion.findUnique({
      where: { id: promocionId },
      include: {
        clientes: {
          include: {
            cliente: true,
          },
          orderBy: {
            fechaCreacion: 'desc',
          },
        },
      },
    });

    if (!promocion) {
      throw new AppError('Promoción no encontrada', 404);
    }

    return promocion.clientes.map((cp) => ({
      ...cp.cliente,
      estadoPromocion: cp.estado,
      fechaAsignacion: cp.fechaCreacion,
    }));
  }
}

export default new PromotionService();

