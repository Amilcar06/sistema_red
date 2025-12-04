import rateLimit from 'express-rate-limit';

// Rate limiting más permisivo en desarrollo y tests
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const isTest = process.env.NODE_ENV === 'test';

export const apiLimiter = rateLimit({
  windowMs: isTest
    ? 60000 // 1 minuto en tests
    : isDevelopment 
    ? parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000') // 1 minuto en desarrollo
    : parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos en producción
  max: isTest
    ? 10000 // Muy permisivo en tests
    : isDevelopment
    ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000') // 1000 requests en desarrollo
    : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests en producción
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting para health check y en tests
    return (isDevelopment || isTest) && req.path === '/health';
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isTest ? 1000 : 5, // Muy permisivo en tests, 5 intentos en producción
  message: 'Demasiados intentos de autenticación, por favor intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

