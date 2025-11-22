import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authService from '../../../src/services/auth.service';
import { AppError } from '../../../src/utils/errors';

// Mock de Prisma
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();

jest.mock('../../../src/config/database', () => {
  return {
    __esModule: true,
    default: {
      usuario: {
        findUnique: (...args: any[]) => mockFindUnique(...args),
        create: (...args: any[]) => mockCreate(...args),
      },
    },
  };
});

// Mock de bcrypt
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
  const mockJwt = jwt as jest.Mocked<typeof jwt>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      correo: 'test@example.com',
      contrasena: 'password123',
      nombre: 'Test User',
      rol: 'OPERADOR' as const,
    };

    it('debería registrar un nuevo usuario exitosamente', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never);
      mockJwt.sign.mockReturnValueOnce('access-token' as never).mockReturnValueOnce('refresh-token' as never);

      const createdUser = {
        id: 'user-id',
        correo: registerData.correo,
        nombre: registerData.nombre,
        rol: registerData.rol,
        fechaCreacion: new Date(),
      };

      mockCreate.mockResolvedValue(createdUser as any);

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { correo: registerData.correo },
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerData.contrasena, 12);
      expect(mockCreate).toHaveBeenCalled();
      expect(result.usuario.correo).toBe(registerData.correo);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('debería lanzar error si el usuario ya existe', async () => {
      // Arrange
      const existingUser = {
        id: 'existing-id',
        correo: registerData.correo,
      };
      mockFindUnique.mockResolvedValue(existingUser as any);

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow(AppError);
      await expect(authService.register(registerData)).rejects.toThrow('El usuario ya existe');
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginData = {
      correo: 'test@example.com',
      contrasena: 'password123',
    };

    it('debería hacer login exitosamente con credenciales válidas', async () => {
      // Arrange
      const user = {
        id: 'user-id',
        correo: loginData.correo,
        contrasena: 'hashed-password',
        nombre: 'Test User',
        rol: 'OPERADOR',
        activo: true,
      };

      mockFindUnique.mockResolvedValue(user as any);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValueOnce('access-token' as never).mockReturnValueOnce('refresh-token' as never);

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { correo: loginData.correo },
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginData.contrasena, user.contrasena);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.usuario.correo).toBe(loginData.correo);
    });

    it('debería lanzar error si el usuario no existe', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(AppError);
      await expect(authService.login(loginData)).rejects.toThrow('Credenciales inválidas');
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('debería lanzar error si la contraseña es incorrecta', async () => {
      // Arrange
      const user = {
        id: 'user-id',
        correo: loginData.correo,
        contrasena: 'hashed-password',
        nombre: 'Test User',
        rol: 'OPERADOR',
        activo: true,
      };

      mockFindUnique.mockResolvedValue(user as any);
      mockBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(AppError);
      await expect(authService.login(loginData)).rejects.toThrow('Credenciales inválidas');
    });

    it('debería lanzar error si el usuario está inactivo', async () => {
      // Arrange
      const user = {
        id: 'user-id',
        correo: loginData.correo,
        contrasena: 'hashed-password',
        nombre: 'Test User',
        rol: 'OPERADOR',
        activo: false,
      };

      mockFindUnique.mockResolvedValue(user as any);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(AppError);
      await expect(authService.login(loginData)).rejects.toThrow('Credenciales inválidas');
    });
  });
});

