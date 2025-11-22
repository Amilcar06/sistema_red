import promotionService from '../../../src/services/promotion.service';
import prisma from '../../../src/config/database';
import { AppError } from '../../../src/utils/errors';

// Mock de Prisma
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockFindMany = jest.fn();
const mockCount = jest.fn();
const mockUpdate = jest.fn();
const mockCreateMany = jest.fn();

jest.mock('../../../src/config/database', () => {
  return {
    __esModule: true,
    default: {
      promocion: {
        findUnique: (...args: any[]) => mockFindUnique(...args),
        create: (...args: any[]) => mockCreate(...args),
        findMany: (...args: any[]) => mockFindMany(...args),
        count: (...args: any[]) => mockCount(...args),
        update: (...args: any[]) => mockUpdate(...args),
      },
      promocionProducto: {
        createMany: (...args: any[]) => mockCreateMany(...args),
      },
    },
  };
});

describe('PromotionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const promotionData = {
      nombre: 'Promoción Test',
      descripcion: 'Descripción de la promoción',
      tipoDescuento: 'PORCENTAJE' as const,
      valorDescuento: 20,
      fechaInicio: new Date('2024-01-01'),
      fechaFin: new Date('2024-12-31'),
      productoIds: ['product-1', 'product-2'],
    };

    it('debería crear una promoción exitosamente', async () => {
      // Arrange
      const createdPromotion = {
        id: 'promotion-id',
        nombre: promotionData.nombre,
        estado: 'BORRADOR',
        fechaCreacion: new Date(),
      };

      mockCreate.mockResolvedValue(createdPromotion as any);
      mockFindUnique.mockResolvedValue({
        ...createdPromotion,
        productos: [],
        reglas: [],
        clientes: [],
      } as any);
      mockCreateMany.mockResolvedValue({ count: 2 } as any);

      // Act
      const result = await promotionService.create(promotionData);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nombre: promotionData.nombre,
          estado: 'BORRADOR',
        }),
      });
      expect(mockCreateMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          { promocionId: 'promotion-id', productoId: 'product-1' },
          { promocionId: 'promotion-id', productoId: 'product-2' },
        ]),
      });
      expect(result).toHaveProperty('id');
    });

    it('debería lanzar error si fechaFin <= fechaInicio', async () => {
      // Arrange
      const invalidData = {
        ...promotionData,
        fechaInicio: new Date('2024-12-31'),
        fechaFin: new Date('2024-01-01'), // Fecha fin anterior a inicio
      };

      // Act & Assert
      await expect(promotionService.create(invalidData)).rejects.toThrow(AppError);
      await expect(promotionService.create(invalidData)).rejects.toThrow('La fecha de fin debe ser posterior a la de inicio');
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debería retornar lista paginada de promociones', async () => {
      // Arrange
      const filters = {
        pagina: 1,
        limite: 10,
      };

      const mockPromotions = [
        {
          id: 'promotion-1',
          nombre: 'Promoción 1',
          estado: 'ACTIVA',
          fechaCreacion: new Date(),
          productos: [],
        },
      ];

      mockFindMany.mockResolvedValue(mockPromotions as any);
      mockCount.mockResolvedValue(1);

      // Act
      const result = await promotionService.findAll(filters);

      // Assert
      expect(mockFindMany).toHaveBeenCalled();
      expect(result.datos).toEqual(mockPromotions);
      expect(result.paginacion.total).toBe(1);
      expect(result.paginacion.pagina).toBe(1);
      expect(result.paginacion.limite).toBe(10);
    });

    it('debería filtrar por estado si se proporciona', async () => {
      // Arrange
      const filters = {
        estado: 'ACTIVA',
        pagina: 1,
        limite: 10,
      };

      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await promotionService.findAll(filters);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            estado: 'ACTIVA',
          }),
        })
      );
    });

    it('debería buscar por nombre o descripción si se proporciona búsqueda', async () => {
      // Arrange
      const filters = {
        busqueda: 'Test',
        pagina: 1,
        limite: 10,
      };

      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await promotionService.findAll(filters);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                nombre: expect.objectContaining({
                  contains: 'Test',
                }),
              }),
              expect.objectContaining({
                descripcion: expect.objectContaining({
                  contains: 'Test',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('debería convertir query params string a número', async () => {
      // Arrange
      const filters = {
        pagina: '2',
        limite: '20',
      };

      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      const result = await promotionService.findAll(filters);

      // Assert
      expect(result.paginacion.pagina).toBe(2);
      expect(result.paginacion.limite).toBe(20);
    });
  });

  describe('findById', () => {
    it('debería retornar promoción si existe', async () => {
      // Arrange
      const promotionId = 'promotion-id';
      const mockPromotion = {
        id: promotionId,
        nombre: 'Promoción Test',
        estado: 'ACTIVA',
        productos: [],
        reglas: [],
        clientes: [],
      };

      mockFindUnique.mockResolvedValue(mockPromotion as any);

      // Act
      const result = await promotionService.findById(promotionId);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: promotionId },
        include: {
          productos: expect.any(Object),
          reglas: expect.any(Object),
          clientes: expect.any(Object),
        },
      });
      expect(result).toEqual(mockPromotion);
    });

    it('debería lanzar error si la promoción no existe', async () => {
      // Arrange
      const promotionId = 'non-existent-id';
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(promotionService.findById(promotionId)).rejects.toThrow(AppError);
      await expect(promotionService.findById(promotionId)).rejects.toThrow('Promoción no encontrada');
    });
  });

  describe('update', () => {
    it('debería actualizar promoción exitosamente', async () => {
      // Arrange
      const promotionId = 'promotion-id';
      const updateData = {
        nombre: 'Promoción Actualizada',
      };

      const updatedPromotion = {
        id: promotionId,
        nombre: 'Promoción Actualizada',
        estado: 'ACTIVA',
        fechaActualizacion: new Date(),
      };

      mockFindUnique.mockResolvedValue({ id: promotionId } as any);
      mockUpdate.mockResolvedValue(updatedPromotion as any);

      // Act
      const result = await promotionService.update(promotionId, updateData);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: promotionId },
        data: updateData,
      });
      expect(result).toEqual(updatedPromotion);
    });
  });
});

