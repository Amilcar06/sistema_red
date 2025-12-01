import prisma from '../config/database';
import { AppError } from '../utils/errors';

interface CreateRuleData {
  nombre: string;
  descripcion?: string;
  tipoRegla: 'ELEGIBILIDAD' | 'DESCUENTO' | 'NOTIFICACION' | 'PROGRAMACION';
  condiciones: any;
  acciones: any;
  prioridad?: number;
}

class RuleService {
  async create(data: CreateRuleData) {
    return prisma.reglaNegocio.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipoRegla: data.tipoRegla,
        condiciones: data.condiciones,
        acciones: data.acciones,
        prioridad: data.prioridad || 0,
      },
    });
  }

  async findAll(filters: any = {}) {
    const { search, tipoRegla, activa } = filters;
    const where: any = {};

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tipoRegla) {
      where.tipoRegla = tipoRegla;
    }

    if (activa !== undefined) {
      where.activa = activa === 'true' || activa === true;
    }

    return prisma.reglaNegocio.findMany({
      where,
      orderBy: [
        { prioridad: 'desc' },
        { fechaCreacion: 'desc' },
      ],
    });
  }

  async findById(id: string) {
    const rule = await prisma.reglaNegocio.findUnique({
      where: { id },
      include: {
        promociones: {
          include: {
            promocion: true,
          },
        },
      },
    });

    if (!rule) {
      throw new AppError('Regla no encontrada', 404);
    }

    return rule;
  }

  async update(id: string, data: Partial<CreateRuleData>) {
    return prisma.reglaNegocio.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.reglaNegocio.delete({
      where: { id },
    });
  }

  async assignToPromotion(ruleId: string, promotionId: string) {
    return prisma.promocionRegla.create({
      data: {
        reglaId: ruleId,
        promocionId: promotionId,
      },
    });
  }
}

export default new RuleService();

