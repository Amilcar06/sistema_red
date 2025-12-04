import productService from '../../../src/services/product.service';
import { AppError } from '../../../src/utils/errors';

// Mock de Prisma
const mockFindUnique = jest.fn();
const mockFindFirst = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockFindMany = jest.fn();
const mockCount = jest.fn();

jest.mock('../../../src/config/database', () => {
  return {
    __esModule: true,
    default: {
      producto: {
        findUnique: (...args: any[]) => mockFindUnique(...args),
        findFirst: (...args: any[]) => mockFindFirst(...args),
        create: (...args: any[]) => mockCreate(...args),
        update: (...args: any[]) => mockUpdate(...args),
        delete: (...args: any[]) => mockDelete(...args),
        findMany: (...args: any[]) => mockFindMany(...args),
        count: (...args: any[]) => mockCount(...args),
      },
    },
  };
});

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const productData = {
      nombre: 'Producto Test',
      descripcion: 'Descripción del producto',
      categoria: 'Categoria Test',
      precio: 99.99,
    };

    it('debería crear un producto exitosamente', async () => {
      // Arrange
      const createdProduct = {
        id: 'product-id',
        ...productData,
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      mockCreate.mockResolvedValue(createdProduct as any);

      // Act
      const result = await productService.create(productData);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: productData,
      });
      expect(result).toEqual(createdProduct);
    });
  });

  describe('findAll', () => {
    it('debería retornar lista paginada de productos', async () => {
      // Arrange
      const filters = {
        pagina: 1,
        limite: 10,
      };

      const mockProducts = [
        {
          id: 'product-1',
          nombre: 'Producto 1',
          categoria: 'Categoria 1',
          precio: 100,
          activo: true,
          fechaCreacion: new Date(),
        },
      ];

      mockFindMany.mockResolvedValue(mockProducts as any);
      mockCount.mockResolvedValue(1);

      // Act
      const result = await productService.findAll(filters);

      // Assert
      expect(mockFindMany).toHaveBeenCalled();
      expect(result.datos).toEqual(mockProducts);
      expect(result.paginacion.total).toBe(1);
      expect(result.paginacion.pagina).toBe(1);
      expect(result.paginacion.limite).toBe(10);
    });

    it('debería filtrar por categoría si se proporciona', async () => {
      // Arrange
      const filters = {
        categoria: 'Categoria Test',
        pagina: 1,
        limite: 10,
      };

      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await productService.findAll(filters);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoria: 'Categoria Test',
          }),
        })
      );
    });

    it('debería filtrar por activo si se proporciona', async () => {
      // Arrange
      const filters = {
        activo: 'true',
        pagina: 1,
        limite: 10,
      };

      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await productService.findAll(filters);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            activo: true,
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
      const result = await productService.findAll(filters);

      // Assert
      expect(result.paginacion.pagina).toBe(2);
      expect(result.paginacion.limite).toBe(20);
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (2-1) * 20
          take: 20,
        })
      );
    });
  });

  describe('findById', () => {
    it('debería retornar producto si existe', async () => {
      // Arrange
      const productId = 'product-id';
      const mockProduct = {
        id: productId,
        nombre: 'Producto Test',
        categoria: 'Categoria Test',
        precio: 99.99,
        activo: true,
        promociones: [],
        fechaCreacion: new Date(),
      };

      mockFindUnique.mockResolvedValue(mockProduct as any);

      // Act
      const result = await productService.findById(productId);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: {
          promociones: expect.any(Object),
        },
      });
      expect(result).toEqual(mockProduct);
    });

    it('debería lanzar error si el producto no existe', async () => {
      // Arrange
      const productId = 'non-existent-id';
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(productService.findById(productId)).rejects.toThrow(AppError);
      await expect(productService.findById(productId)).rejects.toThrow('Producto no encontrado');
    });
  });

  describe('update', () => {
    it('debería actualizar producto exitosamente', async () => {
      // Arrange
      const productId = 'product-id';
      const updateData = {
        nombre: 'Producto Actualizado',
      };

      const updatedProduct = {
        id: productId,
        nombre: 'Producto Actualizado',
        categoria: 'Categoria Test',
        precio: 99.99,
        activo: true,
        fechaActualizacion: new Date(),
      };

      mockUpdate.mockResolvedValue(updatedProduct as any);

      // Act
      const result = await productService.update(productId, updateData);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateData,
      });
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('delete', () => {
    it('debería eliminar producto exitosamente', async () => {
      // Arrange
      const productId = 'product-id';
      const deletedProduct = {
        id: productId,
        nombre: 'Producto Test',
      };

      mockDelete.mockResolvedValue(deletedProduct as any);

      // Act
      const result = await productService.delete(productId);

      // Assert
      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toEqual(deletedProduct);
    });
  });
});

