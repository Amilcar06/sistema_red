# Guía de Desarrollo - Sistema de Promoción de Servicios

Guía completa para desarrolladores: setup, testing, buenas prácticas y contribución.

---

## 🛠️ Setup de Desarrollo

### Requisitos

- **Node.js** 18+ (LTS recomendado)
- **PostgreSQL** 15+
- **Redis** (para colas y caché)
- **npm** o **yarn**
- **Git**

### Configuración Inicial

#### 1. Clonar y Setup Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Poblar base de datos
npm run prisma:seed
```

#### 2. Setup Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tu API URL
```

#### 3. Iniciar Servicios

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Redis (si no está como servicio):**
```bash
redis-server
```

---

## 🧪 Testing

### Backend Testing

#### Estructura de Tests

```
tests/
├── unit/                    # Tests unitarios
│   └── services/           # Tests de servicios
│       ├── auth.service.test.ts
│       ├── client.service.test.ts
│       ├── product.service.test.ts
│       ├── promotion.service.test.ts
│       └── notification.service.test.ts
├── integration/            # Tests de integración
│   ├── auth.integration.test.ts
│   └── clients.integration.test.ts
├── helpers/                # Helpers y mocks
│   └── prisma-mock.ts
└── setup.ts                # Configuración global
```

#### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# Solo tests unitarios
npm test -- tests/unit

# Solo tests de integración
npm test -- tests/integration

# Un archivo específico
npm test -- auth.service.test.ts

# Un test específico
npm test -- -t "debería crear cliente exitosamente"
```

#### Estado Actual

- ✅ **41 tests unitarios** (pasando)
  - Auth Service: 6 tests
  - Client Service: 12 tests
  - Product Service: 9 tests
  - Promotion Service: 8 tests
  - Notification Service: 6 tests

- ✅ **9 tests de integración** (pasando)
  - Auth Integration: 9 tests
  - Clients Integration: Creado

#### Base de Datos de Prueba

Para tests de integración, usar una base de datos separada:

```bash
# Crear BD de prueba
createdb sistema_promocion_test

# Configurar en .env.test
DATABASE_URL="postgresql://user:password@localhost:5432/sistema_promocion_test"
```

### Frontend Testing

#### Configuración

**Configurado con Vitest + React Testing Library**

```bash
cd frontend

# Ejecutar tests
npm run test:frontend

# Tests en modo watch
npm run test:frontend -- --watch

# Tests con coverage
npm run test:frontend -- --coverage
```

#### Estado Actual

- ✅ Configuración completa
- ✅ Setup file creado
- ⚠️ Tests de componentes pendientes

---

## 📝 Estándares de Código

### Backend

#### Estructura de Archivos

**Controller:**
```typescript
class ClientController {
  findAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await clientService.findAll(req.query);
    res.json({ status: 'success', ...result });
  });
}
```

**Service:**
```typescript
class ClientService {
  async findAll(filters: any) {
    // Lógica de negocio
    const data = await prisma.cliente.findMany({ ... });
    return { datos: data, paginacion: { ... } };
  }
}
```

#### Nomenclatura

- **Archivos**: `kebab-case.ts` (ej: `client.service.ts`)
- **Clases**: `PascalCase` (ej: `ClientService`)
- **Funciones**: `camelCase` (ej: `findAll`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `JWT_SECRET`)
- **Interfaces**: `PascalCase` (ej: `CreateClientData`)

#### Validación

Usar Zod schemas para validación:

```typescript
const createClientSchema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  correo: z.string().email().optional(),
  plan: z.string(),
});

// En routes
router.post('/', validate(createClientSchema), controller.create);
```

### Frontend

#### Estructura de Componentes

```typescript
export function ComponentName() {
  // 1. Hooks de estado
  const [data, setData] = useState();
  
  // 2. Hooks de efecto
  useEffect(() => {
    // ...
  }, []);
  
  // 3. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 4. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

#### Nomenclatura

- **Componentes**: `PascalCase.tsx` (ej: `ClientManagement.tsx`)
- **Funciones**: `camelCase` (ej: `handleSubmit`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `API_URL`)
- **Interfaces**: `PascalCase` (ej: `ClientFormData`)

#### Manejo de Estado

- **Estado local**: `useState` para datos del componente
- **Estado global**: `Context API` para autenticación
- **Estado del servidor**: `useEffect` + `services`

---

## 🔄 Flujo de Trabajo

### 1. Crear Nueva Funcionalidad

#### Backend

```bash
# 1. Crear schema en Prisma (si necesario)
# 2. Crear migración
npm run prisma:migrate dev --name feature_name

# 3. Crear service
touch src/services/feature.service.ts

# 4. Crear controller
touch src/controllers/feature.controller.ts

# 5. Crear routes
touch src/routes/feature.routes.ts

# 6. Registrar routes en src/routes/index.ts
```

#### Frontend

```bash
# 1. Crear servicio API
touch src/services/feature.service.ts

# 2. Crear componente
touch src/components/Feature.tsx

# 3. Registrar en App.tsx (si necesario)
```

### 2. Testing

**Backend:**
1. Crear test unitario para service
2. Crear test de integración para endpoint
3. Ejecutar tests
4. Asegurar coverage > 80%

**Frontend:**
1. Crear test para componente
2. Mock de servicios API
3. Verificar renderizado y comportamiento

### 3. Optimización

**Antes de commit:**
- ✅ Tests pasando
- ✅ Linter sin errores
- ✅ Code formatted
- ✅ Coverage aceptable

---

## 🔄 Workflows Principales del Sistema

### 1. Crear y Lanzar Campaña de Promoción

```
1. Usuario crea productos (si no existen)
   → Frontend: PromotionManagement
   → POST /api/v1/products
   ↓
2. Usuario crea promoción y asocia productos
   → Frontend: Modal "Nueva Promoción"
   → POST /api/v1/promotions
   ↓
3. Usuario configura reglas de elegibilidad (opcional)
   → Backend: RuleEngineService.evaluateEligibility()
   → POST /api/v1/rules/assign
   ↓
4. Usuario activa la promoción
   → POST /api/v1/promotions/:id/activate
   → Estado cambia a ACTIVA
   ↓
5. Usuario envía notificaciones masivas desde MessageCenter
   → Frontend: MessageCenter → "Envío Masivo"
   → POST /api/v1/notifications/bulk
   ↓
6. Sistema evalúa reglas y filtra clientes elegibles
   → Backend: RuleEngineService
   → Filtra por condiciones configuradas
   ↓
7. Sistema encola notificaciones en Bull/Redis
   → NotificationService.sendBulk()
   → Crea jobs en Bull queue
   ↓
8. Workers procesan cola y envían vía Twilio/Nodemailer
   → NotificationJob procesa cada mensaje
   → Actualiza estado: ENVIADA, ENTREGADA, FALLIDA
   ↓
9. Sistema actualiza estados y estadísticas
   → Incrementa totalEnviados
   → Actualiza conversiones
   ↓
10. Usuario monitorea resultados en Dashboard y Reports
    → GET /api/v1/promotions/:id/statistics
    → Gráficos de conversión en tiempo real
```

### 2. Autenticación de Usuario

```
1. Usuario ingresa credenciales en Login
   → Frontend: Login.tsx
   → Form con correo y contraseña
   ↓
2. Frontend envía POST /api/v1/auth/login
   → Body: { correo, contrasena }
   → Axios interceptor NO agrega token (ruta pública)
   ↓
3. Backend valida credenciales (bcrypt)
   → AuthController.login()
   → AuthService.login()
   → Compara hash con bcrypt.compare()
   ↓
4. Backend genera access token (1h) y refresh token (7d)
   → jwt.sign() con JWT_SECRET
   → Tokens incluyen: id, correo, rol
   ↓
5. Frontend almacena tokens en localStorage
   → localStorage.setItem('accessToken', ...)
   → localStorage.setItem('refreshToken', ...)
   ↓
6. Axios interceptor agrega token a todas las requests
   → config.headers.Authorization = `Bearer ${token}`
   → Automático en todas las peticiones
   ↓
7. Antes de expirar, frontend solicita refresh token
   → POST /api/v1/auth/refresh
   → Body: { refreshToken }
   ↓
8. Backend valida refresh token y emite nuevo access token
   → Verifica firma con JWT_REFRESH_SECRET
   → Genera nuevo accessToken
```

### 3. Gestión de Clientes

```
1. Usuario accede a ClientManagement
   → Frontend: Navbar → "Clientes"
   → Componente ClientManagement.tsx se monta
   ↓
2. Componente carga clientes (GET /api/v1/clients)
   → useEffect se ejecuta
   → clientService.getAll({ pagina: 1, limite: 10 })
   ↓
3. Usuario aplica filtros/búsqueda
   → Input de búsqueda (debounce 300ms)
   → Select de estado (ACTIVO/INACTIVO)
   → Paginación
   ↓
4. Usuario crea/edita/elimina cliente
   → Modal con formulario
   → Validación en frontend (React Hook Form)
   ↓
5. Backend valida datos con Zod
   → ValidationMiddleware
   → createClientSchema.parse(req.body)
   ↓
6. Backend guarda en PostgreSQL vía Prisma
   → ClientService.create()
   → prisma.cliente.create()
   ↓
7. Backend invalida caché de estadísticas
   → cacheService.del('client:statistics')
   → Asegura datos frescos
   ↓
8. Frontend actualiza lista
   → Refetch de datos
   → UI se actualiza automáticamente
```

### 4. Envío de Notificaciones Masivas

```
1. Usuario selecciona promoción en MessageCenter
   → Frontend: MessageCenter.tsx
   → Select con lista de promociones activas
   ↓
2. Usuario configura canal (SMS/Email/WhatsApp) y mensaje
   → Radio buttons para canal
   → Textarea para mensaje (puede usar variables)
   ↓
3. Frontend envía POST /api/v1/notifications/bulk
   → Body: { promocionId, canal, mensaje }
   → AuthMiddleware valida token
   ↓
4. Backend obtiene clientes elegibles de la promoción
   → PromotionService.getEligibleClients()
   → Evalúa reglas de negocio asociadas
   ↓
5. Backend crea registros de Notificacion (estado: EN_COLA)
   → prisma.notificacion.createMany()
   → Un registro por cada cliente elegible
   ↓
6. Backend encola jobs en Bull/Redis
   → notificationQueue.add('send-notification', { ... })
   → Configuración: attempts: 3, backoff
   ↓
7. Workers procesan jobs en background
   → NotificationJob.process()
   → Procesa de forma asíncrona
   ↓
8. Workers llaman a Twilio (SMS) o Nodemailer (Email)
   → twilioService.sendSMS() o emailService.sendEmail()
   → Manejo de errores y reintentos
   ↓
9. Workers actualizan estado de Notificacion
   → prisma.notificacion.update()
   → Estado: ENVIADA, ENTREGADA, FALLIDA
   → Guarda mensajeError si falla
   ↓
10. Usuario ve progreso en Historial de MessageCenter
    → GET /api/v1/notifications/history
    → Filtros por canal, estado, fecha
    → Paginación de resultados
```

---

## 🐛 Debugging

### Backend

**Logs:**
```typescript
import logger from './utils/logger';

logger.info('Mensaje informativo');
logger.error('Mensaje de error', error);
logger.debug('Mensaje de debug');
```

**Prisma Studio:**
```bash
npm run prisma:studio
# Abre en http://localhost:5555
```

**Debug en VS Code:**
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "skipFiles": ["<node_internals>/**"]
}
```

### Frontend

**React DevTools:**
- Instalar extensión del navegador
- Inspeccionar componentes y estado

**Redux DevTools (si se agrega Redux):**
- Monitorear acciones y estado

**Network Tab:**
- Verificar llamadas API
- Verificar headers y respuestas

---

## 📚 Recursos Útiles

### Documentación

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Jest](https://jestjs.io/docs/getting-started)
- [Vitest](https://vitest.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Herramientas

- **Postman/Insomnia**: Probar APIs
- **Prisma Studio**: Ver/editar base de datos
- **Redis Commander**: Ver caché Redis
- **VS Code Extensions**:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense

---

## ✅ Checklist de Desarrollo

### Antes de Crear PR

- [ ] Tests escritos y pasando
- [ ] Linter sin errores
- [ ] Code formatted
- [ ] Documentación actualizada
- [ ] Variables de entorno documentadas
- [ ] Breaking changes documentados

### Antes de Merge

- [ ] Code review aprobado
- [ ] Tests en CI pasando
- [ ] Sin conflictos
- [ ] Documentación completa

---

## 🚀 Despliegue

### Backend

```bash
# Build
npm run build

# Migraciones en producción
npm run prisma:migrate deploy

# Iniciar servidor
npm start
```

**Variables de entorno requeridas:**
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `REDIS_HOST`, `REDIS_PORT`
- `TWILIO_*` (SMS)
- `SMTP_*` (Email)

### Frontend

```bash
# Build para producción
npm run build

# El build estará en ./build
# Servir con nginx, vercel, etc.
```

**Variables de entorno requeridas:**
- `VITE_API_URL`

---

## 📊 Métricas y Monitoreo

### Coverage Objetivo

- **Backend**: 80%+ coverage
- **Frontend**: 70%+ coverage

### Performance

- **API Response Time**: < 200ms (p95)
- **Page Load Time**: < 2s
- **Database Queries**: Índices apropiados

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0.0

