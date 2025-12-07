import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import reportsService from '../services/reports.service';
import reportExportService from '../services/report-export.service';
import { catchAsync } from '../utils/helpers';

class ReportsController {
    getDashboardStats = catchAsync(async (req: AuthRequest, res: Response) => {
        const stats = await reportsService.getStats();
        res.json({
            status: 'success',
            data: stats,
        });
    });

    exportReport = catchAsync(async (req: AuthRequest, res: Response) => {
        const { format } = req.query;
        const stats = await reportsService.getStats();

        // Preparar datos para exportar (aplanar estructuras si es necesario)
        const dataToExport = stats.channelPerformance.map(cp => ({
            Canal: cp.channel,
            Envios: cp.envios,
            Conversiones: cp.conversiones,
            TasaConversion: `${cp.tasaConversion.toFixed(2)}%`
        }));

        if (format === 'pdf') {
            await reportExportService.generatePDF(dataToExport, res);
        } else if (format === 'excel') {
            await reportExportService.generateExcel(dataToExport, res);
        } else {
            res.status(400).json({
                status: 'error',
                message: 'Formato no soportado. Use pdf o excel.',
            });
        }
    });
}

export default new ReportsController();
