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
import reportsService from '../services/reports.service';
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
  const [conversionData, setConversionData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await reportsService.getStats();

      setStats(data.stats);
      setChannelPerformance(data.channelPerformance);
      setConversionData(data.conversionData);
      setRevenueData(data.revenueData);
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



  const handleDownload = async (format: 'pdf' | 'excel') => {
    try {
      // Usar directamente la URL del servicio de reportes (3003)
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3003/api/v1/reports/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error en la descarga');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
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
              <div className="text-muted-foreground text-sm">Tasa de Conversión</div>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl mb-1 font-bold">{stats.conversionRate}%</div>
            <div className="text-muted-foreground text-sm">Basado en datos reales</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-muted-foreground text-sm">Clientes Activos</div>
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-3xl mb-1 font-bold">{stats.activeClients.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">Total registrados</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 mb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mensajes Enviados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <div className="text-3xl mb-1 font-bold">{stats.totalMessages.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">Total acumulado</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 mb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Costo Estimado
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <div className="text-3xl mb-1 font-bold">{stats.totalConversions.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">Total acumulado</div>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="conversiones"
                stroke="#FF6B00"
                strokeWidth={2}
                name="Conversiones"
                dot={{ r: 4, fill: '#FF6B00' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="envios"
                stroke="#0A192F"
                strokeWidth={2}
                name="Envíos"
                dot={{ r: 4, fill: '#0A192F' }}
                activeDot={{ r: 6 }}
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
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Canal</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Mensajes Enviados</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Conversiones</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Tasa Conversión</th>
                </tr>
              </thead>
              <tbody>
                {channelPerformance.map((channel) => (
                  <tr key={channel.channel} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium">{channel.channel}</td>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="channel" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                cursor={{ fill: 'var(--muted)' }}
              />
              <Legend />
              <Bar dataKey="envios" fill="#0A192F" name="Envíos" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversiones" fill="#FF6B00" name="Conversiones" radius={[4, 4, 0, 0]} />
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="ingresos"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.2}
                name="Ingresos"
              />
              <Area
                type="monotone"
                dataKey="gastos"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.2}
                name="Gastos"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-muted-foreground text-sm mb-1">Ingreso Estimado</div>
              <div className="text-2xl font-bold text-green-600">
                ${(stats.totalConversions * 100).toLocaleString()}
              </div>
            </div>
            <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="text-muted-foreground text-sm mb-1">Gasto Estimado</div>
              <div className="text-2xl font-bold text-destructive">
                ${(stats.totalMessages * 0.1).toLocaleString()}
              </div>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-lg border border-secondary/20">
              <div className="text-muted-foreground text-sm mb-1">Ganancia Neta</div>
              <div className="text-2xl font-bold text-secondary">
                ${((stats.totalConversions * 100) - (stats.totalMessages * 0.1)).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
