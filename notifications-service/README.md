# Notifications Service

Microservicio dedicado a la comunicación con el cliente final. Gestiona el envío de mensajes a través de múltiples canales y mantiene un registro detallado de todas las interacciones.

## 📋 Características

- **Multicanal**: Soporte para Email (Nodemailer), WhatsApp (whatsapp-web.js) y SMS (Twilio).
- **Colas de Trabajo**: Uso de BullMQ (Redis) para procesar envíos masivos de manera asíncrona y robusta.
- **Logging Detallado**: Almacenamiento de logs de envío y respuestas de proveedores en MongoDB.

## 🛠 Tecnologías

- **Runtime**: Node.js
- **Framework**: Express
- **Base de Datos Relacional**: PostgreSQL (para el estado transaccional de la notificación).
- **Base de Datos NoSQL**: MongoDB (para logs históricos y payloads).
- **Colas**: Redis + BullMQ.

## 🚀 Configuración

### Variables de Entorno (.env)

```env
PORT=3004
DATABASE_URL="postgresql://..."
MONGO_URI="mongodb://..."
REDIS_HOST="localhost"
REDIS_PORT=6379

# Credenciales de Proveedores (Ejemplo)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="tu_email@gmail.com"
TWILIO_SID="..."
```

### Scripts Disponibles

| Script | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia servidor y workers de cola. |
| `npm test` | Ejecuta tests. |

## 🏗 Arquitectura de Envío

1.  **Recepción**: El endpoint `/send` o `/bulk` recibe la solicitud.
2.  **Encolado**: Se crea un Job en la cola `notifications-queue` de Redis.
3.  **Procesamiento**: Un Worker toma el trabajo.
4.  **Envío**: Se selecciona el adaptador del canal (Email/WhatsApp) y se envía.
5.  **Registro**: Se actualiza el estado en PostgreSQL y se guarda el log completo en MongoDB.

## 🔌 API Reference

- `POST /notifications/send`: Envío individual síncrono (o encolado rápido).
- `POST /notifications/bulk`: Envío masivo asíncrono.
- `GET /notifications/history`: Consulta de historial.
