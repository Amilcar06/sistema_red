import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import notificationService from '../services/notification.service';
import { catchAsync } from '../utils/helpers';

class NotificationController {
  send = catchAsync(async (req: AuthRequest, res: Response) => {
    const notification = await notificationService.send(req.body);
    res.status(201).json({
      status: 'success',
      data: notification,
    });
  });

  sendBatch = catchAsync(async (req: AuthRequest, res: Response) => {
    const { notifications } = req.body;

    if (!Array.isArray(notifications)) {
      return res.status(400).json({
        status: 'error',
        message: 'notifications must be an array'
      });
    }

    const results = await notificationService.sendBatch(notifications);

    res.status(201).json({
      status: 'success',
      data: results,
      count: results.length,
    });
  });

  getHistory = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await notificationService.getHistory(req.query);
    res.json({
      status: 'success',
      ...result,
    });
  });

  getStatuses = catchAsync(async (req: Request, res: Response) => {
    const statuses = ['PENDIENTE', 'EN_COLA', 'ENVIADA', 'ENTREGADA', 'FALLIDA', 'CANCELADA'];
    res.json({
      status: 'success',
      data: statuses
    });
  });
}

export default new NotificationController();

