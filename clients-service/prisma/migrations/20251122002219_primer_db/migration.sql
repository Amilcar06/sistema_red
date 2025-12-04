-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'OPERADOR', 'VISOR');

-- CreateEnum
CREATE TYPE "EstadoCliente" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "TipoDescuento" AS ENUM ('PORCENTAJE', 'MONTO_FIJO', 'GRATIS');

-- CreateEnum
CREATE TYPE "EstadoPromocion" AS ENUM ('BORRADOR', 'ACTIVA', 'PAUSADA', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoClientePromocion" AS ENUM ('PENDIENTE', 'ENVIADA', 'CONVERTIDA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoRegla" AS ENUM ('ELEGIBILIDAD', 'DESCUENTO', 'NOTIFICACION', 'PROGRAMACION');

-- CreateEnum
CREATE TYPE "CanalNotificacion" AS ENUM ('SMS', 'WHATSAPP', 'CORREO');

-- CreateEnum
CREATE TYPE "EstadoNotificacion" AS ENUM ('PENDIENTE', 'EN_COLA', 'ENVIADA', 'ENTREGADA', 'FALLIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoReporte" AS ENUM ('ESTADISTICAS_CLIENTES', 'RENDIMIENTO_PROMOCIONES', 'HISTORIAL_NOTIFICACIONES', 'TASA_CONVERSION', 'ANALISIS_INGRESOS');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'ADMIN',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT,
    "plan" TEXT NOT NULL,
    "estado" "EstadoCliente" NOT NULL DEFAULT 'ACTIVO',
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaUltimaActividad" TIMESTAMP(3),
    "metadata" JSONB,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promociones" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoDescuento" "TipoDescuento" NOT NULL,
    "valorDescuento" DECIMAL(10,2) NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoPromocion" NOT NULL DEFAULT 'BORRADOR',
    "segmentoObjetivo" TEXT,
    "plantillaMensaje" TEXT,
    "totalEnviados" INTEGER NOT NULL DEFAULT 0,
    "totalConvertidos" INTEGER NOT NULL DEFAULT 0,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promociones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promocion_productos" (
    "id" TEXT NOT NULL,
    "promocionId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promocion_productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_promociones" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "promocionId" TEXT NOT NULL,
    "estado" "EstadoClientePromocion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaConversion" TIMESTAMP(3),
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cliente_promociones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reglas_negocio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoRegla" "TipoRegla" NOT NULL,
    "condiciones" JSONB NOT NULL,
    "acciones" JSONB NOT NULL,
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reglas_negocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promocion_reglas" (
    "id" TEXT NOT NULL,
    "promocionId" TEXT NOT NULL,
    "reglaId" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promocion_reglas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "promocionId" TEXT,
    "canal" "CanalNotificacion" NOT NULL,
    "estado" "EstadoNotificacion" NOT NULL DEFAULT 'PENDIENTE',
    "titulo" TEXT,
    "mensaje" TEXT NOT NULL,
    "metadata" JSONB,
    "fechaEnviado" TIMESTAMP(3),
    "fechaEntregado" TIMESTAMP(3),
    "fechaLeido" TIMESTAMP(3),
    "fechaFallido" TIMESTAMP(3),
    "mensajeError" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuraciones_sistema" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,
    "categoria" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuraciones_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes" (
    "id" TEXT NOT NULL,
    "tipo" "TipoReporte" NOT NULL,
    "parametros" JSONB NOT NULL,
    "datos" JSONB,
    "fechaGeneracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generadoPor" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE INDEX "clientes_telefono_idx" ON "clientes"("telefono");

-- CreateIndex
CREATE INDEX "clientes_correo_idx" ON "clientes"("correo");

-- CreateIndex
CREATE INDEX "clientes_estado_idx" ON "clientes"("estado");

-- CreateIndex
CREATE INDEX "promociones_estado_idx" ON "promociones"("estado");

-- CreateIndex
CREATE INDEX "promociones_fechaInicio_fechaFin_idx" ON "promociones"("fechaInicio", "fechaFin");

-- CreateIndex
CREATE UNIQUE INDEX "promocion_productos_promocionId_productoId_key" ON "promocion_productos"("promocionId", "productoId");

-- CreateIndex
CREATE INDEX "cliente_promociones_estado_idx" ON "cliente_promociones"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_promociones_clienteId_promocionId_key" ON "cliente_promociones"("clienteId", "promocionId");

-- CreateIndex
CREATE UNIQUE INDEX "promocion_reglas_promocionId_reglaId_key" ON "promocion_reglas"("promocionId", "reglaId");

-- CreateIndex
CREATE INDEX "notificaciones_estado_idx" ON "notificaciones"("estado");

-- CreateIndex
CREATE INDEX "notificaciones_canal_idx" ON "notificaciones"("canal");

-- CreateIndex
CREATE INDEX "notificaciones_clienteId_idx" ON "notificaciones"("clienteId");

-- CreateIndex
CREATE INDEX "notificaciones_fechaCreacion_idx" ON "notificaciones"("fechaCreacion");

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_sistema_clave_key" ON "configuraciones_sistema"("clave");

-- CreateIndex
CREATE INDEX "reportes_tipo_idx" ON "reportes"("tipo");

-- CreateIndex
CREATE INDEX "reportes_fechaGeneracion_idx" ON "reportes"("fechaGeneracion");

-- AddForeignKey
ALTER TABLE "promocion_productos" ADD CONSTRAINT "promocion_productos_promocionId_fkey" FOREIGN KEY ("promocionId") REFERENCES "promociones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promocion_productos" ADD CONSTRAINT "promocion_productos_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_promociones" ADD CONSTRAINT "cliente_promociones_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_promociones" ADD CONSTRAINT "cliente_promociones_promocionId_fkey" FOREIGN KEY ("promocionId") REFERENCES "promociones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promocion_reglas" ADD CONSTRAINT "promocion_reglas_promocionId_fkey" FOREIGN KEY ("promocionId") REFERENCES "promociones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promocion_reglas" ADD CONSTRAINT "promocion_reglas_reglaId_fkey" FOREIGN KEY ("reglaId") REFERENCES "reglas_negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_promocionId_fkey" FOREIGN KEY ("promocionId") REFERENCES "promociones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
