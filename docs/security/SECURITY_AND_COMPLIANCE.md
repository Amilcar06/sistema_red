# Seguridad y Cumplimiento

Este documento detalla las políticas y controles de seguridad para el Sistema de Promoción de Servicios.

## 1. Clasificación de Datos

| Nivel | Descripción | Ejemplos | Controles Requeridos |
| :--- | :--- | :--- | :--- |
| **Público** | Información no sensible. | Nombres de planes comerciales, Catálogo de productos. | Ninguno especial. |
| **Interno** | Uso exclusivo de la organización. | IDs internos, Logs de sistema (sin PII), Docs técnicos. | Autenticación requerida. |
| **Confidencial (PII)** | Datos personales de usuarios. | Nombre, Teléfono, Email, Historial de recargas. | Cifrado en reposo, Acceso restringido (RBAC), Auditoría. |
| **Crítico/Restringido** | Datos de alto impacto o secretos. | Claves de API, Certificados TLS, Contraseñas (hash). | KMS, Rotación de claves, Acceso "Need-to-know". |

## 2. Control de Acceso (RBAC)

Matriz de roles y permisos para el sistema.

| Recurso | Acción | Admin | Operador | Atención Cliente | Sistema/Servicio |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Clientes** | Crear/Editar | ✅ | ✅ | ❌ | ❌ |
| | Ver (Detalle) | ✅ | ✅ | ✅ | ✅ |
| | Eliminar | ✅ | ❌ | ❌ | ❌ |
| **Promociones** | Crear/Diseñar | ✅ | ✅ | ❌ | ❌ |
| | Aprobar/Activar | ✅ | ❌ | ❌ | ❌ |
| | Ver | ✅ | ✅ | ✅ | ✅ |
| **Notificaciones** | Enviar (Individual) | ✅ | ✅ | ✅ | ✅ |
| | Enviar (Masivo) | ✅ | ✅ | ❌ | ✅ |
| **Configuración** | Ver/Editar Global | ✅ | ❌ | ❌ | ❌ |

## 3. Política de Retención y Borrado

### Retención
- **Tráfico/Logs**: 1 año (requerimiento regulatorio común).
- **Datos de Clientes**: Mientras el contrato esté vigente + 5 años (legal).
- **Datos de Campañas**: 3 años para análisis histórico.

### Derecho al Olvido (Borrado)
Cuando un usuario solicita la eliminación de sus datos:
1. Identificar al usuario y validar la solicitud.
2. Ejecutar "Soft Delete" en la base de datos principal (`deletedAt` timestamp).
3. Anonimizar datos en almacenes analíticos (reemplazar nombre/teléfono con hash).
4. Confirmar eliminación al usuario en un plazo máximo de 48 horas.

## 4. Respuesta a Incidentes (Resumen)

Pasos básicos ante una brecha de seguridad o fallo crítico.

1. **Detección**: Alerta de monitorización, reporte de usuario o log sospechoso.
2. **Contención**:
    - Aislar el componente afectado (cortar tráfico, apagar instancia).
    - Rotar credenciales si hay sospechas de compromiso.
3. **Erradicación**: Identificar causa raíz (patch de vulnerabilidad, bloqueo de IP).
4. **Recuperación**: Restaurar servicio desde backup limpio si es necesario.
5. **Post-Mortem**: Documentar lo sucedido, impacto y acciones de mejora.

## 5. Auditoría

Todas las acciones de modificación (POST, PUT, PATCH, DELETE) sobre recursos críticos generan un registro de auditoría con:
- `timestamp`: Fecha y hora UTC.
- `user_id`: Quién realizó la acción.
- `resource`: Qué entidad se tocó.
- `action`: Tipo de cambio.
- `metadata`: IP origen, User-Agent.
