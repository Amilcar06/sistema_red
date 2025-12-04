import { Request, Response } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/helpers';

class DashboardController {
    getStats = catchAsync(async (req: Request, res: Response) => {
        const [totalClientes, clientesActivos] = await Promise.all([
            prisma.cliente.count(),
            prisma.cliente.count({ where: { estado: 'ACTIVO' } }),
        ]);

        // Mock data for other services (Promotions, Notifications)
        // In a real microservices env, we would aggregate this via API calls or events
        const stats = {
            totalClients: totalClientes,
            activePromotions: 5, // Mock
            totalMessages: 150, // Mock
            totalConversions: 12, // Mock
        };

        const channelData = [
            { name: 'SMS', value: 45 },
            { name: 'WhatsApp', value: 80 },
            { name: 'Email', value: 25 },
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
