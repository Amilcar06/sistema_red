import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Debe coincidir con el backend

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.0.13:3000' // Para móvil
    ],
    credentials: true
}));

// Logging básico
app.use((req, res, next) => {
    console.log(`[Gateway] ${req.method} ${req.url}`);
    next();
});

// Middleware de Autenticación
const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // Rutas públicas que no requieren token (relativas a /api)
    const publicRoutes = [
        '/v1/auth/login',
        '/v1/auth/register',
        '/v1/auth/refresh-token'
    ];

    // Si la ruta es pública, continuar
    if (publicRoutes.some(route => req.url.startsWith(route))) {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ status: 'error', message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Inyectar usuario en headers para el backend
        req.headers['x-user-id'] = (decoded as any).userId;
        req.headers['x-user-role'] = (decoded as any).rol;
        next();
    } catch (error) {
        return res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
};

// Aplicar auth middleware
app.use('/api', authenticate);

const CLIENTS_SERVICE_URL = process.env.CLIENTS_SERVICE_URL || 'http://localhost:3002';
const PROMOTIONS_SERVICE_URL = process.env.PROMOTIONS_SERVICE_URL || 'http://localhost:3003';
const NOTIFICATIONS_SERVICE_URL = process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3004';

// Proxy hacia Clients Service
app.use(['/api/v1/auth', '/api/v1/clients', '/api/v1/users', '/api/v1/settings', '/api/v1/dashboard', '/api/v1/reports'], createProxyMiddleware({
    target: CLIENTS_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        if ((req as any).headers['x-user-id']) {
            proxyReq.setHeader('x-user-id', (req as any).headers['x-user-id']);
            proxyReq.setHeader('x-user-role', (req as any).headers['x-user-role']);
        }
    }
}));

// Proxy hacia Promotions Service
app.use(['/api/v1/promotions', '/api/v1/products', '/api/v1/rules'], createProxyMiddleware({
    target: PROMOTIONS_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        if ((req as any).headers['x-user-id']) {
            proxyReq.setHeader('x-user-id', (req as any).headers['x-user-id']);
            proxyReq.setHeader('x-user-role', (req as any).headers['x-user-role']);
        }
    }
}));

// Proxy hacia Notifications Service
app.use(['/api/v1/notifications', '/api/v1/whatsapp'], createProxyMiddleware({
    target: NOTIFICATIONS_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        if ((req as any).headers['x-user-id']) {
            proxyReq.setHeader('x-user-id', (req as any).headers['x-user-id']);
            proxyReq.setHeader('x-user-role', (req as any).headers['x-user-role']);
        }
    }
}));

// Health check del Gateway
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`Proxying to Backend at ${BACKEND_URL}`);
});
