import { Router } from 'express';
import reportsController from '../controllers/reports.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /reports/dashboard:
 *   get:
 *     summary: Obtener estadísticas del dashboard
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Estadísticas generales
 */
router.get('/dashboard', authorize('ADMIN', 'OPERADOR'), reportsController.getDashboardStats);

/**
 * @swagger
 * /reports/export:
 *   get:
 *     summary: Exportar reportes
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel]
 *         required: true
 *         description: Formato del reporte
 *     responses:
 *       200:
 *         description: Archivo de reporte
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export', authorize('ADMIN', 'OPERADOR'), reportsController.exportReport);

export default router;
