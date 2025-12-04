import notificationService from '../../../src/services/notification.service';
import prisma from '../../../src/config/database';
import { AppError } from '../../../src/utils/errors';

// Mock de Prisma
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindMany = jest.fn();
const mockCount = jest.fn();
const mockFindUnique = jest.fn();
const mockFindFirst = jest.fn();

// Mock de Bull Queue
const mockQueueAdd = jest.fn();
const mockQueue = {
  add: mockQueueAdd,
};

jest.mock('../../../src/config/database', () => {
  return {
    __esModule: true,
    default: {
      notificacion: {
        create: (...args: any[]) => mockCreate(...args),
        update: (...args: any[]) => mockUpdate(...args),
        findMany: (...args: any[]) => mockFindMany(...args),
        count: (...args: any[]) => mockCount(...args),
        findUnique: (...args: any[]) => mockFindUnique(...args),
        findFirst: (...args: any[]) => mockFindFirst(...args),
      },
      cliente: {
        findMany: jest.fn(),
      },
    },
  };
});

jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => mockQueue);
});

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('send', () => {
    const notificationData = {
      clientId: 'client-id',
      promotionId: 'promotion-id',
      channel: 'SMS' as const,
      message: 'Mensaje de prueba',
      title: 'Título',
    };

    it('debería crear notificación y agregarla a la cola', async () => {
      // Arrange
      const createdNotification = {
        id: 'notification-id',
        ...notificationData,
        canal: 'SMS',
        estado: 'EN_COLA',
        fechaCreacion: new Date(),
      };

      mockCreate.mockResolvedValue(createdNotification as any);
      mockQueueAdd.mockResolvedValue({} as any);

      // Act
      const result = await notificationService.send(notificationData);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clienteId: notificationData.clientId,
          promocionId: notificationData.promotionId,
          canal: 'SMS',
          mensaje: notificationData.message,
          estado: 'EN_COLA',
        }),
      });
      expect(mockQueueAdd).toHaveBeenCalledWith('send', expect.objectContaining({
        notificationId: 'notification-id',
        ...notificationData,
      }));
      expect(result).toEqual(createdNotification);
    });

    it('debería convertir EMAIL a CORREO para el canal', async () => {
      // Arrange
      const emailData = {
        ...notificationData,
        channel: 'EMAIL' as const,
      };

      const createdNotification = {
        id: 'notification-id',
        canal: 'CORREO',
        estado: 'EN_COLA',
        fechaCreacion: new Date(),
      };

      mockCreate.mockResolvedValue(createdNotification as any);
      mockQueueAdd.mockResolvedValue({} as any);

      // Act
      await notificationService.send(emailData);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          canal: 'CORREO',
        }),
      });
    });
  });

  describe('getHistory', () => {
    it('debería retornar historial paginado de notificaciones', async () => {
      // Arrange
      const filters = {
        pagina: 1,
        limite: 20,
      };

      const mockNotifications = [
        {
          id: 'notification-1',
          canal: 'SMS',
          estado: 'ENVIADA',
          mensaje: 'Test',
          fechaCreacion: new Date(),
          cliente: null,
          promocion: null,
        },
      ];

      mockFindMany.mockResolvedValue(mockNotifications as any);
      mockCount.mockResolvedValue(1);

      // Act
      const result = await notificationService.getHistory(filters);

      // Assert
      expect(mockFindMany).toHaveBeenCalled();
      expect(result.datos).toEqual(mockNotifications);
      expect(result.paginacion.total).toBe(1);
      expect(result.paginacion.pagina).toBe(1);
      expect(result.paginacion.limite).toBe(20);
    });

    it('debería filtrar por canal si se proporciona', async () => {
      // Arrange
      const filters = {
        canal: 'SMS',
        pagina: 1,
        limite: 20,
      };

      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await notificationService.getHistory(filters);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            canal: 'SMS',
          }),
        })
      );
    });

    it('debería convertir EMAIL a CORREO en filtros', async () => {
      // Arrange
      const filters = {
        canal: 'EMAIL',
        pagina: 1,
        limite: 20,
      };

      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await notificationService.getHistory(filters);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            canal: 'CORREO',
          }),
        })
      );
    });

    it('debería convertir query params string a número', async () => {
      // Arrange
      const filters = {
        pagina: '2',
        limite: '50',
      };

      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      const result = await notificationService.getHistory(filters);

      // Assert
      expect(result.paginacion.pagina).toBe(2);
      expect(result.paginacion.limite).toBe(50);
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 50, // (2-1) * 50
          take: 50,
        })
      );
    });
  });
});

