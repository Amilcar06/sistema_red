# Referencia de API

Esta documentación detalla los endpoints expuestos por el API Gateway (`http://localhost:3001`).

**Nota**: Todos los endpoints protegidos requieren el header `Authorization: Bearer <token>`.

## 🔐 Autenticación (Clients Service)

| Método | Endpoint | Descripción | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Iniciar sesión y obtener JWT. | Público |
| `POST` | `/api/auth/register` | Registrar un nuevo operador. | Público (o Admin) |

## 👥 Clientes (Clients Service)

Base URL: `/api/clients`

| Método | Endpoint | Descripción | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar clientes (paginado). | Auth |
| `POST` | `/` | Crear nuevo cliente. | Admin, Operador |
| `GET` | `/:id` | Obtener detalles de un cliente. | Auth |
| `PATCH` | `/:id` | Actualizar cliente. | Admin, Operador |
| `DELETE` | `/:id` | Eliminar cliente (soft delete). | Admin |
| `GET` | `/plans` | Listar planes disponibles. | Auth |
| `GET` | `/statuses` | Listar estados de cliente posibles. | Auth |
| `GET` | `/statistics` | Estadísticas generales de clientes. | Auth |
| `POST` | `/:id/push-token` | Registrar token para notificaciones push. | Auth |

## 🏷️ Promociones (Promotions Service)

Base URL: `/api/promotions`

| Método | Endpoint | Descripción | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar promociones. | Auth |
| `POST` | `/` | Crear nueva campaña. | Admin, Operador |
| `GET` | `/:id` | Ver detalles de campaña. | Auth |
| `PATCH` | `/:id` | Editar campaña. | Admin, Operador |
| `DELETE` | `/:id` | Eliminar campaña. | Admin |
| `POST` | `/:id/activate` | Activar una promoción (cambia estado a ACTIVA). | Admin, Operador |
| `POST` | `/:id/pause` | Pausar una promoción. | Admin, Operador |
| `POST` | `/:id/launch` | Lanzar promoción (inicia proceso de envío). | Admin, Operador |
| `GET` | `/:id/statistics` | Ver métricas de rendimiento de la campaña. | Auth |
| `GET` | `/segments` | Listar segmentos de clientes disponibles. | Auth |
| `GET` | `/statuses` | Listar estados de promoción. | Auth |

### Productos (Promotions Service)

Base URL: `/api/products`

| Método | Endpoint | Descripción | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar productos del catálogo. | Auth |
| `POST` | `/` | Agregar producto. | Admin, Operador |

## 🔔 Notificaciones (Notifications Service)

Base URL: `/api/notifications`

| Método | Endpoint | Descripción | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/send` | Enviar notificación individual. | Admin, Operador |
| `POST` | `/send-batch` | Enviar notificación masiva (Async). | Admin, Operador |
| `GET` | `/history` | Consultar historial de envíos. | Auth |
| `GET` | `/statuses` | Listar estados de notificación. | Auth |

## 📦 Modelos de Datos Comunes

### Cliente
```json
{
  "id": "uuid",
  "nombre": "Juan",
  "paterno": "Perez",
  "telefono": "59170000000",
  "plan": "PREPAGO",
  "estado": "ACTIVO"
}
```

### Promoción
```json
{
  "id": "uuid",
  "nombre": "Promo Verano",
  "tipoDescuento": "PORCENTAJE",
  "valorDescuento": 10,
  "fechaInicio": "2025-01-01T00:00:00Z",
  "fechaFin": "2025-01-31T23:59:59Z",
  "estado": "BORRADOR"
}
```
