import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import authService from '../services/auth.service';
import { catchAsync } from '../utils/helpers';

class AuthController {
  register = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json({
      status: 'success',
      data: result,
    });
  });

  login = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await authService.login(req.body);
    res.json({
      status: 'success',
      data: result,
    });
  });

  refreshToken = catchAsync(async (req: AuthRequest, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    res.json({
      status: 'success',
      data: tokens,
    });
  });

  getMe = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado',
      });
    }

    const user = await authService.getMe(req.user.id);
    res.json({
      status: 'success',
      data: user,
    });
  });

  changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado',
      });
    }

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      status: 'success',
      message: 'Contraseña actualizada correctamente',
    });
  });
}

export default new AuthController();

