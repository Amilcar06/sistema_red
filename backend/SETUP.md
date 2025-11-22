# Guía de Configuración Rápida

## Prerequisitos

- Node.js 18+ instalado
- PostgreSQL 15+ instalado y ejecutándose
- Redis instalado y ejecutándose (opcional para desarrollo, necesario para producción)

## Pasos de Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz de `backend/` con el siguiente contenido:

```env
# Server
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/promociones_db?schema=public"

# JWT (Genera secretos seguros en producción)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Redis (para colas)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Twilio (SMS) - Opcional para desarrollo
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# WhatsApp Business API - Opcional
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=

# SMTP (Email) - Opcional para desarrollo
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Configurar base de datos PostgreSQL

```bash
# Crear base de datos
createdb promociones_db

# O usando psql
psql -U postgres
CREATE DATABASE promociones_db;
\q
```

### 4. Generar cliente Prisma y ejecutar migraciones

```bash
# Generar cliente Prisma
npm run prisma:generate

# Crear y ejecutar migraciones
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio para ver la base de datos
npm run prisma:studio
```

### 5. (Opcional) Crear usuario inicial

Puedes crear un usuario inicial usando Prisma Studio o directamente:

```bash
npm run prisma:studio
```

Luego navega a la tabla `User` y crea un usuario manualmente, o ejecuta un script de seeding.

### 6. Iniciar Redis (si lo usas)

```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# O ejecutar directamente
redis-server
```

### 7. Iniciar servidor

```bash
# Modo desarrollo (con hot reload)
npm run dev

# Modo producción
npm run build
npm start
```

El servidor estará disponible en `http://localhost:3001`

## Verificación

### Health Check

```bash
curl http://localhost:3001/health
```

Deberías recibir:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

### Probar Autenticación

```bash
# Registrar usuario
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "name": "Admin User",
    "role": "ADMIN"
  }'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

## Estructura Creada

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts      ✅
│   │   └── redis.ts         ✅
│   ├── controllers/
│   │   ├── auth.controller.ts      ✅
│   │   ├── client.controller.ts    ✅
│   │   ├── product.controller.ts   ✅
│   │   ├── promotion.controller.ts ✅
│   │   ├── notification.controller.ts ✅
│   │   └── rule.controller.ts      ✅
│   ├── services/
│   │   ├── auth.service.ts         ✅
│   │   ├── client.service.ts       ✅
│   │   ├── product.service.ts      ✅
│   │   ├── promotion.service.ts    ✅
│   │   ├── notification.service.ts ✅
│   │   ├── rule.service.ts         ✅
│   │   ├── rule-engine.service.ts  ✅
│   │   └── integrations/
│   │       ├── twilio.service.ts   ✅
│   │       └── email.service.ts    ✅
│   ├── routes/
│   │   ├── index.ts                ✅
│   │   ├── auth.routes.ts          ✅
│   │   ├── client.routes.ts        ✅
│   │   ├── product.routes.ts       ✅
│   │   ├── promotion.routes.ts     ✅
│   │   ├── notification.routes.ts  ✅
│   │   └── rule.routes.ts          ✅
│   ├── middleware/
│   │   ├── auth.middleware.ts      ✅
│   │   ├── error.middleware.ts     ✅
│   │   ├── logger.middleware.ts    ✅
│   │   ├── validation.middleware.ts ✅
│   │   └── rateLimit.middleware.ts ✅
│   ├── utils/
│   │   ├── logger.ts       ✅
│   │   ├── errors.ts       ✅
│   │   ├── helpers.ts      ✅
│   │   └── validators.ts   ✅
│   ├── jobs/
│   │   └── notification.job.ts ✅
│   ├── app.ts              ✅
│   └── server.ts           ✅
├── prisma/
│   └── schema.prisma       ✅
├── package.json            ✅
├── tsconfig.json           ✅
├── jest.config.js          ✅
├── README.md               ✅
└── SETUP.md                ✅
```

## Siguientes Pasos

1. ✅ Backend implementado
2. ⏳ Instalar dependencias: `npm install`
3. ⏳ Configurar `.env`
4. ⏳ Ejecutar migraciones: `npm run prisma:migrate`
5. ⏳ Iniciar servidor: `npm run dev`
6. ⏳ Conectar frontend con backend
7. ⏳ Probar endpoints
8. ⏳ Configurar integraciones (Twilio, SMTP)

## Notas Importantes

- **Seguridad**: En producción, cambia todos los secrets y usa variables de entorno seguras
- **Base de Datos**: Asegúrate de tener backups regulares
- **Redis**: Es necesario para el sistema de colas de notificaciones
- **CORS**: Ajusta `CORS_ORIGIN` según tu dominio frontend

## Soporte

Para problemas o preguntas, revisa:
- README.md
- PLAN_IMPLEMENTACION_BACKEND.md
- Documentación de Prisma: https://www.prisma.io/docs

