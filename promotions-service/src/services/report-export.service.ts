import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Response } from 'express';

class ReportExportService {
    async generatePDF(data: any[], stats: any, res: Response) {
        const doc = new PDFDocument({ margin: 50 });

        // Colors
        const PRIMARY_COLOR = '#E4601A'; // Naranja corporativo
        const ACCENT_COLOR = '#333333';
        const TABLE_HEADER_COLOR = '#F3F4F6';

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_rendimiento.pdf');

        doc.pipe(res);

        // 1. Barra Lateral o Superior Decorativa & Header
        doc.rect(0, 0, 612, 100).fill(TABLE_HEADER_COLOR); // Fondo encabezado (A4 width approx 612)
        doc.rect(0, 0, 612, 5).fill(PRIMARY_COLOR); // Línea superior naranja

        // Logo y Título
        doc.fontSize(24).fillColor(PRIMARY_COLOR).text('TelePromo', 50, 40);
        doc.fontSize(10).fillColor(ACCENT_COLOR).text('Reporte de Rendimiento General', 50, 70);

        doc.fontSize(10).text(new Date().toLocaleDateString(), 50, 40, { align: 'right', width: 512 });

        doc.moveDown(5);

        // 2. Tarjetas de Resumen (KPIs)
        const kpiY = 130;
        const kpiWidth = 120;
        const kpiGap = 15;

        // Helper para dibujar KPIs
        const drawKPI = (label: string, value: string, x: number) => {
            doc.roundedRect(x, kpiY, kpiWidth, 60, 5).fill('#FFFFFF');
            // Borde sutil
            doc.lineWidth(1).strokeColor('#E5E7EB').roundedRect(x, kpiY, kpiWidth, 60, 5).stroke();

            doc.fillColor('#6B7280').fontSize(10).text(label, x + 10, kpiY + 10);
            doc.fillColor(PRIMARY_COLOR).fontSize(16).text(value, x + 10, kpiY + 35);
        };

        drawKPI('Total Mensajes', stats.totalMessages.toLocaleString(), 50);
        drawKPI('Total Conversiones', stats.totalConversions.toLocaleString(), 50 + kpiWidth + kpiGap);
        drawKPI('Clientes Activos', stats.activeClients.toLocaleString(), 50 + (kpiWidth + kpiGap) * 2);
        drawKPI('Tasa Conversión', `${stats.conversionRate}% `, 50 + (kpiWidth + kpiGap) * 3);

        doc.moveDown(8);

        // 3. Tabla Profesional
        const tableTop = 250;

        // Cabecera de Tabla
        doc.rect(50, tableTop, 512, 25).fill(PRIMARY_COLOR); // 512 = width - margins
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);

        const col1 = 60;
        const col2 = 250;
        const col3 = 380;
        const col4 = 480;

        doc.text('CANAL', col1, tableTop + 8);
        doc.text('ENVÍOS', col2, tableTop + 8);
        doc.text('CONVERSIONES', col3, tableTop + 8);
        doc.text('TASA (%)', col4, tableTop + 8);

        // Filas con Zebra Striping
        let y = tableTop + 25;
        doc.font('Helvetica');

        data.forEach((row, i) => {
            if (i % 2 === 0) {
                // Fondo gris claro alterno
                doc.rect(50, y, 512, 25).fill('#F9FAFB');
            }

            doc.fillColor(ACCENT_COLOR).fontSize(10);
            // Alineación vertical aprox (+8)
            doc.text(row.Canal, col1, y + 8);
            doc.text(row.Envios.toString(), col2, y + 8);
            doc.text(row.Conversiones.toString(), col3, y + 8);
            doc.text(row.TasaConversion, col4, y + 8);

            y += 25;
        });

        // 4. Footer
        const bottom = doc.page.height - 50;
        doc.rect(0, bottom - 10, 612, 1).fill('#E5E7EB'); // Línea separadora

        doc.fontSize(8).fillColor('#9CA3AF')
            .text('Generado automáticamente por Sistema de Promoción de Servicios', 50, bottom + 5, {
                align: 'center',
                width: 512
            });

        doc.end();
    }

    async generateExcel(data: any[], res: Response) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema de Promociones';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Rendimiento por Canal');

        // Define columns
        worksheet.columns = [
            { header: 'Canal', key: 'Canal', width: 20 },
            { header: 'Envíos', key: 'Envios', width: 15 },
            { header: 'Conversiones', key: 'Conversiones', width: 15 },
            { header: 'Tasa de Conversión', key: 'TasaConversion', width: 20 }
        ];

        // Add Data
        worksheet.addRows(data);

        // Style Header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_rendimiento.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    }
}

export default new ReportExportService();
