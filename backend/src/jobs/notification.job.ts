import Bull, { Queue, Job } from 'bull';
import notificationService from '../services/notification.service';
import redisConfig from '../config/redis';
import { logger } from '../utils/logger';

const notificationQueue = new Bull('notifications', {
  redis: redisConfig,
});

notificationQueue.process(5, async (job: Job) => {
  return await notificationService.processNotification(job);
});

notificationQueue.on('completed', (job: Job) => {
  logger.info(`Notificación ${job.id} completada`);
});

notificationQueue.on('failed', (job: Job | undefined, err: Error) => {
  if (job) {
    logger.error(`Notificación ${job.id} falló:`, err);
  } else {
    logger.error('Error en procesamiento de notificación:', err);
  }
});

export { notificationQueue };

