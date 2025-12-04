import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AppError } from '../utils/errors';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    correo: string;
    rol: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for headers injected by API Gateway
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    if (userId && userRole) {
      req.user = {
        id: userId,
        correo: '', // Email might not be available in headers, but usually not needed for basic auth/role checks
        rol: userRole,
      };
      return next();
    }

    // Fallback for local development or if headers are missing (though Gateway should handle this)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token no proporcionado', 401);
    }

    const token = authHeader.substring(7);

    // If we have JWT_SECRET, we can try to verify, but without DB lookup we can't get full user details
    // For now, we'll assume if Gateway didn't pass headers, something is wrong or we are bypassing gateway
    if (process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: string;
        rol: string;
      };
      req.user = {
        id: decoded.userId,
        correo: '',
        rol: decoded.rol
      };
      return next();
    }

    throw new AppError('Usuario no autorizado (Headers faltantes)', 401);

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Token inválido', 401));
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('No autenticado', 401));
    }

    if (!roles.includes(req.user.rol)) {
      return next(
        new AppError('No tienes permisos para esta acción', 403)
      );
    }

    next();
  };
};

