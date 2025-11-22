# Cambios Realizados: Nombres en Español

Este documento detalla todos los cambios realizados para traducir los nombres de tablas y atributos al español en todo el backend.

## 📋 Tablas (Modelos Prisma → Base de Datos)

| Modelo Prisma | Tabla en BD | Descripción |
|--------------|-------------|-------------|
| `Usuario` | `usuarios` | Usuarios del sistema |
| `Cliente` | `clientes` | Clientes de telefonía |
| `Producto` | `productos` | Productos/servicios |
| `Promocion` | `promociones` | Promociones activas |
| `PromocionProducto` | `promocion_productos` | Relación promoción-producto |
| `ClientePromocion` | `cliente_promociones` | Relación cliente-promoción |
| `ReglaNegocio` | `reglas_negocio` | Reglas de negocio |
| `PromocionRegla` | `promocion_reglas` | Relación promoción-regla |
| `Notificacion` | `notificaciones` | Notificaciones enviadas |
| `ConfiguracionSistema` | `configuraciones_sistema` | Configuraciones del sistema |
| `Reporte` | `reportes` | Reportes generados |

## 📝 Atributos Principales

### Modelo Usuario
- `id` → `id` (sin cambio)
- `email` → `correo`
- `password` → `contrasena`
- `name` → `nombre`
- `role` → `rol`
- `isActive` → `activo`
- `createdAt` → `fechaCreacion`
- `updatedAt` → `fechaActualizacion`

### Modelo Cliente
- `id` → `id`
- `name` → `nombre`
- `phone` → `telefono`
- `email` → `correo`
- `plan` → `plan`
- `status` → `estado`
- `registrationDate` → `fechaRegistro`
- `lastActivityDate` → `fechaUltimaActividad`
- `createdAt` → `fechaCreacion`
- `updatedAt` → `fechaActualizacion`

### Modelo Producto
- `id` → `id`
- `name` → `nombre`
- `description` → `descripcion`
- `category` → `categoria`
- `price` → `precio`
- `isActive` → `activo`
- `createdAt` → `fechaCreacion`
- `updatedAt` → `fechaActualizacion`

### Modelo Promocion
- `id` → `id`
- `name` → `nombre`
- `description` → `descripcion`
- `discountType` → `tipoDescuento`
- `discountValue` → `valorDescuento`
- `startDate` → `fechaInicio`
- `endDate` → `fechaFin`
- `status` → `estado`
- `targetSegment` → `segmentoObjetivo`
- `messageTemplate` → `plantillaMensaje`
- `totalSent` → `totalEnviados`
- `totalConverted` → `totalConvertidos`
- `createdAt` → `fechaCreacion`
- `updatedAt` → `fechaActualizacion`

### Modelo Notificacion
- `id` → `id`
- `clientId` → `clienteId`
- `promotionId` → `promocionId`
- `channel` → `canal`
- `status` → `estado`
- `title` → `titulo`
- `message` → `mensaje`
- `sentAt` → `fechaEnviado`
- `deliveredAt` → `fechaEntregado`
- `readAt` → `fechaLeido`
- `failedAt` → `fechaFallido`
- `errorMessage` → `mensajeError`
- `createdAt` → `fechaCreacion`
- `updatedAt` → `fechaActualizacion`

### Modelo ReglaNegocio
- `id` → `id`
- `name` → `nombre`
- `description` → `descripcion`
- `ruleType` → `tipoRegla`
- `conditions` → `condiciones`
- `actions` → `acciones`
- `priority` → `prioridad`
- `isActive` → `activa`
- `createdAt` → `fechaCreacion`
- `updatedAt` → `fechaActualizacion`

## 🔄 Enums Actualizados

### RolUsuario
- `ADMIN` → `ADMIN` (sin cambio)
- `OPERATOR` → `OPERADOR`
- `VIEWER` → `VISOR`

### EstadoCliente
- `ACTIVE` → `ACTIVO`
- `INACTIVE` → `INACTIVO`
- `SUSPENDED` → `SUSPENDIDO`

### TipoDescuento
- `PERCENTAGE` → `PORCENTAJE`
- `FIXED_AMOUNT` → `MONTO_FIJO`
- `FREE` → `GRATIS`

### EstadoPromocion
- `DRAFT` → `BORRADOR`
- `ACTIVE` → `ACTIVA`
- `PAUSED` → `PAUSADA`
- `ENDED` → `FINALIZADA`
- `CANCELLED` → `CANCELADA`

### CanalNotificacion
- `SMS` → `SMS` (sin cambio)
- `WHATSAPP` → `WHATSAPP` (sin cambio)
- `EMAIL` → `CORREO`

### EstadoNotificacion
- `PENDING` → `PENDIENTE`
- `QUEUED` → `EN_COLA`
- `SENT` → `ENVIADA`
- `DELIVERED` → `ENTREGADA`
- `FAILED` → `FALLIDA`
- `CANCELLED` → `CANCELADA`

### TipoRegla
- `ELIGIBILITY` → `ELEGIBILIDAD`
- `DISCOUNT` → `DESCUENTO`
- `NOTIFICATION` → `NOTIFICACION`
- `SCHEDULING` → `PROGRAMACION`

### EstadoClientePromocion
- `PENDING` → `PENDIENTE`
- `SENT` → `ENVIADA`
- `CONVERTED` → `CONVERTIDA`
- `REJECTED` → `RECHAZADA`

## 📝 Interfaces y Tipos Actualizados

### Auth Service
```typescript
// Antes
interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

// Ahora
interface RegisterData {
  correo: string;
  contrasena: string;
  nombre: string;
  rol?: 'ADMIN' | 'OPERADOR' | 'VISOR';
}
```

### Client Service
```typescript
// Antes
interface CreateClientData {
  name: string;
  phone: string;
  email?: string;
  plan: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

// Ahora
interface CreateClientData {
  nombre: string;
  telefono: string;
  correo?: string;
  plan: string;
  estado?: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
}
```

### Promotion Service
```typescript
// Antes
interface CreatePromotionData {
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE';
  startDate: Date;
  endDate: Date;
}

// Ahora
interface CreatePromotionData {
  nombre: string;
  tipoDescuento: 'PORCENTAJE' | 'MONTO_FIJO' | 'GRATIS';
  fechaInicio: Date;
  fechaFin: Date;
}
```

## 🔧 Validadores Actualizados

Todos los validadores Zod han sido actualizados para usar los nombres en español:

- `registerSchema`: `correo`, `contrasena`, `nombre`, `rol`
- `loginSchema`: `correo`, `contrasena`
- `createClientSchema`: `nombre`, `telefono`, `correo`, `plan`, `estado`
- `createProductSchema`: `nombre`, `descripcion`, `categoria`, `precio`, `activo`
- `createPromotionSchema`: `nombre`, `tipoDescuento`, `valorDescuento`, `fechaInicio`, `fechaFin`
- `sendNotificationSchema`: `clienteId`, `promocionId`, `canal`, `titulo`, `mensaje`
- `createRuleSchema`: `nombre`, `tipoRegla`, `condiciones`, `acciones`, `prioridad`

## 🛣️ Rutas Actualizadas

Todas las rutas ahora usan los roles en español:
- `authorize('ADMIN', 'OPERADOR')` en lugar de `authorize('ADMIN', 'OPERATOR')`

Parámetros de ruta:
- `/rules/evaluate/:clienteId/:promocionId` (antes `:clientId/:promotionId`)

## 📊 Respuestas de API

Las respuestas ahora usan nombres en español en las estructuras de datos:

### Clientes
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

### Promociones
```json
{
  "status": "success",
  "datos": [...],
  "paginacion": {...}
}
```

### Estadísticas
```json
{
  "status": "success",
  "data": {
    "total": 100,
    "activos": 80,
    "inactivos": 20,
    "porPlan": [...]
  }
}
```

## ✅ Archivos Actualizados

### Schema
- ✅ `prisma/schema.prisma` - Todos los modelos y enums traducidos

### Servicios
- ✅ `src/services/auth.service.ts`
- ✅ `src/services/client.service.ts`
- ✅ `src/services/product.service.ts`
- ✅ `src/services/promotion.service.ts`
- ✅ `src/services/notification.service.ts`
- ✅ `src/services/rule.service.ts`
- ✅ `src/services/rule-engine.service.ts`

### Controladores
- ✅ `src/controllers/auth.controller.ts`
- ✅ `src/controllers/client.controller.ts`
- ✅ `src/controllers/product.controller.ts`
- ✅ `src/controllers/promotion.controller.ts`
- ✅ `src/controllers/notification.controller.ts`
- ✅ `src/controllers/rule.controller.ts`

### Middleware
- ✅ `src/middleware/auth.middleware.ts` - Interface AuthRequest actualizada

### Rutas
- ✅ `src/routes/auth.routes.ts`
- ✅ `src/routes/client.routes.ts`
- ✅ `src/routes/product.routes.ts`
- ✅ `src/routes/promotion.routes.ts`
- ✅ `src/routes/notification.routes.ts`
- ✅ `src/routes/rule.routes.ts`

### Utilidades
- ✅ `src/utils/validators.ts` - Todos los schemas Zod actualizados

## 🚀 Próximos Pasos

1. **Ejecutar migraciones de Prisma**:
   ```bash
   npm run prisma:migrate
   ```

2. **Regenerar cliente Prisma**:
   ```bash
   npm run prisma:generate
   ```

3. **Verificar que todo compile**:
   ```bash
   npm run build
   ```

## ⚠️ Notas Importantes

1. **Mapeo de Nombres**: Los modelos en Prisma siguen usando camelCase (ej: `Usuario`, `Cliente`) pero los nombres de las tablas en la BD están en español gracias a `@@map()`.

2. **Campos en Código**: El código TypeScript usa los nombres en español de los campos (ej: `cliente.nombre`, `promocion.estado`).

3. **Validaciones**: Todos los validadores Zod ahora esperan y validan nombres en español.

4. **API Requests**: Las peticiones HTTP ahora deben usar los nombres en español en el body:
   ```json
   {
     "nombre": "Juan Pérez",
     "telefono": "+591 12345678",
     "correo": "juan@example.com",
     "plan": "Premium",
     "estado": "ACTIVO"
   }
   ```

5. **Respuestas API**: Las respuestas también devuelven datos con nombres en español.

## 🔍 Búsqueda de Referencias

Para encontrar cualquier referencia a los nombres antiguos:
```bash
grep -r "\.user\." src/
grep -r "\.client\." src/
grep -r "\.product\." src/
grep -r "\.promotion\." src/
grep -r "\.notification\." src/
grep -r "\.businessRule\." src/
```

---

**Todos los cambios han sido implementados y el sistema está listo para usar nombres completamente en español.**

