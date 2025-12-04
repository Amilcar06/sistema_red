# Promotions Service

Microservicio encargado de la lógica central del negocio: gestión de productos, creación de campañas promocionales y ejecución de reglas de negocio.

## 📋 Características

- **Gestión de Productos**: Catálogo de servicios/productos a promocionar.
- **Motor de Promociones**: Creación de campañas con fechas, estados y segmentos.
- **Reglas de Negocio**: Sistema flexible para definir elegibilidad y descuentos.
- **Asignación**: Vinculación de promociones a clientes específicos.

## 🛠 Tecnologías

- **Runtime**: Node.js
- **Framework**: Express
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL (Comparte instancia con Clients Service)

## 🚀 Configuración

### Variables de Entorno (.env)

```env
PORT=3003
DATABASE_URL="postgresql://user:password@localhost:5432/db_name?schema=public"
```

### Scripts Disponibles

| Script | Descripción |
| :--- | :--- |
| `npm run dev` | Modo desarrollo. |
| `npm run prisma:migrate` | Sincroniza el esquema de Prisma. |
| `npm test` | Ejecuta tests. |

## 🔌 API Reference

Endpoints internos principales:

- `GET /promotions`: Listar promociones.
- `POST /promotions`: Crear nueva promoción.
- `POST /promotions/:id/assign`: Asignar promoción a clientes (trigger de lógica de negocio).
- `GET /products`: Gestión de catálogo.

## 🔄 Integración

Este servicio emite eventos (o llamadas directas en la versión actual) al **Notifications Service** cuando una promoción debe ser enviada a un cliente.
