import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import clientService from '../services/client.service';
import { catchAsync } from '../utils/helpers';

class ClientController {
  create = catchAsync(async (req: AuthRequest, res: Response) => {
    const client = await clientService.create(req.body);
    res.status(201).json({
      status: 'success',
      data: client,
    });
  });

  findAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await clientService.findAll(req.query);
    res.json({
      status: 'success',
      ...result,
    });
  });

  findById = catchAsync(async (req: AuthRequest, res: Response) => {
    const client = await clientService.findById(req.params.id);
    res.json({
      status: 'success',
      data: client,
    });
  });

  update = catchAsync(async (req: AuthRequest, res: Response) => {
    const client = await clientService.update(req.params.id, req.body);
    res.json({
      status: 'success',
      data: client,
    });
  });

  savePushToken = catchAsync(async (req: AuthRequest, res: Response) => {
    const { token } = req.body;
    if (!token) {
      throw new Error('Token is required');
    }

    // Asumimos que el ID del cliente viene del token de autenticación (req.user.id)
    // O si es un admin actualizando un cliente, vendría en params.
    // Para este caso de uso (app móvil), el usuario logueado es el cliente.
    // Ajustar según cómo esté configurado AuthRequest.
    // Si req.user.id es el ID del usuario, y Usuario != Cliente, necesitamos mapear.
    // Por simplicidad en este MVP, asumiremos que el ID del usuario Auth es el ID del Cliente
    // o que el frontend envía el ID del cliente.
    // Vamos a usar el ID del usuario autenticado si está disponible, o el de params si es admin.

    // Opción A: El endpoint es /clients/push-token y usa el token del header para saber quién es.
    // Opción B: El endpoint es /clients/:id/push-token.

    // Usaremos Opción B para consistencia con REST: POST /clients/:id/push-token
    await clientService.savePushToken(req.params.id, token);

    res.json({
      status: 'success',
      message: 'Push token updated successfully',
    });
  });

  delete = catchAsync(async (req: AuthRequest, res: Response) => {
    await clientService.delete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

  getStatistics = catchAsync(async (req: AuthRequest, res: Response) => {
    const statistics = await clientService.getStatistics();
    res.json({
      status: 'success',
      data: statistics,
    });
  });

  getPlans = catchAsync(async (req: Request, res: Response) => {
    const plans = await clientService.getPlans();
    res.json({
      status: 'success',
      data: plans,
    });
  });

  getStatuses = catchAsync(async (req: Request, res: Response) => {
    // Importar el enum directamente o hardcodear los valores si no se puede importar fácilmente en este contexto
    // Idealmente: import { EstadoCliente } from '@prisma/client';
    const statuses = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'];
    res.json({
      status: 'success',
      data: statuses,
    });
  });
}

export default new ClientController();
