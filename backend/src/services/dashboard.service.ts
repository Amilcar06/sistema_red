import prisma from '../config/database';

class DashboardService {
    async getStats() {
        const [
            totalClients,
            activePromotions,
            promotionsStats,
            channelStats
        ] = await Promise.all([
            prisma.cliente.count(),
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
            else if (stat.canal === 'CORREO' || stat.canal === 'EMAIL') emailCount += stat._count.canal;
        });

        const totalChannel = smsCount + whatsappCount + emailCount;
        const channelData = [
            { name: 'SMS', value: totalChannel > 0 ? Math.round((smsCount / totalChannel) * 100) : 0 },
            { name: 'WhatsApp', value: totalChannel > 0 ? Math.round((whatsappCount / totalChannel) * 100) : 0 },
            { name: 'Email', value: totalChannel > 0 ? Math.round((emailCount / totalChannel) * 100) : 0 },
        ];

        // Mock monthly data for now (as in frontend)
        // In a real app, this would be aggregated from DB
        const monthlyData = [
            { month: 'Ene', mensajes: 3400, conversiones: 280 },
            { month: 'Feb', mensajes: 4200, conversiones: 350 },
            { month: 'Mar', mensajes: 3800, conversiones: 310 },
            { month: 'Abr', mensajes: 5100, conversiones: 420 },
            { month: 'May', mensajes: 4900, conversiones: 390 },
            { month: 'Jun', mensajes: 5800, conversiones: 480 },
        ];

        return {
            stats: {
                totalClients,
                activePromotions,
                totalMessages,
                totalConversions
            },
            channelData,
            monthlyData
        };
    }
}

export default new DashboardService();
