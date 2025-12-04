# Sistema de Promoción de Servicios de Telefonía Móvil

Este proyecto es una plataforma integral para la gestión y promoción de servicios de telefonía móvil, diseñada con una arquitectura de microservicios moderna y escalable.

## 🏗 Arquitectura

El sistema ha sido migrado de un monolito a una arquitectura de microservicios distribuida:

| Servicio | Puerto | Descripción | Tecnologías |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `3001` | Punto de entrada único. Enrutamiento, Rate Limiting y Auth preliminar. | Express, Http-Proxy-Middleware |
| **Clients Service** | `3002` | Gestión de Clientes, Usuarios, Autenticación y Metadata. | Node.js, PostgreSQL, MongoDB |
| **Promotions Service** | `3003` | Gestión de Promociones, Productos y Reglas de Negocio. | Node.js, PostgreSQL |
| **Notifications Service** | `3004` | Envío de mensajes (Email, WhatsApp, Push) y Logs. | Node.js, MongoDB, BullMQ |
| **Frontend Web** | `3000` | Panel de Administración para operadores. | React, Vite, TailwindCSS |
| **Frontend Mobile** | - | App para clientes finales. | React Native, Expo |

## 🚀 Requisitos Previos

- Node.js (v18+)
- Docker & Docker Desktop
- PostgreSQL (Local o Docker)
- MongoDB (Docker)

## 🛠 Configuración e Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-repo>
    cd sistema-promocion-servicios
    ```

2.  **Iniciar Infraestructura de Datos (MongoDB):**
    Asegúrate de que Docker Desktop esté corriendo.
    ```bash
    docker-compose up -d mongo
    ```

3.  **Instalar Dependencias:**
    Ejecuta `npm install` en cada directorio de servicio:
    ```bash
    cd api-gateway && npm install
    cd ../clients-service && npm install
    cd ../promotions-service && npm install
    cd ../notifications-service && npm install
    cd ../frontend && npm install
    ```

4.  **Configuración de Entorno (.env):**
    Asegúrate de configurar los archivos `.env` en cada servicio con las credenciales correctas de base de datos (Postgres y Mongo).

## ▶️ Ejecución

Para levantar todo el sistema en entorno de desarrollo:

1.  **API Gateway:**
    ```bash
    cd api-gateway && npm run dev
    ```
2.  **Microservicios (en terminales separadas):**
    ```bash
    cd clients-service && npm run dev
    cd promotions-service && npm run dev
    cd notifications-service && npm run dev
    ```
3.  **Frontend Web:**
    ```bash
    cd frontend && npm run dev
    ```
4.  **Frontend Mobile:**
    ```bash
    cd frontend-mobile && npx expo start
    ```

## 📚 Documentación Adicional

- **[Migration Plan](migration_plan.md):** Hoja de ruta de la evolución arquitectónica.
- **[Guía Técnica](GUIA_TECNICA.md):** Detalles profundos sobre la implementación.

## 🧪 Testing

Cada microservicio cuenta con sus propios tests unitarios y de integración.
```bash
npm run test
```
