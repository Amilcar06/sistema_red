import prisma from '../config/database';
import { AppError } from '../utils/errors';
import twilioService from './integrations/twilio.service';
import emailService from './integrations/email.service';
import Bull, { Queue, Job } from 'bull';
import redisConfig from '../config/redis';

interface SendNotificationData {
  clientId?: string;
  promotionId?: string;
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'CORREO';
  title?: string;
  message: string;
  recipient?: string; // Para envíos sin cliente registrado
}

class NotificationService {
  private notificationQueue: Bull.Queue;

  constructor() {
    this.notificationQueue = new Bull('notifications', {
      redis: redisConfig,
    });
  }

  async send(data: SendNotificationData) {
    // Crear registro de notificación
    const canal = data.channel === 'EMAIL' ? 'CORREO' : data.channel;
    const notificacion = await prisma.notificacion.create({
      data: {
        clienteId: data.clientId,
        promocionId: data.promotionId,
        canal: canal as any,
        titulo: data.title,
        mensaje: data.message,
        estado: 'EN_COLA',
      },
    });

    // Agregar a cola para procesamiento asíncrono
    await this.notificationQueue.add('send', {
      notificationId: notificacion.id,
      ...data,
    });

    return notificacion;
  }

  async processNotification(job: Job) {
    const { notificationId, channel, message, recipient, clientId, title } = job.data;

    try {
      // Obtener datos del cliente si existe
      let phone: string | undefined;
      let email: string | undefined;

      if (clientId) {
        const cliente = await prisma.cliente.findUnique({
          where: { id: clientId },
        });
        phone = cliente?.telefono;
        email = cliente?.correo || undefined;
      }

      // Enviar según el canal
      let result: any;

      switch (channel) {
        case 'SMS':
          if (!phone && !recipient) {
            throw new Error('Número de teléfono requerido');
          }
          result = await twilioService.sendSMS(phone || recipient!, message);
          break;

        case 'EMAIL':
        case 'CORREO':
          if (!email && !recipient) {
            throw new Error('Email requerido');
          }
          result = await emailService.sendEmail(
            email || recipient!,
            title || 'Promoción Especial',
            message
          );
          break;

        case 'WHATSAPP':
          // Implementar integración WhatsApp
          throw new Error('WhatsApp no implementado aún');

        default:
          throw new Error(`Canal no soportado: ${channel}`);
      }

      // Actualizar notificación como enviada
      await prisma.notificacion.update({
        where: { id: notificationId },
        data: {
          estado: 'ENVIADA',
          fechaEnviado: new Date(),
          metadata: result,
        },
      });

      // Actualizar contadores de promoción si existe
      if (job.data.promotionId) {
        await prisma.promocion.update({
          where: { id: job.data.promotionId },
          data: {
            totalEnviados: { increment: 1 },
          },
        });
      }

      return result;
    } catch (error: any) {
      // Marcar como fallida
      await prisma.notificacion.update({
        where: { id: notificationId },
        data: {
          estado: 'FALLIDA',
          fechaFallido: new Date(),
          mensajeError: error.message,
        },
      });

      throw error;
    }
  }

  async sendBulk(
    promocionId: string,
    canal: 'SMS' | 'WHATSAPP' | 'EMAIL',
    plantillaMensaje: string
  ) {
    const promocion = await prisma.promocion.findUnique({
      where: { id: promocionId },
      include: {
        clientes: {
          include: {
            cliente: true,
          },
        },
      },
    });

    if (!promocion) {
      throw new AppError('Promoción no encontrada', 404);
    }

    const notificaciones = [];

    for (const clientePromocion of promocion.clientes) {
      const cliente = clientePromocion.cliente;
      
      // Personalizar mensaje
      let mensajePersonalizado = plantillaMensaje || promocion.plantillaMensaje || '';
      mensajePersonalizado = mensajePersonalizado
        .replace(/{nombre}/g, cliente.nombre)
        .replace(/{plan}/g, cliente.plan);

      const notificacion = await this.send({
        clientId: cliente.id,
        promotionId: promocionId,
        channel: canal,
        message: mensajePersonalizado,
      });

      notificaciones.push(notificacion);
    }

    return notificaciones;
  }

  async getHistory(filters: any = {}) {
    const { canal, estado, clienteId, pagina = 1, limite = 20 } = filters;
    // Convertir a números ya que los query params vienen como strings
    const paginaNum = typeof pagina === 'string' ? parseInt(pagina, 10) : pagina;
    const limiteNum = typeof limite === 'string' ? parseInt(limite, 10) : limite;
    const skip = (paginaNum - 1) * limiteNum;
    const where: any = {};

    if (canal) {
      where.canal = canal === 'EMAIL' ? 'CORREO' : canal;
    }

    if (estado) {
      where.estado = estado;
    }

    if (clienteId) {
      where.clienteId = clienteId;
    }

    const [notificaciones, total] = await Promise.all([
      prisma.notificacion.findMany({
        where,
        skip,
        take: limiteNum,
        include: {
          cliente: true,
          promocion: true,
        },
        orderBy: { fechaCreacion: 'desc' },
      }),
      prisma.notificacion.count({ where }),
    ]);

    return {
      datos: notificaciones,
      paginacion: {
        pagina: paginaNum,
        limite: limiteNum,
        total,
        totalPaginas: Math.ceil(total / limiteNum),
      },
    };
  }
}

export default new NotificationService();

