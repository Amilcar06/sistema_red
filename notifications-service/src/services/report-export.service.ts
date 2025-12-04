import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Response } from 'express';

class ReportExportService {
    async generatePDF(data: any[], res: Response) {
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Reporte del Sistema', { align: 'center' });
        doc.moveDown();

        data.forEach((item, index) => {
            doc.fontSize(12).text(`${index + 1}. ${JSON.stringify(item)}`);
            doc.moveDown(0.5);
        });

        doc.end();
    }

    async generateExcel(data: any[], res: Response) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte');

        if (data.length > 0) {
            // Generar columnas dinámicamente basadas en las llaves del primer objeto
            const columns = Object.keys(data[0]).map(key => ({
                header: key.charAt(0).toUpperCase() + key.slice(1),
                key: key,
                width: 20
            }));
            worksheet.columns = columns;

            // Agregar filas
            worksheet.addRows(data);
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    }
}

export default new ReportExportService();
