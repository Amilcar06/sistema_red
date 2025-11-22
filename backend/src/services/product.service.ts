import prisma from '../config/database';
import { AppError } from '../utils/errors';

interface CreateProductData {
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio: number;
}

class ProductService {
  async create(data: CreateProductData) {
    return prisma.producto.create({
      data,
    });
  }

  async findAll(filters: any = {}) {
    const { categoria, activo, pagina = 1, limite = 10 } = filters;
    // Convertir a números ya que los query params vienen como strings
    const paginaNum = typeof pagina === 'string' ? parseInt(pagina, 10) : pagina;
    const limiteNum = typeof limite === 'string' ? parseInt(limite, 10) : limite;
    const skip = (paginaNum - 1) * limiteNum;
    const where: any = {};

    if (categoria) {
      where.categoria = categoria;
    }

    if (activo !== undefined) {
      where.activo = activo === 'true' || activo === true;
    }

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        skip,
        take: limiteNum,
        orderBy: { fechaCreacion: 'desc' },
      }),
      prisma.producto.count({ where }),
    ]);

    return {
      datos: productos,
      paginacion: {
        pagina: paginaNum,
        limite: limiteNum,
        total,
        totalPaginas: Math.ceil(total / limiteNum),
      },
    };
  }

  async findById(id: string) {
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        promociones: {
          include: {
            promocion: true,
          },
        },
      },
    });

    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    return producto;
  }

  async update(id: string, data: Partial<CreateProductData>) {
    return prisma.producto.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.producto.delete({
      where: { id },
    });
  }
}

export default new ProductService();
