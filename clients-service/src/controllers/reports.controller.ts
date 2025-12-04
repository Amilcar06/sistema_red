import { Request, Response } from 'express';
import { catchAsync } from '../utils/helpers';

class ReportsController {
    getDashboardReport = catchAsync(async (req: Request, res: Response) => {
        // Mock data for dashboard report matching frontend expectations
        const stats = {
            conversionRate: 2.5,
            activeClients: 150,
            totalMessages: 5000,
            totalConversions: 125,
            roi: 15.5,
        };

        const channelPerformance = [
            { channel: 'SMS', envios: 2000, conversiones: 40, tasaConversion: 2.0 },
            { channel: 'WhatsApp', envios: 1500, conversiones: 60, tasaConversion: 4.0 },
            { channel: 'Email', envios: 1500, conversiones: 25, tasaConversion: 1.67 },
        ];

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
