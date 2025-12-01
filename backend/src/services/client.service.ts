import prisma from '../config/database';
import { AppError } from '../utils/errors';
import cacheService from './cache.service';

interface CreateClientData {
  nombre: string;
  paterno: string;
  materno?: string;
  telefono: string;
  correo?: string;
  plan: string;
  estado?: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
}

interface UpdateClientData extends Partial<CreateClientData> { }

export interface ClientFilters {
  search?: string;
  busqueda?: string;
  estado?: string;
  plan?: string;
  pagina?: number;
  limite?: number;
}

class ClientService {
  async create(data: CreateClientData) {
    // Validar que el teléfono no exista
    const existingClient = await prisma.cliente.findFirst({
      where: { telefono: data.telefono },
    });

    if (existingClient) {
      throw new AppError('El teléfono ya está registrado', 400);
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre: data.nombre,
        paterno: data.paterno,
        materno: data.materno,
        telefono: data.telefono,
        correo: data.correo,
        plan: data.plan,
        estado: data.estado || 'ACTIVO',
      },
    });

    // Invalidar caché de estadísticas
    await this.invalidateStatisticsCache();

    return cliente;
  }

  async findAll(filters: ClientFilters = {}) {
    const {
      busqueda,
      estado,
      plan,
      pagina = 1,
      limite = 10,
    } = filters;

    // Convertir a números ya que los query params vienen como strings
    const paginaNum = typeof pagina === 'string' ? parseInt(pagina, 10) : pagina;
    const limiteNum = typeof limite === 'string' ? parseInt(limite, 10) : limite;
    const skip = (paginaNum - 1) * limiteNum;
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { paterno: { contains: filters.search, mode: 'insensitive' } },
        { materno: { contains: filters.search, mode: 'insensitive' } },
        { telefono: { contains: filters.search, mode: 'insensitive' } },
        { correo: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (estado) {
      where.estado = estado;
    }

    if (plan) {
      where.plan = plan;
    }

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: limiteNum,
        orderBy: { fechaCreacion: 'desc' },
      }),
      prisma.cliente.count({ where }),
    ]);

    return {
      datos: clientes,
      paginacion: {
        pagina: paginaNum,
        limite: limiteNum,
        total,
        totalPaginas: Math.ceil(total / limiteNum),
      },
    };
  }

  async findById(id: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        notificaciones: {
          take: 5,
          orderBy: { fechaCreacion: 'desc' },
        },
        promociones: {
          include: {
            promocion: true,
          },
          take: 5,
        },
      },
    });

    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }

    return cliente;
  }

  async update(id: string, data: UpdateClientData) {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }

    // Si se actualiza el teléfono, verificar que no exista
    if (data.telefono && data.telefono !== cliente.telefono) {
      const existingClient = await prisma.cliente.findFirst({
        where: { telefono: data.telefono },
      });

      if (existingClient) {
        throw new AppError('El teléfono ya está registrado', 400);
      }
    }

    return prisma.cliente.update({
      where: { id },
      data: {
        nombre: data.nombre,
        paterno: data.paterno,
        materno: data.materno,
        telefono: data.telefono,
        correo: data.correo,
        plan: data.plan,
        estado: data.estado,
        fechaUltimaActividad: new Date(),
      },
    });
  }

  async delete(id: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }

    const deleted = await prisma.cliente.delete({
      where: { id },
    });

    // Invalidar caché de estadísticas
    await this.invalidateStatisticsCache();

    return deleted;
  }

  async getStatistics() {
    const cacheKey = 'client:statistics';

    // Intentar obtener del caché (5 minutos TTL)
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Si no está en caché, obtener de la base de datos
    const [total, activos, inactivos, porPlan] = await Promise.all([
      prisma.cliente.count(),
      prisma.cliente.count({ where: { estado: 'ACTIVO' } }),
      prisma.cliente.count({ where: { estado: 'INACTIVO' } }),
      prisma.cliente.groupBy({
        by: ['plan'],
        _count: true,
      }),
    ]);

    const statistics = {
      total,
      activos,
      inactivos,
      porPlan: porPlan.map((item: { plan: string; _count: number }) => ({
        plan: item.plan,
        cantidad: item._count,
      })),
    };

    // Guardar en caché por 5 minutos
    await cacheService.set(cacheKey, statistics, 300);

    return statistics;
  }

  /**
   * Invalidar caché de estadísticas (llamar después de crear/actualizar/eliminar)
   */
  async invalidateStatisticsCache() {
    await cacheService.deletePattern('client:statistics*');
  }

  async getPlans() {
    const plans = await prisma.cliente.findMany({
      select: {
        plan: true,
      },
      distinct: ['plan'],
      orderBy: {
        plan: 'asc',
      },
    });
    return plans.map((p) => p.plan);
  }
}

export default new ClientService();
