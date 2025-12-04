# API Gateway

El punto de entrada unificado para el "Sistema de Promoción de Servicios". Este componente enruta las peticiones del frontend a los microservicios correspondientes, simplificando la superficie de ataque y la configuración del cliente.

## 📋 Características

- **Proxy Inverso**: Redirige tráfico basado en rutas (`/api/clients` -> Puerto 3002).
- **CORS Centralizado**: Maneja las políticas de Cross-Origin Resource Sharing para todo el sistema.
- **Rate Limiting**: Protege los servicios backend de abusos limitando el número de peticiones por IP.

## 🛠 Tecnologías

- **Runtime**: Node.js
- **Framework**: Express
- **Proxy**: `http-proxy-middleware`

## 🚀 Configuración

### Variables de Entorno (.env)

```env
PORT=3001
CLIENTS_SERVICE_URL="http://localhost:3002"
PROMOTIONS_SERVICE_URL="http://localhost:3003"
NOTIFICATIONS_SERVICE_URL="http://localhost:3004"
```

## 🚦 Tabla de Enrutamiento

| Ruta Pública | Servicio Destino | Puerto |
| :--- | :--- | :--- |
| `/api/auth/*` | Clients Service | `3002` |
| `/api/clients/*` | Clients Service | `3002` |
| `/api/promotions/*` | Promotions Service | `3003` |
| `/api/products/*` | Promotions Service | `3003` |
| `/api/notifications/*` | Notifications Service | `3004` |

## 🛡 Seguridad

El Gateway es el lugar ideal para implementar:
- Validación básica de tokens (opcional, actualmente delegada a servicios).
- Headers de seguridad (Helmet).
- Logging de acceso unificado.
