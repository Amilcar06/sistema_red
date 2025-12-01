import { Request, Response, NextFunction } from 'express';
import reportExportService from '../services/report-export.service';
// Importar servicio de reportes existente para obtener datos
import reportsService from '../services/reports.service';
import notificationService from '../services/notification.service';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await reportsService.getStats();
        res.json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

export const exportReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { format } = req.query;

        // Obtener datos reales (ej. historial de notificaciones)
        // En un caso real, recibiríamos filtros para saber qué exportar
        const history = await notificationService.getHistory({ limite: 100 });
        const data = history.datos.map(n => ({
            id: n.id,
            canal: n.canal,
            estado: n.estado,
            fecha: n.fechaCreacion,
            cliente: n.cliente?.nombre || 'N/A'
        }));

        if (format === 'pdf') {
            await reportExportService.generatePDF(data, res);
        } else if (format === 'excel') {
            await reportExportService.generateExcel(data, res);
        } else {
            res.status(400).json({ message: 'Formato no soportado. Use pdf o excel' });
        }
    } catch (error) {
        next(error);
    }
};
