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
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token no proporcionado', 401);
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        correo: true,
        rol: true,
        activo: true,
      },
    });

    if (!usuario || !usuario.activo) {
      throw new AppError('Usuario no autorizado', 401);
    }

    req.user = {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };
    next();
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

