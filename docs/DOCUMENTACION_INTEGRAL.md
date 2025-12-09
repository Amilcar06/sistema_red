# Documentación Técnica Integral del Sistema de Promoción de Servicios

Este documento unifica la información técnica, operativa y de gobernanza del sistema, estructurada según los roles responsables definidos.

---

## 👤 PERSONA 1 – API y Contratos de Integración

### 4.1. Contratos de Integración

El sistema expone una API RESTful versionada, asegurada mediante JSON Web Tokens (JWT).

**Estándar de Versionado:**
Las rutas siguen el patrón: `/api/v{MAJOR}/{resource}`. Actualmente se encuentra en **v1**.

**Protocolos:**
-   **Transporte:** HTTPS (TLS 1.2+).
-   **Autenticación:** Header `Authorization: Bearer <token>`.
-   **Formato:** JSON (`application/json`).

#### Endpoints Principales

##### 1. Autenticación (`Auth`)
_Base Path: `/api/v1/auth`_

| Método | Endpoint | Descripción | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Registrar nuevo usuario. | Público |
| `POST` | `/login` | Iniciar sesión y obtener token. | Público |
| `GET` | `/me` | Obtener perfil del usuario actual. | Autenticado |

**Ejemplo Request (Login):**
```json
POST /api/v1/auth/login
{
  "email": "admin@empresa.com",
  "password": "SecurePassword123!"
}
```

**Ejemplo Response (Login - 200 OK):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "uuid-1234",
      "email": "admin@empresa.com",
      "role": "ADMIN"
    }
  }
}
```

##### 2. Gestión de Clientes (`Clients`)
_Base Path: `/api/v1/clients`_

| Método | Endpoint | Descripción | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar clientes (paginado). | Admin, Operador |
| `POST` | `/` | Crear nuevo cliente. | Admin, Operador |
| `GET` | `/:id` | Ver detalle de un cliente. | Admin, Operador |
| `PATCH` | `/:id` | Actualizar datos parciales. | Admin, Operador |
| `DELETE` | `/:id` | Eliminar cliente (Soft Delete). | Admin |

**Validaciones Clave:**
-   `email`: Formato válido y único.
-   `telefono`: Formato E.164 o local válido.
-   `ci`: Cedula de identidad requerida para usuarios Bolivianos.

---

## 👤 PERSONA 2 – Seguridad y Privacidad

### 4.2. Visión General de Seguridad

El sistema implementa un enfoque de **Defensa en Profundidad** y **Zero Trust**, asumiendo que ninguna red es confiable. Se aplican los lineamientos de **OWASP Top 10**.

**Mapa de Activos:**
-   **Datos Críticos:** Credenciales (Hash), PII de Clientes (CI, Teléfono).
-   **Infraestructura:** Contenedores Docker (API, DB), Repositorio de Código.
-   **Servicios:** Bases de Datos (PostgreSQL, MongoDB), Cache (Redis).

**Políticas Generales:**
-   Todo tráfico externo debe ser TLS cifrado.
-   Principio de menor privilegio en accesos a BD y API.
-   Sanitización de todas las entradas (Input Validation) para prevenir SQL Injection y XSS.

---

## 👤 PERSONA 3 – Marco Legal, Ciclo de Vida y Retención de Datos

### 4.2.1. Marco Legal
El sistema se adhiere a la **Ley N° 164 (Bolivia)** de Telecomunicaciones y TICs, respetando:
-   **Soberanía de Datos:** Prioridad en almacenamiento local o cloud compliant.
-   **Consentimiento:** Recolección de datos solo con fin explícito.
-   **Inviolabilidad:** Garantía de secreto en las comunicaciones (mensajería).

### 4.2.2. Ciclo de Vida del Dato
1.  **Recolección:** Vía API (`POST /clients`) o importación masiva.
2.  **Almacenamiento:** Cifrado en reposo (PostgreSQL Volume encryption).
3.  **Uso:** Procesamiento para campañas y reportes en memoria.
4.  **Archivo:** Datos inactivos > 1 año se mueven a almacenamiento en frío ('Cold Storage').
5.  **Eliminación:** Borrado lógico inicial, purga física tras periodo de retención legal.

### 4.2.3. Políticas de Retención
-   **Logs de Sistema:** 90 días (rotación automática).
-   **Logs de Auditoría/Seguridad:** 1 año (requerimiento regulatorio).
-   **Datos de Clientes:** Mantenidos mientras la cuenta esté activa + 5 años tras cierre (prescripción legal).
-   **Eliminación Segura:** Sobrescritura de sectores en disco para datos críticos al decomisar hardware (si aplica), o borrado criptográfico de claves.

---

## 👤 PERSONA 4 – RBAC, Auditoría y Respuesta ante Incidentes

### 4.2.4. RBAC (Control de Acceso Basado en Roles)

| Rol | Permisos Principales | Acceso |
| :--- | :--- | :--- |
| **ADMIN** | Control total (CRUD usuarios, config, reportes). | Full |
| **OPERADOR** | Gestión diaria (CRUD clientes, campañas). No puede borrar usuarios admin ni logs. | Limitado |
| **VISOR** | Solo lectura de reportes y dashboards. | Lectura |
| **CLIENTE** | Acceso a sus propios datos (Autogestión). | Propio |

### 4.2.5. Auditoría
Se utiliza un middleware (`loggerMiddleware`) para registrar cada petición de cambio de estado (POST, PUT, DELETE).
-   **¿Qué se guarda?:** `Timestamp`, `User ID`, `IP`, `Endpoint`, `Payload` (sin contraseñas).
-   **Almacenamiento:** Archivos rotativos (`combined.log`) y base de datos de auditoría.

### 4.2.6. Threat Model (Modelo de Amenazas)
Basado en **STRIDE**:
-   **Spoofing:** Mitigado por JWT fuerte y rotación de claves.
-   **Tampering:** Integridad verificada por TLS y checksums en despliegues.
-   **Information Disclosure:** Respuestas de error genéricas (no stacktraces en prod).
-   **Denial of Service:** Rate Limiting por IP (`apiLimiter`) y Redis.

### 4.2.7. Respuesta ante Incidentes
**Playbook Básico:**
1.  **Detección:** Alerta de Monitoring (CPU spike, Fail logins).
2.  **Contención:** Bloqueo de IP en Firewall/Load Balancer. Revocación de tokens afectados.
3.  **Mitigación:** Parcheo de vulnerabilidad o rollback de versión.
4.  **Reporte:** Notificación a stakeholders y autoridad regulatoria (si aplica) en < 72h.

---

## 👤 PERSONA 5 – Requisitos No Funcionales (NFR)

### 4.3. SLO/SLA y Métricas

**SLA (Acuerdo de Nivel de Servicio):**
-   **Disponibilidad:** 99.0% (Mantenimiento programado no penaliza).
-   **Tiempo de Respuesta API:** < 300ms (para el 95% de los requests - p95).

**Escalabilidad:**
-   **Horizontal:** El sistema soporta múltiples instancias de `clients-service` detrás de un balanceador de carga (Nginx/K8s Ingress), compartiendo estado vía Redis.
-   **Vertical:** Optimizado para correr en instancias de 1vCPU/2GB RAM mínimo.

**Límites (Rate Limiting):**
-   **Público:** 10 req/min por IP (login).
-   **Autenticado:** 100 req/min por Usuario.
-   **Bulk:** Procesamiento por colas (BullMQ/Redis) para evitar saturación en cargas masivas.

---

## 👤 PERSONA 6 – Testing, QA y DevOps

### 5.1. Estrategia de Pruebas
-   **Unitarias:** Jest para lógica de negocio y validadores. (`npm test` en CI).
-   **Integración:** Supertest + Base de datos de prueba en Docker (Postgres efímero). Valida flujos completos API.
-   **E2E:** Pruebas de flujo crítico (Login -> Crear Cliente -> Ver Dashboard).

### 5.2. DevOps y CI/CD
**Pipeline (GitHub Actions):**
1.  **Trigger:** Push a `main` o PR.
2.  **Build:** Instalación de dependencias y compilación TypeScript.
3.  **Test:** Ejecución de suite Jest con servicios (Redis/Postgres) vía Docker Service Containers.
4.  **Lint:** Verificación de estilo de código (ESLint).
5.  **Deploy (Manual/Auto):** Construcción de imagen Docker y push a Registry.

**Infraestructura:**
-   **Contenerización:** `Dockerfile` multi-stage (build -> production).
-   **Orquestación:** `docker-compose` para entornos locales/dev. Kubernetes (manifiestos) para producción.

---

## 👤 PERSONA 7 – Monitoreo, Métricas y Manuales

### 5.3. Monitoreo
-   **Técnico:** Prometheus scrapea endpoint `/metrics` (si habilitado) o logs de contenedores.
-   **Visualización:** Grafana para dashboards de:
    -   Uptime de servicios.
    -   Tasa de errores 4xx/5xx.
    -   Latencia de DB.

### 5.4. Documentación Operativa
-   **Manual de Usuario:** Ubicado en `docs/manuals/USER_MANUAL.md`. Contiene guías paso a paso para operadores.
-   **Manual Técnico:** Ubicado en `docs/manuals/QUICKSTART_DEV.md`. Guía de instalación y configuración de entorno de desarrollo.
-   **Manual de Despliegue:** Instrucciones en `README.md` y `docker-compose.yml` para levantar la infraestructura.

---

## 👤 PERSONA 8 – Roadmap, Gobernanza y Conclusiones

### 5.5. Gobernanza y Roadmap

**Política de Versiones:** Semantic Versioning (SemVer 2.0.0).

**Roadmap (Resumen):**
-   **Fase 1 (Actual):** Estabilización de Microservicios y Multi-operador.
-   **Fase 2 (Q2 2024):** Inteligencia de Negocio (Dashboards avanzados).
-   **Fase 3 (Q3 2024):** Integración WhatsApp API y expansión a segundo operador.

### 6. Conclusiones y Trabajo Futuro
El sistema ha migrado exitosamente de una arquitectura monolítica a microservicios, mejorando la escalabilidad y mantenibilidad. La implementación de estándares de seguridad (JWT, RBAC) robustece la plataforma para uso empresarial.

**Trabajo Futuro:**
-   Mejorar la cobertura de pruebas E2E.
-   Implementar tracing distribuido (OpenTelemetry) para mejor observabilidad entre microservicios.
-   Certificación formal de seguridad.

---
*Generado automáticamente por el Asistente de IA del Proyecto - 2025*
