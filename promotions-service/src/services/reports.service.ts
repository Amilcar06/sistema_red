import prisma from '../config/database';

class ReportsService {
    async getStats() {
        const [
            totalClients,
            activeClients,
            promotionsStats,
            channelStats
        ] = await Promise.all([
            prisma.cliente.count(),
            prisma.cliente.count({ where: { estado: 'ACTIVO' } }),
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
        const conversionRate = totalMessages > 0 ? (totalConversions / totalMessages) * 100 : 0;
        const estimatedROI = conversionRate * 10; // Placeholder logic

        // Process channel stats
        let smsCount = 0;
        let whatsappCount = 0;
        let emailCount = 0;

        channelStats.forEach((stat) => {
            if (stat.canal === 'SMS') smsCount += stat._count.canal;
            else if (stat.canal === 'WHATSAPP') whatsappCount += stat._count.canal;
            else if (stat.canal === 'CORREO' || stat.canal === 'EMAIL') emailCount += stat._count.canal;
        });

        const channelPerformance = [
            {
                channel: 'SMS',
                envios: smsCount,
                conversiones: Math.round(smsCount * (conversionRate / 100)),
                tasaConversion: conversionRate
            },
            {
                channel: 'WhatsApp',
                envios: whatsappCount,
                conversiones: Math.round(whatsappCount * (conversionRate / 100)),
                tasaConversion: conversionRate
            },
            {
                channel: 'Email',
                envios: emailCount,
                conversiones: Math.round(emailCount * (conversionRate / 100)),
                tasaConversion: conversionRate
            }
        ];

        // Mock weekly/monthly data (same as frontend for now)
        const conversionData = [
            { week: 'Sem 1', conversiones: Math.round(totalConversions * 0.25), envios: Math.round(totalMessages * 0.25) },
            { week: 'Sem 2', conversiones: Math.round(totalConversions * 0.30), envios: Math.round(totalMessages * 0.30) },
            { week: 'Sem 3', conversiones: Math.round(totalConversions * 0.25), envios: Math.round(totalMessages * 0.25) },
            { week: 'Sem 4', conversiones: Math.round(totalConversions * 0.20), envios: Math.round(totalMessages * 0.20) },
        ];

        const revenueData = [
            { month: 'Jun', ingresos: 0, gastos: 0 },
            { month: 'Jul', ingresos: 0, gastos: 0 },
            { month: 'Ago', ingresos: 0, gastos: 0 },
            { month: 'Sep', ingresos: 0, gastos: 0 },
            { month: 'Oct', ingresos: 0, gastos: 0 },
            { month: 'Nov', ingresos: totalConversions * 100, gastos: totalMessages * 0.1 },
        ];

        return {
            stats: {
                conversionRate: parseFloat(conversionRate.toFixed(1)),
                activeClients,
                totalMessages,
                totalConversions,
                roi: parseFloat(estimatedROI.toFixed(0))
            },
            channelPerformance,
            conversionData,
            revenueData
        };
    }
}

export default new ReportsService();
