# Guía de Pruebas del Sistema (End-to-End)

Esta guía detalla los pasos para realizar una prueba completa "Real" del Sistema de Promoción de Servicios, abarcando desde la creación de un cliente hasta el envío de notificaciones de campaña.

> [!NOTE]
> Actualmente, algunas funcionalidades como la asignación automática de segmentos y el lanzamiento desde la UI están en desarrollo. Esta guía incluye los pasos manuales (SQL y API) necesarios para completar el flujo.

## 1. Prerrequisitos

Asegúrate de tener todos los microservicios y el frontend en ejecución.

### Puertos Esperados
Verifica que tus servicios estén corriendo en los siguientes puertos (ajusta tus `.env` si es necesario):

| Servicio | Puerto Esperado | Variable de Entorno |
|----------|-----------------|---------------------|
| Frontend | 5173 (default) | - |
| Clients Service | **3001** | `PORT=3001` |
| Promotions Service | **3002** | `PORT=3002`, `NOTIFICATIONS_SERVICE_URL=http://localhost:3004` |
| Notifications Service | **3004** | `PORT=3004` |

> [!IMPORTANT]
> Si todos los servicios intentan usar el puerto 3002 por defecto, habrá conflictos. Asegúrate de configurarlos en puertos distintos.

## 2. Escenario de Prueba

**Objetivo**: Crear una promoción de "Descuento Premium", asignarla a un cliente y lanzar la campaña por WhatsApp.

**Flujo**:
1.  Crear Cliente (Juan Pérez).
2.  Crear Promoción (Descuento 50%).
3.  Asignar Cliente a Promoción (Manual).
4.  Lanzar Campaña (API).
5.  Verificar Notificación.

## 3. Paso a Paso

### Paso 1: Crear Cliente
1.  Abre el Frontend (`http://localhost:5173`).
2.  Navega a **Clientes**.
3.  Haz clic en **Nuevo Cliente**.
4.  Llena los datos:
    *   **Nombre**: Juan
    *   **Apellido Paterno**: Pérez
    *   **Teléfono**: 70000001 (Número real si quieres probar WhatsApp real, o ficticio para logs)
    *   **Plan**: Postpago
5.  Guarda el cliente.
6.  **Copia el ID del Cliente** (puedes verlo en la URL al editar o en la base de datos).

### Paso 2: Crear Promoción
1.  Navega a **Promociones**.
2.  Haz clic en **Nueva Promoción**.
3.  Llena los datos:
    *   **Nombre**: Promo Verano
    *   **Tipo Descuento**: Porcentaje
    *   **Valor**: 20
    *   **Fecha Inicio/Fin**: Fechas válidas (hoy a mañana).
    *   **Plantilla Mensaje**: `Hola {nombre}, tienes un descuento del 20% en tu plan {plan}!`
4.  Guarda la promoción.
5.  **Copia el ID de la Promoción**.

### Paso 3: Asignar Cliente a Promoción (Manual)
Como el motor de segmentación automática aún no está activo, debemos vincular manualmente al cliente con la promoción en la base de datos.

Ejecuta el siguiente SQL en tu base de datos de **Promociones** (`promotions-service`):

```sql
-- Reemplaza LOS_IDS con los valores reales copiados en los pasos anteriores
INSERT INTO "cliente_promociones" ("id", "clienteId", "promocionId", "estado", "fechaCreacion", "fechaActualizacion")
VALUES (
  gen_random_uuid(), 
  'PEGAR_AQUI_ID_CLIENTE', 
  'PEGAR_AQUI_ID_PROMOCION', 
  'PENDIENTE', 
  NOW(), 
  NOW()
);
```

### Paso 4: Lanzar Campaña (API)
El botón de lanzamiento en la UI aún no está conectado completamente. Usaremos una llamada directa a la API.

Abre tu terminal y ejecuta:

```bash
# Asegúrate de usar el puerto correcto de promotions-service (ej. 3002)
# Reemplaza ID_PROMOCION con el ID real
curl -X POST http://localhost:3002/api/v1/promotions/ID_PROMOCION/launch \
  -H "Content-Type: application/json" \
  -d '{
    "canal": "WHATSAPP",
    "plantillaMensaje": "Hola {nombre}, aprovecha tu descuento especial!"
  }'
```

**Respuesta esperada**:
```json
{
  "status": "success",
  "message": "Campaña lanzada exitosamente",
  "data": { ... }
}
```

### Paso 5: Verificar Notificación
Revisa los logs de la terminal donde corre **notifications-service**. Deberías ver algo como:

```text
[INFO] Processing notification for client Juan Pérez via WHATSAPP
[INFO] Message: Hola Juan, aprovecha tu descuento especial!
```

Si ves este mensaje, ¡la prueba ha sido exitosa! El sistema ha orquestado correctamente la creación, asignación y envío de la promoción.

## 4. Solución de Problemas

*   **Error 404 en Launch**: Verifica que el ID de la promoción sea correcto y que la URL apunte al puerto correcto del servicio de promociones.
*   **Error 502 Bad Gateway**: El servicio de promociones no puede contactar al servicio de notificaciones. Verifica que `notifications-service` esté corriendo y que la variable `NOTIFICATIONS_SERVICE_URL` en `promotions-service` sea correcta.
*   **No llegan notificaciones**: Verifica que el cliente tenga un teléfono válido y que el registro en `cliente_promociones` se haya creado correctamente.
