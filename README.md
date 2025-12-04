# Sistema de Promoción de Servicios de Telefonía Móvil

Este proyecto es una plataforma integral para la gestión y promoción de servicios de telefonía móvil, diseñada con una arquitectura de microservicios moderna y escalable.

## 📚 Mapa de Documentación

Para una comprensión profunda del sistema, consulta los siguientes documentos:

- **[Arquitectura del Sistema](docs/ARCHITECTURE.md)**: Visión general de la arquitectura de microservicios, diagrama de flujo de datos y decisiones técnicas.
- **[Esquema de Base de Datos](docs/DATABASE_SCHEMA.md)**: Diagramas ER y descripción detallada de los modelos de datos (PostgreSQL & MongoDB).
- **[Referencia de API](docs/API_REFERENCE.md)**: Documentación consolidada de todos los endpoints públicos expuestos por el API Gateway.
- **[Guía de Desarrollo](docs/GUIA_DESARROLLO.md)**: Estándares de código, flujo de trabajo Git y estrategias de testing.
- **[Guía Técnica](docs/ARCHITECTURE.md)**: (Redirigido a Arquitectura) Detalles profundos sobre la implementación.

### Documentación por Servicio

Cada componente del sistema tiene su propia documentación detallada:

- **Backend**
  - [API Gateway](api-gateway/README.md)
  - [Clients Service](clients-service/README.md)
  - [Promotions Service](promotions-service/README.md)
  - [Notifications Service](notifications-service/README.md)
- **Frontend**
  - [Panel Web (React)](frontend/README.md)
  - [App Móvil (React Native)](frontend-mobile/README.md)

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js (v18+)
- Docker & Docker Desktop

### Instalación y Ejecución

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-repo>
    cd sistema-promocion-servicios
    ```

2.  **Iniciar Infraestructura (Base de Datos):**
    ```bash
    docker-compose up -d
    ```

3.  **Instalar Dependencias:**
    Ejecuta el siguiente comando para instalar dependencias en todos los servicios (o hazlo manualmente en cada carpeta):
    ```bash
    npm install # en la raíz si hay un workspace, o:
    cd api-gateway && npm install && cd ..
    cd clients-service && npm install && cd ..
    cd promotions-service && npm install && cd ..
    cd notifications-service && npm install && cd ..
    cd frontend && npm install && cd ..
    ```

4.  **Configurar Entorno:**
    Copia los archivos `.env.example` a `.env` en cada servicio y ajusta las credenciales si es necesario.

5.  **Ejecutar Sistema:**
    ```bash
    # En terminales separadas para cada servicio
    cd api-gateway && npm run dev
    cd clients-service && npm run dev
    # ... etc
    ```

## 🏗 Resumen de Arquitectura

| Servicio | Puerto | Descripción |
| :--- | :--- | :--- |
| **API Gateway** | `3001` | Punto de entrada único. Enrutamiento y Auth preliminar. |
| **Clients Service** | `3002` | Gestión de Clientes, Usuarios y Autenticación. |
| **Promotions Service** | `3003` | Gestión de Promociones y Reglas de Negocio. |
| **Notifications Service** | `3004` | Envío de mensajes (Email, WhatsApp) y Logs. |
| **Frontend Web** | `3000` | Panel de Administración. |

---
**Versión**: 2.0.0
