# Plan de Implementación: Asignación Manual y Reportes Avanzados

Este plan aborda la necesidad de realizar la asignación de clientes a promociones directamente desde la interfaz de usuario (eliminando la necesidad de SQL manual) y mejora la capacidad de reporte del sistema.

## User Review Required

> [!IMPORTANT]
> **Cambio en Flujo de Trabajo**: Se añadirá un paso explícito de "Gestión de Audiencia" en la creación/edición de promociones.
> **Microservicios**: Se requiere comunicación entre `promotions-service` (para guardar la relación) y `clients-service` (para buscar clientes).

## Proposed Changes

### Frontend

#### [MODIFY] [PromotionManagement.tsx](file:///Users/amilcaryujra/Desktop/Sistema%20de%20Promoci%C3%B3n%20de%20Servicios/frontend/src/components/PromotionManagement.tsx)
- Añadir un botón "Gestionar Audiencia" en la tarjeta de la promoción.
- Implementar un diálogo modal que permita:
    - Buscar clientes (por nombre/teléfono) consultando a `clients-service`.
    - Seleccionar clientes de una lista.
    - "Asignar" clientes seleccionados a la promoción (llamada a API `promotions-service`).
    - Ver clientes ya asignados.

#### [MODIFY] [Reports.tsx](file:///Users/amilcaryujra/Desktop/Sistema%20de%20Promoci%C3%B3n%20de%20Servicios/frontend/src/components/Reports.tsx)
- Conectar los gráficos de "Tendencia de Conversiones" y "Rendimiento por Canal" a datos reales del backend en lugar de datos simulados.
- Añadir filtros de rango de fechas.

### Promotions Service

#### [NEW] [promotion-audience.controller.ts](file:///Users/amilcaryujra/Desktop/Sistema%20de%20Promoci%C3%B3n%20de%20Servicios/promotions-service/src/controllers/promotion-audience.controller.ts)
- Crear controlador para manejar la lógica de audiencia.
- `addClientToPromotion`: Recibe `promotionId` y `clientId`, crea registro en `ClientePromocion`.
- `removeClientFromPromotion`: Elimina el registro.
- `getPromotionAudience`: Retorna lista de clientes asignados.

#### [MODIFY] [promotion.routes.ts](file:///Users/amilcaryujra/Desktop/Sistema%20de%20Promoci%C3%B3n%20de%20Servicios/promotions-service/src/routes/promotion.routes.ts)
- Añadir rutas para gestión de audiencia:
    - `POST /:id/audience/clients` (Agregar cliente)
    - `DELETE /:id/audience/clients/:clientId` (Remover cliente)
    - `GET /:id/audience` (Ver audiencia)

#### [MODIFY] [reports.controller.ts](file:///Users/amilcaryujra/Desktop/Sistema%20de%20Promoci%C3%B3n%20de%20Servicios/promotions-service/src/controllers/reports.controller.ts)
- Implementar (o corregir) `getDashboardStats` para devolver datos históricos reales agrupados por fecha para los gráficos.
- Asegurar que el cálculo de ROI y tasas de conversión sea dinámico.

### Clients Service

#### [VERIFY] [client.controller.ts](file:///Users/amilcaryujra/Desktop/Sistema%20de%20Promoci%C3%B3n%20de%20Servicios/clients-service/src/controllers/client.controller.ts)
- Asegurar que el endpoint `GET /` soporte búsqueda por `nombre` o `telefono` (query params) para el buscador del frontend.

## Verification Plan

### Automated Tests
- Verificar que se puede agregar un cliente a una promoción vía API.
- Verificar que los reportes devuelven JSON con la estructura correcta.

### Manual Verification
1.  **Asignación Manual**:
    - Entrar a "Promociones".
    - Abrir "Gestionar Audiencia" en una promoción.
    - Buscar "Juan".
    - Seleccionar y Asignar.
    - Verificar que aparece en la lista de asignados.
2.  **Lanzamiento**:
    - Usar el botón de lanzamiento (si se implementa) o la API, y verificar que Juan recibe el mensaje.
3.  **Reportes**:
    - Generar actividad (crear promoción, asignar, simular conversión).
    - Ir a "Reportes" y verificar que los gráficos reflejan la actividad reciente.
