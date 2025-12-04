# Clients Service

Este microservicio es responsable de la gestión de usuarios (operadores), clientes finales y la autenticación centralizada del sistema.

## 📋 Características

- **Gestión de Usuarios**: CRUD de operadores y administradores.
- **Gestión de Clientes**: Base de datos de clientes finales con metadata flexible.
- **Autenticación**: Emisión y validación de JSON Web Tokens (JWT).
- **Autorización**: Middleware para control de acceso basado en roles (RBAC).

## 🛠 Tecnologías

- **Runtime**: Node.js
- **Framework**: Express
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL (Esquema `public`)

## 🚀 Configuración

### Variables de Entorno (.env)

Crea un archivo `.env` en la raíz del servicio con las siguientes variables:

```env
PORT=3002
DATABASE_URL="postgresql://user:password@localhost:5432/db_name?schema=public"
JWT_SECRET="tu_secreto_jwt"
```

### Scripts Disponibles

| Script | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor en modo desarrollo con recarga automática. |
| `npm run build` | Compila el código TypeScript a JavaScript en `dist/`. |
| `npm start` | Inicia el servidor compilado (producción). |
| `npm run prisma:migrate` | Ejecuta migraciones de base de datos. |
| `npm run prisma:seed` | Puebla la base de datos con datos iniciales. |
| `npm test` | Ejecuta la suite de pruebas unitarias e integración. |

## 🔌 API Reference

Aunque el acceso principal es a través del API Gateway, este servicio expone internamente:

- `POST /auth/login`: Autenticación de usuarios.
- `POST /auth/register`: Registro de nuevos operadores.
- `GET /clients`: Listado de clientes con filtros.
- `POST /clients`: Creación de nuevos clientes.
- `PATCH /clients/:id`: Actualización de datos de cliente.

## 📂 Estructura de Carpetas

```
src/
├── config/         # Configuración de DB y variables
├── controllers/    # Lógica de entrada/salida HTTP
├── middleware/     # Auth, validaciones, manejo de errores
├── routes/         # Definición de rutas Express
├── services/       # Lógica de negocio pura
├── utils/          # Validadores (Zod), helpers
└── server.ts       # Punto de entrada
```
