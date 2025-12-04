# Guía de Testing

## 📋 Estructura de Tests

```
tests/
├── unit/                    # Tests unitarios
│   └── services/           # Tests de servicios
│       ├── auth.service.test.ts
│       └── client.service.test.ts
├── integration/            # Tests de integración
│   └── auth.integration.test.ts
├── e2e/                    # Tests end-to-end (pendiente)
├── helpers/                # Helpers y mocks
│   └── prisma-mock.ts
└── setup.ts                # Configuración global
```

## 🚀 Ejecutar Tests

### Todos los tests
```bash
npm test
```

### Tests en modo watch (desarrollo)
```bash
npm run test:watch
```

### Tests con coverage
```bash
npm run test:coverage
```

### Solo tests unitarios
```bash
npm test -- tests/unit
```

### Solo tests de integración
```bash
npm test -- tests/integration
```

## 📝 Tests Unitarios

Los tests unitarios prueban funciones individuales en aislamiento, usando mocks de dependencias externas.

**Ejemplo**: `tests/unit/services/auth.service.test.ts`
- Mock de Prisma
- Mock de bcrypt
- Mock de jwt
- Prueba lógica de negocio sin base de datos real

## 🔗 Tests de Integración

Los tests de integración prueban flujos completos, incluyendo base de datos y servidor.

**Ejemplo**: `tests/integration/auth.integration.test.ts`
- Usa base de datos de prueba
- Prueba endpoints completos
- Verifica respuestas HTTP reales

**⚠️ Requisitos para tests de integración:**
- Base de datos de prueba configurada
- Variable de entorno `DATABASE_URL` apuntando a BD de prueba
- Servidor no debe estar corriendo en el mismo puerto

## 📊 Coverage

Para ver el reporte de coverage:

```bash
npm run test:coverage
```

Esto generará un reporte HTML en `coverage/index.html`

**Objetivo**: 80%+ de cobertura

## 🛠️ Configuración

### Variables de Entorno para Tests

Crear archivo `.env.test`:

```env
NODE_ENV=test
DATABASE_URL="postgresql://user:password@localhost:5432/test_db"
JWT_SECRET="test-jwt-secret"
JWT_REFRESH_SECRET="test-refresh-secret"
```

### Base de Datos de Prueba

Los tests de integración requieren una base de datos de prueba separada:

```bash
# Crear base de datos de prueba
createdb sistema_promocion_test

# Ejecutar migraciones en BD de prueba
DATABASE_URL="postgresql://..." npm run prisma:migrate
```

## 📋 Checklist de Tests

### Backend - Servicios
- [ ] notification.service.test.ts
- [ ] whatsapp.service.test.ts

### Backend - Endpoints (Integración)
- [ ] notification.integration.test.ts

### Backend - Middleware
- [ ] auth.middleware.test.ts
- [ ] validation.middleware.test.ts

## 🎯 Mejores Prácticas

1. **Un test = una funcionalidad**
   - Cada test debe probar una cosa específica
   - Nombres descriptivos: `debería crear cliente exitosamente`

2. **Arrange-Act-Assert**
   ```typescript
   // Arrange - Preparar datos
   const clientData = { nombre: 'Test' };
   
   // Act - Ejecutar función
   const result = await service.create(clientData);
   
   // Assert - Verificar resultado
   expect(result.nombre).toBe('Test');
   ```

3. **Limpiar después de tests**
   - Usar `beforeEach` y `afterEach` para setup/cleanup
   - Tests de integración deben limpiar datos de prueba

4. **Usar mocks apropiadamente**
   - Tests unitarios: mock todas las dependencias
   - Tests de integración: usar servicios reales

5. **Testear casos de error**
   - No solo el caso exitoso
   - Validaciones, errores de DB, permisos, etc.

## 🔍 Debugging Tests

Para debuggear tests individuales:

```bash
# Ejecutar un archivo específico
npm test -- auth.service.test.ts

# Con verbose
npm test -- --verbose auth.service.test.ts

# Solo un test específico
npm test -- -t "debería crear cliente exitosamente"
```

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

