import { z } from 'zod';

// Auth validators
export const registerSchema = z.object({
  body: z.object({
    correo: z.string().email('Correo inválido'),
    contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    rol: z.enum(['ADMIN', 'OPERADOR', 'VISOR']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    correo: z.string().email('Correo inválido'),
    contrasena: z.string().min(1, 'La contraseña es requerida'),
  }),
});

// Client validators
export const createClientSchema = z.object({
  body: z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    telefono: z.string().min(8, 'El teléfono debe tener al menos 8 caracteres'),
    correo: z.string().email('Correo inválido').optional().or(z.literal('')),
    plan: z.string().min(1, 'El plan es requerido'),
    estado: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']).optional(),
  }),
});

export const updateClientSchema = z.object({
  body: z.object({
    nombre: z.string().min(2).optional(),
    telefono: z.string().min(8).optional(),
    correo: z.string().email().optional().or(z.literal('')),
    plan: z.string().optional(),
    estado: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']).optional(),
  }),
});

// Product validators
export const createProductSchema = z.object({
  body: z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    descripcion: z.string().optional(),
    categoria: z.string().min(1, 'La categoría es requerida'),
    precio: z.number().positive('El precio debe ser positivo'),
    activo: z.boolean().optional(),
  }),
});

// Promotion validators
export const createPromotionSchema = z.object({
  body: z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    descripcion: z.string().optional(),
    tipoDescuento: z.enum(['PORCENTAJE', 'MONTO_FIJO', 'GRATIS']),
    valorDescuento: z.number().nonnegative('El valor del descuento debe ser positivo'),
    fechaInicio: z.string().datetime().or(z.date()),
    fechaFin: z.string().datetime().or(z.date()),
    segmentoObjetivo: z.string().optional(),
    plantillaMensaje: z.string().optional(),
    productoIds: z.array(z.string().uuid()).optional(),
  }).refine((data) => {
    const fechaInicio = new Date(data.fechaInicio);
    const fechaFin = new Date(data.fechaFin);
    return fechaFin > fechaInicio;
  }, {
    message: 'La fecha de fin debe ser posterior a la de inicio',
    path: ['fechaFin'],
  }),
});

// Notification validators
export const sendNotificationSchema = z.object({
  body: z.object({
    clienteId: z.string().uuid().optional(),
    promocionId: z.string().uuid().optional(),
    canal: z.enum(['SMS', 'WHATSAPP', 'EMAIL']),
    titulo: z.string().optional(),
    mensaje: z.string().min(1, 'El mensaje es requerido'),
    destinatario: z.string().optional(),
  }),
});

// Rule validators
export const createRuleSchema = z.object({
  body: z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    descripcion: z.string().optional(),
    tipoRegla: z.enum(['ELEGIBILIDAD', 'DESCUENTO', 'NOTIFICACION', 'PROGRAMACION']),
    condiciones: z.any(),
    acciones: z.any(),
    prioridad: z.number().int().optional(),
  }),
});

