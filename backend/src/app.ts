import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import routes from './routes';
import { apiLimiter } from './middleware/rateLimit.middleware';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Health check sin rate limiting
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rate limiting solo para rutas API
app.use(`/api/${process.env.API_VERSION || 'v1'}`, apiLimiter);

// Routes
app.use(`/api/${process.env.API_VERSION || 'v1'}`, routes);

// Error handling
app.use(errorHandler);

export default app;

