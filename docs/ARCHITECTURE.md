# Arquitectura del Sistema

## Visión General

El "Sistema de Promoción de Servicios" utiliza una arquitectura de **microservicios** para garantizar la escalabilidad, mantenibilidad y el desacoplamiento de las distintas áreas de negocio. El sistema está compuesto por un API Gateway central que orquesta las peticiones hacia tres microservicios principales y sirve a dos clientes frontend (Web y Mobile).

## Diagrama de Arquitectura

```mermaid
graph TD
    subgraph "Clientes"
        Web[Frontend Web (React)]
        Mobile[Frontend Mobile (React Native)]
    end

    subgraph "API Gateway Layer"
        Gateway[API Gateway :3001]
    end

    subgraph "Microservicios"
        Auth[Clients Service :3002]
        Promo[Promotions Service :3003]
        Notif[Notifications Service :3004]
    end

    subgraph "Persistencia & Infraestructura"
        DB_Shared[(PostgreSQL Shared)]
        DB_Logs[(MongoDB Logs)]
        Redis[Redis (BullMQ)]
    end

    %% Conexiones
    Web -->|HTTP/REST| Gateway
    Mobile -->|HTTP/REST| Gateway
    
    Gateway -->|Proxy| Auth
    Gateway -->|Proxy| Promo
    Gateway -->|Proxy| Notif

    Auth -->|Read/Write| DB_Shared
    Promo -->|Read/Write| DB_Shared
    Notif -->|Read/Write| DB_Shared
    Notif -->|Logs| DB_Logs
    
    Notif -->|Jobs| Redis
    Promo -.->|Async Event| Notif
```

## Descripción de Componentes

### 1. API Gateway
- **Tecnología**: Node.js, Express, `http-proxy-middleware`.
- **Responsabilidad**: Actúa como el único punto de entrada para todas las peticiones externas. Maneja el enrutamiento, la limitación de tasa (rate limiting) y puede realizar validaciones de autenticación preliminares.
- **Puerto**: 3001

### 2. Clients Service (Core & Auth)
- **Tecnología**: Node.js, Express, Prisma (PostgreSQL).
- **Responsabilidad**:
    - Gestión de identidad y acceso (Usuarios, Roles, Login).
    - Gestión de la base de datos de Clientes finales.
    - Emisión y validación de JWT.
- **Puerto**: 3002

### 3. Promotions Service
- **Tecnología**: Node.js, Express, Prisma (PostgreSQL).
- **Responsabilidad**:
    - Lógica central del negocio de promociones.
    - Gestión de Productos y Categorías.
    - Motor de Reglas de Negocio (elegibilidad, descuentos).
    - Asignación de promociones a clientes.
- **Puerto**: 3003

### 4. Notifications Service
- **Tecnología**: Node.js, Express, Prisma (PostgreSQL), Mongoose (MongoDB), BullMQ (Redis).
- **Responsabilidad**:
    - Envío de notificaciones multicanal (Email, SMS, WhatsApp).
    - Gestión de colas de mensajes para envíos masivos.
    - Registro histórico detallado (Logs) en MongoDB para auditoría.
- **Puerto**: 3004

## Flujos de Datos Principales

### Autenticación
1. El usuario envía credenciales al Gateway (`/api/auth/login`).
2. Gateway redirige a `Clients Service`.
3. `Clients Service` valida contra PostgreSQL y retorna un JWT.
4. El cliente almacena el JWT y lo envía en el header `Authorization` en futuras peticiones.

### Creación y Envío de Promoción
1. Operador crea una promoción en el Frontend -> Gateway -> `Promotions Service`.
2. `Promotions Service` guarda la definición en PostgreSQL.
3. Operador solicita envío masivo.
4. `Promotions Service` identifica clientes elegibles y envía una solicitud de notificación a `Notifications Service`.
5. `Notifications Service` encola el trabajo en Redis (BullMQ).
6. Un Worker procesa la cola, envía el mensaje real (vía proveedor externo) y guarda el log en MongoDB.

## Decisiones Técnicas

- **Base de Datos Híbrida**: Se utiliza PostgreSQL para datos relacionales estructurados (usuarios, promociones, productos) garantizando integridad referencial. MongoDB se utiliza para logs de notificaciones debido a su naturaleza voluminosa y estructura variable.
- **Comunicación Síncrona (HTTP)**: La comunicación principal entre el Gateway y los servicios es HTTP directo para simplicidad.
- **Procesamiento Asíncrono (Redis)**: Para tareas pesadas como el envío masivo de correos/mensajes, se utiliza una cola de trabajos para no bloquear el hilo principal y garantizar la entrega.
