import * as admin from 'firebase-admin';
import path from 'path';
import { logger } from '../../utils/logger';

class FirebaseService {
    private initialized = false;

    constructor() {
        this.initialize();
    }

    private initialize() {
        try {
            const serviceAccountPath = path.join(
                __dirname,
                '../../config/firebase-service-account.json'
            );

            // Verificar si el archivo existe antes de intentar requerirlo
            // En producción, esto podría venir de variables de entorno

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const serviceAccount = require(serviceAccountPath);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });

            this.initialized = true;
            logger.info('Firebase Admin SDK initialized successfully');
        } catch (error) {
            logger.error('Error initializing Firebase Admin SDK:', error);
            this.initialized = false;
        }
    }

    /**
     * Envía una notificación push a un token de dispositivo específico
     */
    async sendPushNotification(token: string, title: string, body: string, data?: any) {
        if (!this.initialized) {
            logger.warn('Firebase not initialized. Skipping push notification.');
            return false;
        }

        try {
            const message: admin.messaging.Message = {
                notification: {
                    title,
                    body,
                },
                data: data ? this.formatData(data) : {},
                token,
            };

            const response = await admin.messaging().send(message);
            logger.info(`Push notification sent successfully: ${response}`);
            return true;
        } catch (error) {
            logger.error('Error sending push notification:', error);
            return false;
        }
    }

    /**
     * Formatea los datos para que sean strings (requerido por FCM data payload)
     */
    private formatData(data: any): { [key: string]: string } {
        const formatted: { [key: string]: string } = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                formatted[key] = String(data[key]);
            }
        }
        return formatted;
    }
}

export default new FirebaseService();
