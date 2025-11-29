# Guía Técnica - Sistema de Promoción de Servicios

Documentación técnica completa del sistema: arquitectura, estructura, APIs y componentes.

---

## 🏗️ Arquitectura

### Backend: MVC + Service Layer

El backend implementa una arquitectura híbrida que combina MVC con una capa de servicios:

```
Routes → Controllers → Services → Models (Prisma)
```

**Flujo de una petición:**
1. Cliente hace petición HTTP
2. Express recibe en Routes
3. Middleware procesa (auth, validation, rate limiting)
4. Controller maneja la petición
5. Service ejecuta lógica de negocio
6. Model accede a datos (Prisma → PostgreSQL)
7. Service procesa respuesta
8. Controller formatea respuesta JSON (View)
9. Cliente recibe respuesta

**Estructura:**
- **Routes** (`src/routes/`): Define endpoints y middlewares
- **Controllers** (`src/controllers/`): Maneja peticiones HTTP
- **Services** (`src/services/`): Contiene lógica de negocio
- **Models** (Prisma): Acceso a base de datos

### Frontend: Component-Based Architecture

El frontend sigue el patrón estándar de React:

```
Components → Services (API) → Backend
     ↓
  Contexts (Estado Global)
```

**Estructura:**
- **Components** (`src/components/`): Componentes React
- **Services** (`src/services/`): Comunicación con API
- **Contexts** (`src/contexts/`): Estado global (AuthContext)
- **Config** (`src/config/`): Configuración (Axios)

---

## 📁 Estructura Detallada

### Backend

```
backend/
├── src/
│   ├── app.ts                 # Configuración Express
│   ├── server.ts              # Servidor HTTP
│   ├── config/                # Configuración
│   │   ├── database.ts        # Prisma Client
│   │   └── redis.ts           # Redis Client
│   ├── controllers/           # Controladores MVC
│   │   ├── auth.controller.ts
│   │   ├── client.controller.ts
│   │   ├── product.controller.ts
│   │   ├── promotion.controller.ts
│   │   ├── notification.controller.ts
│   │   └── rule.controller.ts
│   ├── services/              # Lógica de negocio
│   │   ├── auth.service.ts
│   │   ├── client.service.ts
│   │   ├── product.service.ts
│   │   ├── promotion.service.ts
│   │   ├── notification.service.ts
│   │   ├── rule.service.ts
│   │   ├── rule-engine.service.ts
│   │   ├── cache.service.ts
│   │   └── integrations/
│   │       ├── twilio.service.ts
│   │       └── email.service.ts
│   ├── routes/                # Rutas API
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── client.routes.ts
│   │   ├── product.routes.ts
│   │   ├── promotion.routes.ts
│   │   ├── notification.routes.ts
│   │   └── rule.routes.ts
│   ├── middleware/            # Middleware personalizado
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── logger.middleware.ts
│   ├── jobs/                  # Jobs de Bull
│   │   └── notification.job.ts
│   └── utils/                 # Utilidades
│       ├── errors.ts
│       ├── helpers.ts
│       ├── logger.ts
│       └── validators.ts
├── prisma/
│   ├── schema.prisma          # Schema de base de datos
│   ├── migrations/            # Migraciones
│   └── seeds/
│       └── seed.ts            # Seed de datos
└── tests/                     # Tests
    ├── unit/
    ├── integration/
    └── helpers/
```

### Frontend

```
frontend/
├── src/
│   ├── main.tsx               # Punto de entrada
│   ├── App.tsx                # Router principal
│   ├── components/            # Componentes React
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ClientManagement.tsx
│   │   ├── PromotionManagement.tsx
│   │   ├── MessageCenter.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   └── ui/                # Componentes UI reutilizables
│   ├── services/              # Servicios API
│   │   ├── auth.service.ts
│   │   ├── client.service.ts
│   │   ├── product.service.ts
│   │   ├── promotion.service.ts
│   │   └── notification.service.ts
│   ├── contexts/              # Context API
│   │   └── AuthContext.tsx
│   ├── config/                # Configuración
│   │   └── api.ts             # Cliente Axios
│   └── test/                  # Tests
│       └── setup.ts
├── vite.config.ts
└── package.json
```

---

## 🗄️ Base de Datos

### Modelo de Datos (Prisma)

**Entidades principales:**

```prisma
model Usuario {
  id            String    @id @default(uuid())
  email         String    @unique
  contrasena    String
  rol           RolUsuario
  estado        EstadoUsuario
  fechaCreacion DateTime  @default(now())
}

model Cliente {
  id            String       @id @default(uuid())
  nombre        String
  telefono      String       @unique
  correo        String?
  plan          String
  estado        EstadoCliente
  fechaRegistro DateTime     @default(now())
}

model Producto {
  id          String   @id @default(uuid())
  nombre      String
  descripcion String?
  precio      Decimal
  categoria   String
  estado      EstadoProducto
}

model Promocion {
  id                String         @id @default(uuid())
  nombre            String
  descripcion       String?
  tipoDescuento     TipoDescuento
  valorDescuento    Decimal
  fechaInicio       DateTime
  fechaFin          DateTime
  estado            EstadoPromocion
  totalEnviados     Int            @default(0)
  totalConvertidos  Int            @default(0)
}

model Notificacion {
  id            String            @id @default(uuid())
  canal         CanalNotificacion
  mensaje       String
  estado        EstadoNotificacion
  fechaCreacion DateTime          @default(now())
  fechaEnvio    DateTime?
  clienteId     String
  promocionId   String?
}

model Regla {
  id          String   @id @default(uuid())
  nombre      String
  descripcion String?
  condiciones Json     # Condiciones configurables
  acciones    Json     # Acciones configurables
  estado      EstadoRegla
}
```

### Relaciones

- Cliente ↔ Notificación (1:N)
- Promoción ↔ Notificación (1:N)
- Promoción ↔ Producto (N:M)
- Promoción ↔ Regla (N:M)

---

## 🔌 API REST

### Autenticación

#### `POST /api/v1/auth/register`
Registrar nuevo usuario

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "contrasena": "password123",
  "rol": "OPERATOR"
}
```

#### `POST /api/v1/auth/login`
Iniciar sesión

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "contrasena": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "usuario": { ... }
  }
}
```

#### `POST /api/v1/auth/refresh`
Refrescar token

**Body:**
```json
{
  "refreshToken": "..."
}
```

#### `GET /api/v1/auth/me`
Obtener usuario actual

**Headers:**
```
Authorization: Bearer <token>
```

---

### Clientes

#### `GET /api/v1/clients`
Listar clientes (con paginación y filtros)

**Query params:**
- `pagina` (number): Página actual
- `limite` (number): Items por página
- `busqueda` (string): Búsqueda por nombre o teléfono
- `estado` (string): Filtrar por estado (ACTIVO/INACTIVO)

**Response:**
```json
{
  "status": "success",
  "datos": [...],
  "paginacion": {
    "pagina": 1,
    "limite": 10,
    "total": 100,
    "totalPaginas": 10
  }
}
```

#### `POST /api/v1/clients`
Crear cliente

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "telefono": "+1234567890",
  "correo": "juan@ejemplo.com",
  "plan": "PREMIUM"
}
```

#### `GET /api/v1/clients/:id`
Obtener cliente por ID

#### `PATCH /api/v1/clients/:id`
Actualizar cliente

#### `DELETE /api/v1/clients/:id`
Eliminar cliente

#### `GET /api/v1/clients/statistics`
Estadísticas de clientes

**Response:**
```json
{
  "total": 100,
  "activos": 80,
  "inactivos": 20,
  "porPlan": [
    { "plan": "BASIC", "cantidad": 40 },
    { "plan": "PREMIUM", "cantidad": 60 }
  ]
}
```

---

### Promociones

#### `GET /api/v1/promotions`
Listar promociones

**Query params:**
- `pagina`, `limite`: Paginación
- `estado`: Filtrar por estado
- `busqueda`: Búsqueda por nombre

#### `POST /api/v1/promotions`
Crear promoción

**Body:**
```json
{
  "nombre": "Descuento Navidad",
  "descripcion": "Descuento especial",
  "tipoDescuento": "PORCENTAJE",
  "valorDescuento": 20,
  "fechaInicio": "2024-12-01T00:00:00Z",
  "fechaFin": "2024-12-31T23:59:59Z",
  "productIds": ["id1", "id2"]
}
```

#### `POST /api/v1/promotions/:id/activate`
Activar promoción

#### `POST /api/v1/promotions/:id/pause`
Pausar promoción

---

### Notificaciones

#### `POST /api/v1/notifications/send`
Enviar notificación individual

**Body:**
```json
{
  "clienteId": "uuid",
  "canal": "SMS",
  "mensaje": "¡Promoción especial!",
  "promocionId": "uuid"
}
```

#### `POST /api/v1/notifications/bulk`
Envío masivo a promoción

**Body:**
```json
{
  "promocionId": "uuid",
  "canal": "SMS",
  "mensaje": "¡Promoción especial!"
}
```

#### `GET /api/v1/notifications/history`
Historial de notificaciones

**Query params:**
- `pagina`, `limite`: Paginación
- `canal`: Filtrar por canal
- `estado`: Filtrar por estado

---

## 🔐 Seguridad

### Autenticación JWT

- **Access Token**: Válido por 1 hora
- **Refresh Token**: Válido por 7 días
- Tokens almacenados en localStorage (frontend)

### Autorización por Roles

- **ADMIN**: Acceso completo
- **OPERATOR**: Crear y editar (excepto usuarios)
- **VIEWER**: Solo lectura

### Rate Limiting

- **Desarrollo**: 1000 req/min
- **Producción**: 100 req/15min
- **Tests**: 10000 req/min

### Validación de Datos

- **Backend**: Zod schemas
- **Middleware**: Validación automática
- **Errores**: Respuestas consistentes

---

## ⚡ Optimizaciones

### Caché Redis

**Implementado:**
- Estadísticas de clientes (TTL: 5 minutos)
- Invalidación automática en operaciones CRUD

**Uso:**
```typescript
import cacheService from './cache.service';

// Obtener de caché
const cached = await cacheService.get('key');

// Guardar en caché
await cacheService.set('key', data, 300); // 5 min

// Eliminar caché
await cacheService.del('key');
```

### Paginación

Todos los endpoints de listado soportan:
- Paginación (página, límite)
- Filtros y búsqueda
- Ordenamiento

### Sistema de Colas (Bull)

- Procesamiento asíncrono de notificaciones
- Reintentos automáticos
- Tracking de estado

---

## 📦 Servicios Principales

### Backend Services

**ClientService:**
- CRUD completo
- Búsqueda y filtros
- Estadísticas (con caché)

**PromotionService:**
- CRUD completo
- Activación/pausa
- Validación de fechas
- Estadísticas

**NotificationService:**
- Envío individual y masivo
- Sistema de colas
- Historial paginado

**RuleEngineService:**
- Evaluación de reglas
- Elegibilidad de clientes
- Reglas condicionales

### Frontend Services

**auth.service.ts:**
- Login, registro, refresh
- Manejo de tokens

**client.service.ts:**
- CRUD de clientes
- Estadísticas

**promotion.service.ts:**
- CRUD de promociones
- Activación/pausa

**notification.service.ts:**
- Envío de mensajes
- Historial

---

## 🎨 Componentes Frontend Principales

**Dashboard.tsx:**
- Estadísticas en tiempo real
- Gráficos de mensajes y conversiones
- Distribución por canal

**ClientManagement.tsx:**
- CRUD completo
- Búsqueda con debounce
- Filtros por estado
- Skeletons y empty states

**PromotionManagement.tsx:**
- CRUD completo
- Activación/pausa
- Asociación de productos
- Estadísticas

**MessageCenter.tsx:**
- Envío individual y masivo
- Selección de canales
- Historial con filtros

---

## 🔄 Flujos Principales

### 1. Crear y Enviar Promoción

```
1. Usuario crea promoción (PromotionManagement)
   ↓
2. Backend valida y guarda (PromotionService)
   ↓
3. Usuario activa promoción
   ↓
4. Usuario envía mensajes masivos (MessageCenter)
   ↓
5. Sistema encola notificaciones (Bull)
   ↓
6. Workers procesan y envían (NotificationService)
   ↓
7. Se actualiza estado y estadísticas
```

### 2. Autenticación

```
1. Usuario ingresa credenciales (Login)
   ↓
2. Frontend envía a /auth/login
   ↓
3. Backend valida y genera tokens
   ↓
4. Frontend guarda tokens (localStorage)
   ↓
5. Tokens incluidos en headers (Axios interceptor)
   ↓
6. Refresh automático antes de expirar
```

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0

