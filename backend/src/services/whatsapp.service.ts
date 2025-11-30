import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import winston from 'winston';

class WhatsappService {
    private client: Client;
    private isReady: boolean = false;
    private qrCode: string | null = null;

    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
        });

        this.initialize();
    }

    private initialize() {
        this.client.on('qr', (qr: string) => {
            this.qrCode = qr;
            console.log('QR Code received. Scan it with your phone:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            this.isReady = true;
            this.qrCode = null;
            console.log('WhatsApp Client is ready!');
        });

        this.client.on('authenticated', () => {
            console.log('WhatsApp Authenticated');
        });

        this.client.on('auth_failure', (msg: string) => {
            console.error('WhatsApp Auth Failure', msg);
        });

        this.client.initialize();
    }

    async sendMessage(to: string, message: string): Promise<boolean> {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not ready');
        }

        try {
            // Formatear número: eliminar caracteres no numéricos y asegurar código de país
            // Asumimos números de Bolivia (591) si no tienen código
            let formattedNumber = to.replace(/\D/g, '');
            if (!formattedNumber.startsWith('591') && formattedNumber.length === 8) {
                formattedNumber = `591${formattedNumber}`;
            }

            const chatId = `${formattedNumber}@c.us`;
            await this.client.sendMessage(chatId, message);
            return true;
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            return false;
        }
    }

    getStatus() {
        return {
            isReady: this.isReady,
            qrCode: this.qrCode
        };
    }
}

export default new WhatsappService();
