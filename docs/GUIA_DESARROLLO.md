# Guía de Desarrollo - Sistema de Promoción de Servicios

Esta guía está enfocada en los estándares de código, flujos de trabajo y estrategias de testing avanzadas. Para la configuración inicial del entorno, por favor consulta el [README principal](../README.md).

---

## 📝 Estándares de Código

### Backend (Microservicios)

- **Arquitectura**: Respetar estrictamente la separación de capas:
  - `routes`: Solo definición de endpoints y validación de entrada.
  - `controllers`: Orquestación de la petición HTTP.
  - `services`: Lógica de negocio pura (reutilizable).
- **Async/Await**: Usar siempre para operaciones asíncronas. Evitar callbacks.
- **Manejo de Errores**: Usar clases de error personalizadas (`AppError`) y pasarlas al middleware global (`next(err)`).
- **Logs**: Usar librerías de logging estructurado (Winston/Pino). `console.log` está prohibido en producción.

### Frontend (React)

- **Hooks**: Priorizar componentes funcionales y hooks personalizados para lógica compleja.
- **Estilos**: Usar **Tailwind CSS** para todo el estilizado. Evitar archivos `.css` separados a menos que sea estrictamente necesario.
- **Tipado**: TypeScript en modo estricto. Evitar `any` a toda costa; definir interfaces para todas las props y respuestas de API.

---

## 🔄 Flujo de Trabajo Git

Utilizamos **Gitflow** simplificado:

1.  **`main`**: Código de producción. Intocable directamente.
2.  **`develop`**: Rama de integración principal.
3.  **`feature/nombre-feature`**: Ramas temporales para nuevas funcionalidades.
4.  **`fix/nombre-bug`**: Ramas para corrección de errores.

**Proceso de Contribución:**
1.  Crear rama desde `develop`: `git checkout -b feature/nueva-funcionalidad`.
2.  Commit frecuentes y descriptivos (Conventional Commits recomendado: `feat: add user login`).
3.  Push a la rama.
4.  Crear Pull Request (PR) hacia `develop`.
5.  Revisión de código (Code Review) obligatoria.
6.  Merge a `develop` (Squash & Merge recomendado).

---

## 🧪 Estrategia de Testing Avanzada

### Unit Tests (Jest)
- Deben cubrir el 100% de la lógica de negocio en `services/`.
- Usar Mocks para todas las dependencias externas (DB, APIs, otros servicios).

### Integration Tests
- Pruebas de endpoints en `routes/`.
- Usar una base de datos de prueba (Dockerizada) que se limpie entre tests.
- Validar códigos de estado HTTP y estructura del body.

### E2E Tests (Opcional)
- Cypress o Playwright para flujos críticos del Frontend.

---

## 🐛 Debugging y Solución de Problemas

- **Error de conexión a DB**: Verifica que los contenedores de Docker estén sanos (`docker ps`).
- **CORS Error**: Si el frontend no conecta, verifica la whitelist en `api-gateway/src/index.ts`.
- **Redis**: Si las notificaciones no salen, revisa la conexión a Redis y los logs del worker en `notifications-service`.
