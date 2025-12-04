import { Request, Response, NextFunction } from 'express';
import whatsappService from '../services/whatsapp.service';

export const getStatus = (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = whatsappService.getStatus();
        res.json({
            status: 'success',
            data: status
        });
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { to, message } = req.body;

        if (!to || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requieren "to" y "message"'
            });
        }

        await whatsappService.sendMessage(to, message);

        res.json({
            status: 'success',
            message: 'Mensaje enviado a la cola de WhatsApp'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error al enviar mensaje'
        });
    }
};
