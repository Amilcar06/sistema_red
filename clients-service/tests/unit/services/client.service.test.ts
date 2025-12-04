import clientService from '../../../src/services/client.service';
import { AppError } from '../../../src/utils/errors';

// Mock de Prisma
const mockFindFirst = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockFindMany = jest.fn();
const mockCount = jest.fn();
const mockGroupBy = jest.fn();

jest.mock('../../../src/config/database', () => {
  return {
    __esModule: true,
    default: {
      cliente: {
        findFirst: (...args: any[]) => mockFindFirst(...args),
        findUnique: (...args: any[]) => mockFindUnique(...args),
        create: (...args: any[]) => mockCreate(...args),
        update: (...args: any[]) => mockUpdate(...args),
        delete: (...args: any[]) => mockDelete(...args),
        findMany: (...args: any[]) => mockFindMany(...args),
        count: (...args: any[]) => mockCount(...args),
        groupBy: (...args: any[]) => mockGroupBy(...args),
      },
    },
  };
});

describe('ClientService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const clientData = {
      nombre: 'Juan Pérez',
      telefono: '1234567890',
      correo: 'juan@example.com',
      plan: 'Plan Básico',
      estado: 'ACTIVO' as const,
    };

    it('debería crear un cliente exitosamente', async () => {
      // Arrange
      mockFindFirst.mockResolvedValue(null);
      const createdClient = {
        id: 'client-id',
        ...clientData,
        fechaRegistro: new Date(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      mockCreate.mockResolvedValue(createdClient as any);

      // Act
      const result = await clientService.create(clientData);

      // Assert
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { telefono: clientData.telefono },
      });
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          nombre: clientData.nombre,
          telefono: clientData.telefono,
          correo: clientData.correo,
          plan: clientData.plan,
          estado: clientData.estado,
        },
      });
      expect(result).toEqual(createdClient);
    });

    it('debería lanzar error si el teléfono ya existe', async () => {
      // Arrange
      const existingClient = {
        id: 'existing-id',
        telefono: clientData.telefono,
      };
      mockFindFirst.mockResolvedValue(existingClient as any);

      // Act & Assert
      await expect(clientService.create(clientData)).rejects.toThrow(AppError);
      await expect(clientService.create(clientData)).rejects.toThrow('El teléfono ya está registrado');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('debería usar estado ACTIVO por defecto si no se proporciona', async () => {
      // Arrange
      const clientDataSinEstado = {
        nombre: 'Juan Pérez',
        telefono: '1234567891',
        plan: 'Plan Básico',
      };

      mockFindFirst.mockResolvedValue(null);
      const createdClient = {
        id: 'client-id',
        ...clientDataSinEstado,
        estado: 'ACTIVO',
        fechaRegistro: new Date(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      mockCreate.mockResolvedValue(createdClient as any);

      // Act
      await clientService.create(clientDataSinEstado as any);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          estado: 'ACTIVO',
        }),
      });
    });
  });

  describe('findAll', () => {
    it('debería retornar lista paginada de clientes', async () => {
      // Arrange
      const filters = {
        pagina: 1,
        limite: 10,
      };

      const mockClients = [
        {
          id: 'client-1',
          nombre: 'Cliente 1',
          telefono: '1234567890',
          plan: 'Plan Básico',
          estado: 'ACTIVO',
          fechaCreacion: new Date(),
        },
      ];

      mockFindMany.mockResolvedValue(mockClients as any);
      mockCount.mockResolvedValue(1);

      // Act
      const result = await clientService.findAll(filters);

      // Assert
      expect(mockFindMany).toHaveBeenCalled();
      expect(result.datos).toEqual(mockClients);
      expect(result.paginacion.total).toBe(1);
      expect(result.paginacion.pagina).toBe(1);
      expect(result.paginacion.limite).toBe(10);
    });

    it('debería filtrar por estado si se proporciona', async () => {
      // Arrange
      const filters = {
        estado: 'ACTIVO',
        pagina: 1,
        limite: 10,
      };

      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await clientService.findAll(filters);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            estado: 'ACTIVO',
          }),
        })
      );
    });

    it('debería buscar por nombre o teléfono si se proporciona búsqueda', async () => {
      // Arrange
      const filters = {
        busqueda: 'Juan',
        pagina: 1,
        limite: 10,
      };

      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await clientService.findAll(filters);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                nombre: expect.objectContaining({
                  contains: 'Juan',
                }),
              }),
              expect.objectContaining({
                telefono: expect.objectContaining({
                  contains: 'Juan',
                }),
              }),
            ]),
          }),
        })
      );
    });
  });

  describe('findById', () => {
    it('debería retornar cliente si existe', async () => {
      // Arrange
      const clientId = 'client-id';
      const mockClient = {
        id: clientId,
        nombre: 'Juan Pérez',
        telefono: '1234567890',
        plan: 'Plan Básico',
        estado: 'ACTIVO',
        fechaCreacion: new Date(),
      };

      mockFindUnique.mockResolvedValue(mockClient as any);

      // Act
      const result = await clientService.findById(clientId);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: clientId },
        include: {
          notificaciones: expect.any(Object),
          promociones: expect.any(Object),
        },
      });
      expect(result).toEqual(mockClient);
    });

    it('debería lanzar error si el cliente no existe', async () => {
      // Arrange
      const clientId = 'non-existent-id';
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(clientService.findById(clientId)).rejects.toThrow(AppError);
      await expect(clientService.findById(clientId)).rejects.toThrow('Cliente no encontrado');
    });
  });

  describe('update', () => {
    it('debería actualizar cliente exitosamente', async () => {
      // Arrange
      const clientId = 'client-id';
      const updateData = {
        nombre: 'Juan Pérez Actualizado',
      };

      const existingClient = {
        id: clientId,
        nombre: 'Juan Pérez',
        telefono: '1234567890',
        plan: 'Plan Básico',
      };

      const updatedClient = {
        ...existingClient,
        ...updateData,
        fechaActualizacion: new Date(),
      };

      mockFindUnique.mockResolvedValue(existingClient as any);
      mockUpdate.mockResolvedValue(updatedClient as any);

      // Act
      const result = await clientService.update(clientId, updateData);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: clientId },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: clientId },
        data: expect.objectContaining({
          ...updateData,
          fechaUltimaActividad: expect.any(Date),
        }),
      });
      expect(result).toEqual(updatedClient);
    });

    it('debería lanzar error si el cliente no existe', async () => {
      // Arrange
      const clientId = 'non-existent-id';
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(clientService.update(clientId, {})).rejects.toThrow(AppError);
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('debería eliminar cliente exitosamente', async () => {
      // Arrange
      const clientId = 'client-id';
      const existingClient = {
        id: clientId,
        nombre: 'Juan Pérez',
      };

      mockFindUnique.mockResolvedValue(existingClient as any);
      mockDelete.mockResolvedValue(existingClient as any);

      // Act
      const result = await clientService.delete(clientId);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: clientId },
      });
      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: clientId },
      });
      expect(result).toEqual(existingClient);
    });

    it('debería lanzar error si el cliente no existe', async () => {
      // Arrange
      const clientId = 'non-existent-id';
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(clientService.delete(clientId)).rejects.toThrow(AppError);
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });
});

