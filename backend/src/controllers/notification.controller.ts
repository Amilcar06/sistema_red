import { Response } from 'express';
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

  sendBulk = catchAsync(async (req: AuthRequest, res: Response) => {
    const { promocionId, canal, plantillaMensaje } = req.body;
    const notificaciones = await notificationService.sendBulk(
      promocionId,
      canal,
      plantillaMensaje
    );
    res.status(201).json({
      status: 'success',
      data: notificaciones,
      count: notificaciones.length,
    });
  });

  getHistory = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await notificationService.getHistory(req.query);
    res.json({
      status: 'success',
      ...result,
    });
  });
}

export default new NotificationController();

