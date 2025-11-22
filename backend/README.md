# Sistema de Promoción de Servicios - Backend API

Backend API REST para el Sistema de Promoción de Servicios de Telefonía Móvil.

## Stack Tecnológico

- **Node.js** 18+ (LTS)
- **Express.js** 4.x
- **TypeScript** 5.x
- **PostgreSQL** 15+
- **Prisma** 5.x (ORM)
- **JWT** (Autenticación)
- **Bull** (Colas con Redis)
- **Twilio** (SMS)
- **Nodemailer** (Email)

## Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
- DATABASE_URL
- JWT_SECRET
- TWILIO credentials
- SMTP credentials
- Redis config

### 3. Configurar base de datos

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio
npm run prisma:studio
```

### 4. Ejecutar servidor

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones (DB, Redis)
│   ├── controllers/     # Controladores MVC
│   ├── services/        # Lógica de negocio
│   ├── routes/          # Rutas API
│   ├── middleware/      # Middleware personalizado
│   ├── utils/           # Utilidades
│   ├── jobs/            # Jobs de Bull
│   ├── app.ts           # Aplicación Express
│   └── server.ts        # Servidor HTTP
├── prisma/
│   └── schema.prisma    # Schema de base de datos
└── tests/               # Tests
```

## Endpoints Principales

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuarios
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Obtener usuario actual

### Clientes (Sprint 1)
- `GET /api/v1/clients` - Listar clientes
- `POST /api/v1/clients` - Crear cliente
- `GET /api/v1/clients/:id` - Obtener cliente
- `PATCH /api/v1/clients/:id` - Actualizar cliente
- `DELETE /api/v1/clients/:id` - Eliminar cliente
- `GET /api/v1/clients/statistics` - Estadísticas

### Productos (Sprint 3)
- `GET /api/v1/products` - Listar productos
- `POST /api/v1/products` - Crear producto
- `GET /api/v1/products/:id` - Obtener producto
- `PATCH /api/v1/products/:id` - Actualizar producto
- `DELETE /api/v1/products/:id` - Eliminar producto

### Promociones (Sprint 3)
- `GET /api/v1/promotions` - Listar promociones
- `POST /api/v1/promotions` - Crear promoción
- `GET /api/v1/promotions/:id` - Obtener promoción
- `POST /api/v1/promotions/:id/activate` - Activar promoción
- `POST /api/v1/promotions/:id/pause` - Pausar promoción
- `GET /api/v1/promotions/:id/statistics` - Estadísticas

### Notificaciones (Sprint 4)
- `POST /api/v1/notifications/send` - Enviar notificación
- `POST /api/v1/notifications/bulk` - Envío masivo
- `GET /api/v1/notifications/history` - Historial

### Reglas de Negocio (Sprint 2)
- `GET /api/v1/rules` - Listar reglas
- `POST /api/v1/rules` - Crear regla
- `GET /api/v1/rules/:id` - Obtener regla
- `POST /api/v1/rules/assign` - Asignar regla a promoción
- `GET /api/v1/rules/evaluate/:clientId/:promotionId` - Evaluar elegibilidad

## Autenticación

Todas las rutas (excepto `/auth/register` y `/auth/login`) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

## Roles

- **ADMIN**: Acceso completo
- **OPERATOR**: Puede crear y editar (excepto usuarios)
- **VIEWER**: Solo lectura

## Scripts

- `npm run dev` - Desarrollo con hot reload
- `npm run build` - Compilar TypeScript
- `npm start` - Ejecutar en producción
- `npm test` - Ejecutar tests
- `npm run prisma:migrate` - Ejecutar migraciones
- `npm run prisma:studio` - Abrir Prisma Studio
- `npm run prisma:seed` - Seed básico (usuarios admin/operador)
- `npm run prisma:seed:entel` - Seed educativo con datos inspirados en Entel Bolivia

## Testing

```bash
npm test              # Ejecutar tests
npm run test:watch    # Modo watch
npm run test:coverage # Con coverage
```

## Documentación

La documentación de la API se puede generar con Swagger (pendiente de configuración).

## Licencia

ISC

