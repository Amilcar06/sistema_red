import { Request, Response } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/helpers';

class DashboardController {
    getStats = catchAsync(async (req: Request, res: Response) => {
        const [
            totalClientes,
            clientesActivos,
            activePromotions,
            promotionsStats,
            channelStats
        ] = await Promise.all([
            prisma.cliente.count(),
            prisma.cliente.count({ where: { estado: 'ACTIVO' } }),
            prisma.promocion.count({ where: { estado: 'ACTIVA' } }),
            prisma.promocion.aggregate({
                _sum: {
                    totalEnviados: true,
                    totalConvertidos: true
                }
            }),
            prisma.notificacion.groupBy({
                by: ['canal'],
                _count: {
                    canal: true
                }
            })
        ]);

        const totalMessages = promotionsStats._sum.totalEnviados || 0;
        const totalConversions = promotionsStats._sum.totalConvertidos || 0;

        // Process channel stats
        let smsCount = 0;
        let whatsappCount = 0;
        let emailCount = 0;

        channelStats.forEach((stat) => {
            if (stat.canal === 'SMS') smsCount += stat._count.canal;
            else if (stat.canal === 'WHATSAPP') whatsappCount += stat._count.canal;
            else if (stat.canal === 'CORREO') emailCount += stat._count.canal;
        });

        const stats = {
            totalClients: totalClientes,
            activePromotions,
            totalMessages,
            totalConversions,
        };

        const channelData = [
            { name: 'SMS', value: smsCount },
            { name: 'WhatsApp', value: whatsappCount },
            { name: 'Email', value: emailCount },
        ];

        res.json({
            status: 'success',
            data: {
                stats,
                channelData,
            },
        });
    });
}

export default new DashboardController();
