# Guía de Desarrollo - Sistema de Promoción de Servicios

Guía completa para desarrolladores: setup, testing, buenas prácticas y contribución en arquitectura de microservicios.

---

## 🛠️ Setup de Desarrollo

### Requisitos

- **Node.js** 18+ (LTS recomendado)
- **Docker & Docker Desktop** (Indispensable para bases de datos y colas)
- **npm** o **yarn**
- **Git**

### Configuración Inicial

#### 1. Clonar Repositorio

```bash
git clone <url-repo>
cd sistema-promocion-servicios
```

#### 2. Levantar Infraestructura (Docker)

Para desarrollo, necesitamos bases de datos y Redis corriendo. Usamos Docker Compose para esto.

```bash
# Levanta MongoDB, PostgreSQL y Redis en segundo plano
docker-compose up -d
```

> **Nota:** Verifica que los contenedores estén corriendo con `docker ps`.

#### 3. Instalación de Dependencias

Debes instalar las dependencias en **cada microservicio** y en el **frontend**.

```bash
# API Gateway
cd api-gateway && npm install

# Clients Service
cd ../clients-service && npm install

# Promotions Service
cd ../promotions-service && npm install

# Notifications Service
cd ../notifications-service && npm install

# Frontend
cd ../frontend && npm install
```

#### 4. Variables de Entorno (.env)

Crea un archivo `.env` en cada carpeta de servicio basándote en `.env.example`.

**Ejemplo `clients-service/.env`:**
```env
PORT=3002
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clients_db?schema=public"
JWT_SECRET="supersecret"
```

**Ejemplo `notifications-service/.env`:**
```env
PORT=3004
MONGO_URI="mongodb://root:rootpassword@localhost:27017/notifications_db?authSource=admin"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

#### 5. Inicialización de Bases de Datos

El sistema utiliza una base de datos PostgreSQL compartida. Debes ejecutar las migraciones y el seed principal desde `clients-service`:

```bash
# En clients-service (Carga el esquema y datos de prueba completos)
npm run prisma:migrate
npm run prisma:seed
```

> **Nota:** Los otros servicios (`promotions`, `notifications`) comparten el mismo esquema Prisma, por lo que no es necesario correr migraciones en ellos si ya se hicieron en `clients-service`.

---

## ▶️ Ejecución en Desarrollo

Recomendamos abrir múltiples terminales o usar una herramienta como `concurrently` (si está configurada) para ver los logs de cada servicio.

**Terminal 1: API Gateway**
```bash
cd api-gateway && npm run dev
```

**Terminal 2: Clients Service**
```bash
cd clients-service && npm run dev
```

**Terminal 3: Promotions Service**
```bash
cd promotions-service && npm run dev
```

**Terminal 4: Notifications Service**
```bash
cd notifications-service && npm run dev
```

**Terminal 5: Frontend**
```bash
cd frontend && npm run dev
```

---

## 🧪 Testing

Cada microservicio tiene su propia suite de tests.

### Ejecutar Tests

```bash
# Ir al servicio deseado
cd clients-service

# Ejecutar todos los tests
npm test

# Modo watch (desarrollo)
npm run test:watch
```

### Estrategia de Testing

1.  **Unit Tests**: Pruebas aisladas de servicios y utilidades. Mocks para DB y dependencias externas.
2.  **Integration Tests**: Pruebas de endpoints API. Requieren una base de datos de prueba (puedes usar contenedores Docker efímeros o una DB de test local).

---

## 📝 Estándares de Código

### Backend (Microservicios)

- **Estructura**: Mantener la separación de `routes`, `controllers`, `services`.
- **Async/Await**: Usar siempre para operaciones asíncronas.
- **Manejo de Errores**: Usar un middleware global de errores. No dejar `try/catch` vacíos.
- **Logs**: Usar librerías de logging (ej: Winston/Pino) en lugar de `console.log`.

### Frontend (React)

- **Componentes Funcionales**: Usar Hooks (`useState`, `useEffect`).
- **Tailwind CSS**: Usar clases utilitarias para estilos. Evitar CSS puro si es posible.
- **Tipado**: Usar TypeScript estricto. Evitar `any`.

---

## 🔄 Flujo de Trabajo Git

1.  **Rama `main`**: Producción/Estable.
2.  **Rama `develop`**: Integración de desarrollo.
3.  **Ramas `feature/nombre-feature`**: Para nuevas funcionalidades.

**Proceso:**
1.  Crear rama desde `develop`.
2.  Implementar cambios.
3.  Tests locales pasando.
4.  Pull Request a `develop`.

---

## 🐛 Debugging Común

- **Error de conexión a DB**: Verifica que Docker esté corriendo y las credenciales en `.env` coincidan con `docker-compose.yml`.
- **CORS Error**: Verifica que el API Gateway tenga configurados los orígenes permitidos (el puerto del frontend).
- **Redis Connection Refused**: Asegúrate de que Redis esté levantado (`docker-compose up -d`).

---

**Última actualización**: Diciembre 2025
**Versión**: 2.0.0

