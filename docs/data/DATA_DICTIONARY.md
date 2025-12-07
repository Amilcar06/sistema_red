# Diccionario de Datos

Descripción estructurada de las entidades principales del sistema y estrategia de gestión de esquema.

## 1. Entidades Principales

### 👤 Tabla: `Clients` (Clientes)
Almacena la información base de los suscriptores.

| Columna | Tipo | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `id` | UUID | ✅ | Identificador único. |
| `firstName` | VARCHAR(100) | ✅ | Nombre real. |
| `lastName` | VARCHAR(100) | ✅ | Apellido paterno/materno. |
| `phone` | VARCHAR(20) | ✅ | MSISDN (Número único e indexado). |
| `segment` | ENUM | ❌ | Segmento comercial (GOLD, PLATINUM, STANDARD). |
| `status` | ENUM | ✅ | Estado de línea (ACTIVE, SUSPENDED). |

### 🏷️ Tabla: `Promotions` (Promociones)
Definición de las campañas comerciales.

| Columna | Tipo | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `id` | UUID | ✅ | PK. |
| `name` | VARCHAR(150) | ✅ | Nombre interno de la campaña. |
| `discountType`| ENUM | ✅ | Tipo de beneficio (PERCENTAGE, FIXED_AMOUNT, DATA_PACK). |
| `value` | DECIMAL | ✅ | Valor numérico del beneficio. |
| `startDate` | TIMESTAMP | ✅ | Inicio de vallidez. |
| `endDate` | TIMESTAMP | ✅ | Fin de validez. |

### 🔔 Tabla: `Notifications` (Historial)
Registro de comunicaciones enviadas.

| Columna | Tipo | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `id` | UUID | ✅ | PK. |
| `clientId` | UUID | ✅ | FK a tabla Clients. |
| `promotionId` | UUID | ❌ | FK a Promoción (si aplica). |
| `channel` | ENUM | ✅ | Canal (SMS, WA, PUSH). |
| `status` | ENUM | ✅ | Estado de entrega (QUEUED, SENT, DLR_RECEIVED, FAILED). |

## 2. Gestión de Esquema (Migrations)

El sistema utiliza **Prisma ORM** (o herramienta similar) para gestionar cambios en la BD.

### Flujo de Trabajo
1.  Modificar `schema.prisma`.
2.  Generar migración: `npx prisma migrate dev --name add_new_field`.
3.  Revisar SQL generado en `./migrations/<timestamp>_add_new_field/migration.sql`.
4.  Aplicar en CI/CD: `npx prisma migrate deploy`.

### Reglas de Oro
*   **No Breaking Changes**: Evitar renombrar columnas con datos; preferir "Expand and Contract".
*   **Índices**: Todo campo usado en `WHERE` o `JOIN` frecuentes debe tener índice.
*   **Soft Deletes**: Usar columna `deletedAt` en lugar de `DELETE` físico para entidades maestras.
