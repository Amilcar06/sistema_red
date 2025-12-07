# Gobernanza y Roadmap

Plan de evolución y políticas de mantenimiento del producto.

## 1. Política de Versiones
Seguimos **Semantic Versioning (SemVer 2.0)**: `MAJOR.MINOR.PATCH`.

*   **MAJOR**: Cambios incompatibles de API.
*   **MINOR**: Nuevas funcionalidades retro-compatibles.
*   **PATCH**: Corrección de bugs retro-compatibles.

## 2. Roadmap (Ejemplo 2024-2025)

### Q1 2024: Estabilización y Multi-Operador
- [x] Refactorización a Microservicios.
- [ ] Implementación de capa de adaptadores (Interfaces SMS/Billing).
- [ ] Auditoría de Seguridad inicial.

### Q2 2024: Inteligencia de Negocio
- [ ] Dashboards avanzados en Power BI.
- [ ] Motor de recomendaciones de promociones basado en ML.

### Q3 2024: Expansión
- [ ] Integración con WhatsApp Business API nativa.
- [ ] Onboarding de segundo operador (Piloto).

## 3. Gobernanza del Código
*   **Code Review**: Todo cambio requiere aprobación de 1 senior dev.
*   **RFC**: Cambios arquitectónicos mayores requieren un "Request for Comments" escrito.
*   **Ownership**:
    *   `clients-service`: Equipo Core.
    *   `promotions-service`: Equipo Marketing Tech.
