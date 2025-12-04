import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AppError } from '../utils/errors';

interface RegisterData {
  correo: string;
  contrasena: string;
  nombre: string;
  rol?: 'ADMIN' | 'OPERADOR' | 'VISOR';
}

interface LoginData {
  correo: string;
  contrasena: string;
}

class AuthService {
  async register(data: RegisterData) {
    const { correo, contrasena, nombre, rol = 'OPERADOR' } = data;

    // Verificar si el usuario existe
    const existingUser = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (existingUser) {
      throw new AppError('El usuario ya existe', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(contrasena, 12);

    // Crear usuario
    const user = await prisma.usuario.create({
      data: {
        correo,
        contrasena: hashedPassword,
        nombre,
        rol,
      },
      select: {
        id: true,
        correo: true,
        nombre: true,
        rol: true,
        fechaCreacion: true,
      },
    });

    // Generar tokens
    const tokens = this.generateTokens({ id: user.id, rol: user.rol });

    return {
      usuario: user,
      ...tokens,
    };
  }

  async login(data: LoginData) {
    const { correo, contrasena } = data;

    // Buscar usuario
    const user = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!user || !user.activo) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar password
    const isValidPassword = await bcrypt.compare(contrasena, user.contrasena);

    if (!isValidPassword) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Generar tokens
    const tokens = this.generateTokens({ id: user.id, rol: user.rol });

    return {
      usuario: {
        id: user.id,
        correo: user.correo,
        nombre: user.nombre,
        rol: user.rol,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as { userId: string };

      const user = await prisma.usuario.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          correo: true,
          nombre: true,
          rol: true,
          activo: true,
        },
      });

      if (!user || !user.activo) {
        throw new AppError('Token inválido', 401);
      }

      return this.generateTokens({ id: user.id, rol: user.rol });
    } catch (error) {
      throw new AppError('Token inválido', 401);
    }
  }

  async getMe(userId: string) {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        correo: true,
        nombre: true,
        rol: true,
        activo: true,
        fechaCreacion: true,
      },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const isValid = await bcrypt.compare(currentPassword, user.contrasena);
    if (!isValid) throw new AppError('Contraseña actual incorrecta', 401);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.usuario.update({
      where: { id: userId },
      data: { contrasena: hashedPassword }
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  private generateTokens(user: { id: string; rol: string }) {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    const jwtExpiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
    const jwtRefreshExpiresIn: string = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new AppError('JWT secrets no configurados', 500);
    }

    const payload = {
      userId: user.id,
      rol: user.rol
    };

    const accessToken = jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: jwtExpiresIn } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      payload,
      jwtRefreshSecret,
      { expiresIn: jwtRefreshExpiresIn } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }
}

export default new AuthService();
