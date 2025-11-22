# Seed Educativo: Datos Inspirados en Entel Bolivia

## ⚠️ DISCLAIMER IMPORTANTE

Este seed contiene **datos completamente ficticios** creados únicamente para:
- ✅ **Fines educativos** y de demostración del sistema
- ✅ **Aprendizaje** sobre gestión de promociones
- ✅ **Pruebas** del sistema sin fines lucrativos

**NO está asociado oficialmente con Entel Bolivia** y no tiene fines comerciales.

Los datos están inspirados en información pública sobre planes y promociones de Entel, pero todos los nombres, números de teléfono y correos son **completamente ficticios**.

---

## 📦 Datos Incluidos en el Seed

### 1. Usuarios Administrativos

- **Admin**: `admin@entel-educativo.bo` / `admin123`
- **Operador**: `operador@entel-educativo.bo` / `operador123`

### 2. Productos (14 productos educativos)

#### Postpago 4G (5 productos)
- Paquete 4G POST - 10 (Bs 10)
- Paquete 4G POST - 20 (Bs 20)
- Paquete 4G POST - 50 (Bs 50)
- Paquete 4G POST - 80 (Bs 80)
- Paquete 4G POST - 100 (Bs 100)

#### Prepago (5 productos)
- PaqueGanes 5 (Bs 5)
- PaqueGanes Ilimitado 10 (Bs 10)
- Paquete Ilimitado 6hrs (Bs 4)
- Paquete Ilimitado 12hrs (Bs 6)
- Paquete Ilimitado 2 días (Bs 15)

#### Fibra (4 productos)
- Fibra 15 (Bs 99)
- Fibra 30 (Bs 149)
- Fibra 65 (Bs 219)
- Fibra 105 (Bs 340)

### 3. Clientes (30 clientes ficticios)

- Nombres comunes en Bolivia (La Paz)
- Números de teléfono ficticios (formato Bolivia: +591 700/710/720)
- Correos ficticios
- Planes asignados aleatoriamente
- Estados: ACTIVO (80%) / INACTIVO (20%)
- Fechas de registro variadas (último año)

### 4. Promociones (5 promociones educativas)

#### 1. Doble Saldo Navidad 2024
- **Tipo**: Porcentaje (100% = doble saldo)
- **Segmento**: Clientes prepago
- **Estado**: ACTIVA
- **Productos**: Todos los planes prepago
- **Mensaje**: Promoción navideña con doble saldo

#### 2. PaqueGanes+ Sorteo Navidad
- **Tipo**: Gratis (participación en sorteo)
- **Segmento**: Clientes prepago básico/medio
- **Estado**: ACTIVA
- **Productos**: PaqueGanes 5 y 10
- **Mensaje**: Participación automática en sorteo

#### 3. 25% OFF Planes Postpago
- **Tipo**: Porcentaje (25% descuento)
- **Segmento**: Todos los planes postpago
- **Estado**: ACTIVA
- **Productos**: Todos los planes postpago
- **Mensaje**: Descuento por 3 meses

#### 4. Paquete Especial Bicentenario
- **Tipo**: Monto fijo (Bs 99)
- **Segmento**: Clientes prepago
- **Estado**: ACTIVA
- **Productos**: Prepago
- **Mensaje**: 15.000 MB por Bs 99 válido 7 días

#### 5. Migra a Fibra - 30% OFF Primer Mes
- **Tipo**: Porcentaje (30% descuento)
- **Segmento**: Todos los clientes activos
- **Estado**: PAUSADA (ejemplo)
- **Productos**: Todos los planes Fibra
- **Mensaje**: Promoción de migración

### 5. Notificaciones (20 notificaciones de ejemplo)

- Historial de mensajes enviados
- Variedad de canales (SMS, Email)
- Diferentes estados (ENVIADA, ENTREGADA, FALLIDA)
- Fechas distribuidas en los últimos 30 días

### 6. Conversiones (8 conversiones de ejemplo)

- Clientes que han convertido en promociones
- Estados: CONVERTIDA
- Fechas de conversión variadas

---

## 🚀 Cómo Ejecutar el Seed

### Opción 1: Seed Educativo Completo (Recomendado)

```bash
cd backend
npm run prisma:seed:entel
```

Este comando:
- ✅ Crea usuarios administrativos
- ✅ Crea 14 productos (planes educativos)
- ✅ Crea 30 clientes ficticios
- ✅ Crea 5 promociones educativas
- ✅ Crea 20 notificaciones de ejemplo
- ✅ Crea 8 conversiones de ejemplo

### Opción 2: Seed Básico (Solo usuarios)

```bash
cd backend
npm run prisma:seed
```

Este comando solo crea usuarios admin y operador básicos.

---

## 📊 Resumen de Datos Creados

Después de ejecutar `npm run prisma:seed:entel`:

```
👤 Usuarios: 2
👥 Clientes: 30 (ficticios)
📦 Productos: 14 (planes educativos)
🎁 Promociones: 5 (inspiradas en Entel)
📬 Notificaciones: 20 (historial de ejemplo)
✅ Conversiones: 8 (ejemplo)
```

---

## 🔍 Ejemplos de Uso Educativo

### 1. Ver Promociones Activas

En el frontend:
- Navega a "Promociones"
- Verás 4 promociones activas (1 está pausada)
- Puedes activar la promoción de Fibra si quieres

### 2. Ver Clientes Segmentados

En el frontend:
- Navega a "Clientes"
- Filtra por plan (POSTPAGO, PREPAGO, FIBRA)
- Verás clientes con diferentes planes asignados

### 3. Enviar Promoción Masiva

En el frontend:
- Navega a "Mensajes"
- Selecciona una promoción
- Envía mensajes a todos los clientes elegibles

### 4. Ver Estadísticas

En el frontend:
- Dashboard muestra estadísticas en tiempo real
- Reportes muestran conversiones y efectividad
- Gráficos visualizan datos por canal

---

## 🎯 Planes Educativos Incluidos

### Postpago
```
POSTPAGO-4G-10    → Paquete 4G POST - 10
POSTPAGO-4G-20    → Paquete 4G POST - 20
POSTPAGO-4G-50    → Paquete 4G POST - 50
POSTPAGO-4G-80    → Paquete 4G POST - 80
POSTPAGO-4G-100   → Paquete 4G POST - 100
```

### Prepago
```
PREPAGO-BASICO    → Clientes con planes básicos
PREPAGO-MEDIO     → Clientes con planes medios
PREPAGO-PREMIUM   → Clientes con planes premium
```

### Fibra
```
FIBRA-15  → Internet Fibra 15 Mbps
FIBRA-30  → Internet Fibra 30 Mbps
FIBRA-65  → Internet Fibra 65 Mbps
FIBRA-105 → Internet Fibra 105 Mbps
FIBRA-150 → Internet Fibra 150 Mbps
```

---

## 📝 Notas Importantes

1. **Todos los datos son ficticios**: Nombres, teléfonos, correos son generados aleatoriamente
2. **Solo para educación**: No usar para propósitos comerciales
3. **Inspirado en información pública**: Basado en planes y promociones públicas de Entel
4. **Puedes modificar**: El seed se puede editar para agregar más datos según necesidades
5. **Formato Bolivia**: Números de teléfono siguen formato +591 (Bolivia)

---

## 🔄 Resetear Datos

Si quieres volver a ejecutar el seed (eliminar datos anteriores):

```bash
# Opción 1: Resetear base de datos y ejecutar seed
npm run prisma:migrate reset
npm run prisma:seed:entel

# Opción 2: Solo ejecutar seed (hace upsert, no duplica)
npm run prisma:seed:entel
```

El seed usa `upsert` para evitar duplicados si ya existen datos.

---

## ✅ Verificación

Después de ejecutar el seed, verifica que todo esté correcto:

1. **Prisma Studio**:
   ```bash
   npm run prisma:studio
   ```

2. **Frontend**:
   - Inicia el frontend: `npm run dev`
   - Login con: `admin@entel-educativo.bo` / `admin123`
   - Explora las diferentes secciones

3. **Backend**:
   - Verifica que los endpoints funcionen
   - Prueba obtener clientes, promociones, etc.

---

**Fecha de creación**: Diciembre 2024  
**Propósito**: Educación y demostración del sistema  
**Licencia**: Uso educativo únicamente

