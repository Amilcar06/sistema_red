# Plan de Pruebas (Test Plan)

Estrategia integral de aseguramiento de calidad (QA) para el Sistema de Promoción de Servicios.

## 1. Pirámide de Pruebas

### Pruebas Unitarias (Nivel Código)
*   **Objetivo**: Validar lógica de negocio aislada.
*   **Herramienta**: Jest.
*   **Cobertura Objetivo**: >80% en servicios y utilidades.
*   **Ejecución**: En cada commit (pre-commit hook) y CI.

### Pruebas de Integración (Nivel API)
*   **Objetivo**: Verificar comunicación entre módulos y base de datos.
*   **Herramienta**: Supertest + Jest.
*   **Enfoque**: Probar endpoints HTTP usando una BD de pruebas en memoria o dockerizada.
*   **Ejecución**: En Pull Requests.

### Pruebas E2E (Nivel Sistema)
*   **Objetivo**: Simular flujos de usuario completos.
*   **Herramienta**: Playwright o Cypress.
*   **Escenarios Clave**:
    1.  Login de Operador.
    2.  Creación de una Promoción.
    3.  Segmentación de usuarios.
    4.  Simulación de envío (verificación de logs/historial).

## 2. Pruebas No Funcionales

### Pruebas de Carga y Estrés
*   **Herramienta**: k6 o JMeter.
*   **Escenario Crítico**: Envío masivo de notificaciones (Burst).
*   **Métricas Objetivo**:
    *   Latencia p95 < 500ms API rest.
    *   Procesamiento de notificaciones > 1000/segundo.
    *   Tasa de error < 1%.

### Pruebas de Seguridad (SAST/DAST)
*   **Análisis Estático**: SonarQube (detectar vulnerabilidades de código).
*   **Análisis Dinámico**: OWASP ZAP (scan de endpoints activos).
*   **Dependencias**: `npm audit` en el pipeline.

## 3. Estrategia de Datos de Prueba (TDM)

*   **Seeds**: Scripts para poblar la BD con datos maestros (planes, roles).
*   **Factories**: Generadores de datos aleatorios para clientes y transacciones (faker.js).
*   **Sanitization**: NUNCA usar datos productivos reales en entornos de test sin anonimizar.

## 4. Pipeline de Calidad (CI Gate)

El despliegue a Staging/Prod debe bloquearse si:
*   Falla cualquier prueba unitaria o de integración.
*   La cobertura de código baja del umbral definido.
*   Se detectan vulnerabilidades críticas.
