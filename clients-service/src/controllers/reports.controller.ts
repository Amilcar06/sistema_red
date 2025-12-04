import { Request, Response } from 'express';
import { catchAsync } from '../utils/helpers';

import prisma from '../config/database';

class ReportsController {
    getDashboardReport = catchAsync(async (req: Request, res: Response) => {
        const [
            activeClients,
            totalMessages,
            totalConversions,
            channelStats
        ] = await Promise.all([
            prisma.cliente.count({ where: { estado: 'ACTIVO' } }),
            prisma.notificacion.count(),
            prisma.clientePromocion.count({ where: { estado: 'CONVERTIDA' } }),
            prisma.notificacion.groupBy({
                by: ['canal'],
                _count: {
                    canal: true
                }
            })
        ]);

        const conversionRate = totalMessages > 0
            ? parseFloat(((totalConversions / totalMessages) * 100).toFixed(2))
            : 0;

        const stats = {
            conversionRate,
            activeClients,
            totalMessages,
            totalConversions,
            roi: 0, // Not enough data for ROI yet
        };

        const channelPerformance = channelStats.map(stat => ({
            channel: stat.canal === 'CORREO' ? 'Email' : stat.canal,
            envios: stat._count.canal,
            conversiones: 0, // Needs more granular tracking to link conversion to channel
            tasaConversion: 0
        }));

        // Fill missing channels if needed
        const channels = ['SMS', 'WhatsApp', 'Email'];
        channels.forEach(ch => {
            if (!channelPerformance.find(cp => cp.channel === ch)) {
                channelPerformance.push({ channel: ch, envios: 0, conversiones: 0, tasaConversion: 0 });
            }
        });

        res.json({
            status: 'success',
            data: {
                stats,
                channelPerformance,
            },
        });
    });
}

export default new ReportsController();
