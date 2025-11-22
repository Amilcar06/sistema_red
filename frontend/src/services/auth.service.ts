import apiClient, { ApiResponse } from '../config/api';

export interface LoginData {
  correo: string;
  contrasena: string;
}

export interface RegisterData {
  correo: string;
  contrasena: string;
  nombre: string;
  rol?: 'ADMIN' | 'OPERADOR' | 'VISOR';
}

export interface User {
  id: string;
  correo: string;
  nombre: string;
  rol: 'ADMIN' | 'OPERADOR' | 'VISOR';
  activo: boolean;
  fechaCreacion: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  usuario: User;
}

class AuthService {
  async login(data: LoginData): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      '/auth/login',
      data
    );
    
    if (response.data.status === 'success' && response.data.data) {
      const { accessToken, refreshToken, usuario } = response.data.data;
      
      // Guardar tokens en localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al iniciar sesión');
  }

  async register(data: RegisterData): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      '/auth/register',
      data
    );
    
    if (response.data.status === 'success' && response.data.data) {
      const { accessToken, refreshToken, usuario } = response.data.data;
      
      // Guardar tokens en localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al registrar usuario');
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    );
    
    if (response.data.status === 'success' && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al refrescar token');
  }

  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    
    if (response.data.status === 'success' && response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al obtener usuario');
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

export default new AuthService();

