import prisma from '../config/database';
import { AppError } from '../utils/errors';
import twilioService from './integrations/twilio.service';
import emailService from './integrations/email.service';
import whatsappService from './whatsapp.service'; // Added whatsappService import
import firebaseService from './integrations/firebase.service';
import { logger } from '../utils/logger';
import Bull, { Queue, Job } from 'bull';
import redisConfig from '../config/redis';
import NotificationLog from '../models/notification-log.model';

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
          if (!phone && !recipient) {
            throw new Error('Número de teléfono requerido para WhatsApp');
          }
          const targetPhone = phone || recipient!;
          const sent = await whatsappService.sendMessage(targetPhone, message);

          if (!sent) {
            throw new Error('Error al enviar mensaje de WhatsApp (Cliente no listo o error de red)');
          }
          result = { status: 'sent', details: 'WhatsApp message sent successfully' };
          break;

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

  async sendBatch(notifications: SendNotificationData[]) {
    const results = [];

    for (const notification of notifications) {
      try {
        // The original `send` method adds to a queue, so we'll call that.
        // The instruction's `sendNotification` is not defined, assuming `send` is intended.
        await this.send(notification);

        // Guardar log en MongoDB
        await NotificationLog.create({
          clientId: notification.clientId,
          promotionId: notification.promotionId,
          channel: notification.channel,
          status: 'QUEUED', // Changed to QUEUED as `send` adds to queue
          message: notification.message,
          metadata: {
            source: 'batch_process',
            timestamp: new Date()
          }
        });

        results.push({ ...notification, status: 'QUEUED' }); // Changed to QUEUED
      } catch (error: any) {
        logger.error(`Error queuing notification for client ${notification.clientId}:`, error); // Log queuing error

        // Guardar log de error en MongoDB
        await NotificationLog.create({
          clientId: notification.clientId,
          promotionId: notification.promotionId,
          channel: notification.channel,
          status: 'FAILED_TO_QUEUE', // Specific status for queuing failure
          message: notification.message,
          error: error.message,
          metadata: {
            source: 'batch_process',
            timestamp: new Date()
          }
        });

        results.push({ ...notification, status: 'FAILED_TO_QUEUE', error: error.message });
      }
    }

    return results;
  }

  async getHistory(filters: any = {}) {
    const { canal, estado, clienteId, search, pagina = 1, limite = 20 } = filters;
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

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { mensaje: { contains: search, mode: 'insensitive' } },
      ];
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

