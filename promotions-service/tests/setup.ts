/**
 * Configuración global para tests
 */

// Mock de variables de entorno
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-testing-only';
process.env.NODE_ENV = 'test';

// Limpiar después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

