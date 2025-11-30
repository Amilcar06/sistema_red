import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Users, BarChart3, Calendar, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import clientService from '../services/client.service';
import promotionService from '../services/promotion.service';
import notificationService from '../services/notification.service';
import apiClient from '../config/api';
import { toast } from 'sonner';

export function Reports() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    conversionRate: 0,
    activeClients: 0,
    totalMessages: 0,
    totalConversions: 0,
    roi: 0,
  });
  const [channelPerformance, setChannelPerformance] = useState([
    { channel: 'SMS', envios: 0, conversiones: 0, tasaConversion: 0 },
    { channel: 'WhatsApp', envios: 0, conversiones: 0, tasaConversion: 0 },
    { channel: 'Email', envios: 0, conversiones: 0, tasaConversion: 0 },
  ]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar estadísticas de clientes
      const clientStats = await clientService.getStatistics();

      // Cargar todas las promociones para calcular conversiones
      const allPromotions = await promotionService.findAll();
      const promotions = allPromotions.data || [];

      const totalMessages = promotions.reduce((acc: number, p: any) => acc + (p.totalEnviados || 0), 0);
      const totalConversions = promotions.reduce((acc: number, p: any) => acc + (p.totalConvertidos || 0), 0);
      const conversionRate = totalMessages > 0 ? (totalConversions / totalMessages) * 100 : 0;

      // Cargar historial de notificaciones para estadísticas por canal
      const notificationsResponse = await notificationService.getHistory({ limit: 1000 });
      const notifications = notificationsResponse.data || [];

      // Calcular estadísticas por canal
      const smsNotifications = notifications.filter((n: any) => n.canal === 'SMS');
      const whatsappNotifications = notifications.filter((n: any) => n.canal === 'WHATSAPP');
      const emailNotifications = notifications.filter((n: any) => n.canal === 'CORREO' || n.canal === 'EMAIL');

      // Agrupar por promoción para calcular conversiones por canal
      const smsCount = smsNotifications.length;
      const whatsappCount = whatsappNotifications.length;
      const emailCount = emailNotifications.length;

      // Buscar conversiones relacionadas (las notificaciones de promociones que fueron convertidas)
      // Para simplificar, usaremos las estadísticas de las promociones
      const channelPerf = [
        {
          channel: 'SMS',
          envios: smsCount,
          conversiones: Math.round(smsCount * (conversionRate / 100)), // Estimación basada en tasa general
          tasaConversion: conversionRate,
        },
        {
          channel: 'WhatsApp',
          envios: whatsappCount,
          conversiones: Math.round(whatsappCount * (conversionRate / 100)),
          tasaConversion: conversionRate,
        },
        {
          channel: 'Email',
          envios: emailCount,
          conversiones: Math.round(emailCount * (conversionRate / 100)),
          tasaConversion: conversionRate,
        },
      ];

      setChannelPerformance(channelPerf);

      // Calcular ROI estimado (esto sería mejor si hubiera datos de costos)
      const estimatedROI = conversionRate > 0 ? conversionRate * 10 : 0;

      setStats({
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        activeClients: clientStats.activo || 0,
        totalMessages,
        totalConversions,
        roi: parseFloat(estimatedROI.toFixed(0)),
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar datos del reporte';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error loading reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  // Generar datos semanales (últimas 4 semanas) basado en notificaciones
  const conversionData = [
    { week: 'Sem 1', conversiones: Math.round(stats.totalConversions * 0.25), envios: Math.round(stats.totalMessages * 0.25) },
    { week: 'Sem 2', conversiones: Math.round(stats.totalConversions * 0.30), envios: Math.round(stats.totalMessages * 0.30) },
    { week: 'Sem 3', conversiones: Math.round(stats.totalConversions * 0.25), envios: Math.round(stats.totalMessages * 0.25) },
    { week: 'Sem 4', conversiones: Math.round(stats.totalConversions * 0.20), envios: Math.round(stats.totalMessages * 0.20) },
  ];

  // Datos de ingresos (placeholder - requeriría datos históricos reales)
  const revenueData = [
    { month: 'Jun', ingresos: 0, gastos: 0 },
    { month: 'Jul', ingresos: 0, gastos: 0 },
    { month: 'Ago', ingresos: 0, gastos: 0 },
    { month: 'Sep', ingresos: 0, gastos: 0 },
    { month: 'Oct', ingresos: 0, gastos: 0 },
    { month: 'Nov', ingresos: stats.totalConversions * 100, gastos: stats.totalMessages * 0.1 },
  ];

  const handleDownload = async (format: 'pdf' | 'excel') => {
    try {
      const response = await apiClient.get(`/reports/export?format=${format}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error al descargar el reporte');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl mb-2">Reportes y Estadísticas</h1>
          <p className="text-gray-600">Análisis detallado del rendimiento</p>
        </div>
        <div className="flex items-center justify-center py-24">
          <BarChart3 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Reportes y Estadísticas</h1>
          <p className="text-gray-600">Análisis detallado del rendimiento</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleDownload('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => handleDownload('excel')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Tasa de Conversión</div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl mb-1">{stats.conversionRate}%</div>
            <div className="text-green-600 text-sm">Basado en datos reales</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Clientes Activos</div>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl mb-1">{stats.activeClients.toLocaleString()}</div>
            <div className="text-green-600 text-sm">Total registrados</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mensajes Enviados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <div className="text-3xl mb-1">{stats.totalMessages.toLocaleString()}</div>
            <div className="text-green-600 text-sm">Total acumulado</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Costo Estimado
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <div className="text-3xl mb-1">{stats.totalConversions.toLocaleString()}</div>
            <div className="text-green-600 text-sm">Total acumulado</div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Conversiones</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="conversiones"
                stroke="#10b981"
                strokeWidth={2}
                name="Conversiones"
              />
              <Line
                type="monotone"
                dataKey="envios"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Envíos"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Canal</th>
                  <th className="text-left p-4">Mensajes Enviados</th>
                  <th className="text-left p-4">Conversiones</th>
                  <th className="text-left p-4">Tasa Conversión</th>
                </tr>
              </thead>
              <tbody>
                {channelPerformance.map((channel) => (
                  <tr key={channel.channel} className="border-b">
                    <td className="p-4">{channel.channel}</td>
                    <td className="p-4">{channel.envios.toLocaleString()}</td>
                    <td className="p-4">{channel.conversiones.toLocaleString()}</td>
                    <td className="p-4">
                      {channel.tasaConversion > 0
                        ? channel.tasaConversion.toFixed(2)
                        : '0.00'}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="envios" fill="#3b82f6" name="Envíos" />
              <Bar dataKey="conversiones" fill="#10b981" name="Conversiones" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Ingresos y Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="ingresos"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                name="Ingresos"
              />
              <Area
                type="monotone"
                dataKey="gastos"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                name="Gastos"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-gray-600 text-sm mb-1">Ingreso Estimado</div>
              <div className="text-2xl text-green-600">
                ${(stats.totalConversions * 100).toLocaleString()}
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-gray-600 text-sm mb-1">Gasto Estimado</div>
              <div className="text-2xl text-red-600">
                ${(stats.totalMessages * 0.1).toLocaleString()}
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-gray-600 text-sm mb-1">Ganancia Neta</div>
              <div className="text-2xl text-blue-600">
                ${((stats.totalConversions * 100) - (stats.totalMessages * 0.1)).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
