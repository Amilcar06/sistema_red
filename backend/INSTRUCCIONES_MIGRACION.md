# Instrucciones para Aplicar Cambios en Español

## ⚠️ IMPORTANTE: Pasos a Seguir

Una vez que hayas verificado todos los cambios, debes ejecutar las siguientes acciones:

### 1. Instalar Dependencias (si aún no lo has hecho)

```bash
cd backend
npm install
```

### 2. Regenerar Cliente Prisma

El cliente Prisma necesita regenerarse para reflejar los cambios en el schema:

```bash
npm run prisma:generate
```

Esto generará el cliente Prisma con los nuevos nombres en español.

### 3. Crear y Ejecutar Migraciones

**IMPORTANTE**: Si ya tienes una base de datos con datos existentes, necesitas crear una migración que:
- Renombre las tablas
- Renombre las columnas
- Actualice los enums

```bash
# Crear nueva migración
npm run prisma:migrate -- --name cambiar_nombres_a_espanol

# O si prefieres resetear la BD (¡CUIDADO: BORRA TODOS LOS DATOS!)
# npm run prisma:migrate reset
```

### 4. Verificar Compilación

```bash
npm run build
```

### 5. Probar el Servidor

```bash
npm run dev
```

## 🔍 Verificación

Para verificar que todo está correcto, puedes:

1. **Revisar el schema generado**:
   ```bash
   npm run prisma:studio
   ```
   Las tablas deben aparecer con nombres en español.

2. **Probar un endpoint**:
   ```bash
   curl http://localhost:3001/health
   ```

3. **Probar registro de usuario**:
   ```bash
   curl -X POST http://localhost:3001/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "correo": "admin@example.com",
       "contrasena": "password123",
       "nombre": "Admin",
       "rol": "ADMIN"
     }'
   ```

## 📝 Notas sobre Migraciones

Si tienes datos existentes en la base de datos, la migración puede ser compleja. Considera:

1. **Hacer backup de la BD antes de migrar**
2. **Crear un script de migración personalizado** si es necesario
3. **O empezar con una BD limpia** si es un proyecto nuevo

## ✅ Checklist Final

- [ ] Dependencias instaladas (`npm install`)
- [ ] Cliente Prisma regenerado (`npm run prisma:generate`)
- [ ] Migraciones ejecutadas (`npm run prisma:migrate`)
- [ ] Proyecto compila sin errores (`npm run build`)
- [ ] Servidor inicia correctamente (`npm run dev`)
- [ ] Endpoints responden correctamente
- [ ] Frontend actualizado para usar nombres en español (pendiente)

---

**Una vez completados estos pasos, el backend estará completamente funcional con nombres en español.**

