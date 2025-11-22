import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, LoginData, RegisterData, AuthTokens } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario autenticado al cargar
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            // Opcional: refrescar datos del usuario
            try {
              const freshUser = await authService.getMe();
              setUser(freshUser);
            } catch (error) {
              console.error('Error al refrescar usuario:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const authData = await authService.login(data);
      setUser(authData.usuario);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Error al iniciar sesión');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const authData = await authService.register(data);
      setUser(authData.usuario);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Error al registrar usuario');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

