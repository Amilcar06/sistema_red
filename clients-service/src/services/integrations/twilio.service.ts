import twilio from 'twilio';
import { logger } from '../../utils/logger';

class TwilioService {
  private client: twilio.Twilio | null = null;

  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  async sendSMS(to: string, message: string) {
    if (!this.client) {
      throw new Error('Twilio no está configurado. Verifica las variables de entorno.');
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });

      logger.info(`SMS enviado: ${result.sid}`);
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
      };
    } catch (error: any) {
      logger.error(`Error enviando SMS: ${error.message}`);
      throw error;
    }
  }
}

export default new TwilioService();

