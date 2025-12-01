import { useState, useEffect } from 'react';
import { Users, MessageSquare, TrendingUp, DollarSign, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Alert, AlertDescription } from './ui/alert';
import { DashboardSkeleton } from './Skeleton';
import dashboardService, { DashboardStats } from '../services/dashboard.service';



export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activePromotions: 0,
    totalMessages: 0,
    totalConversions: 0,
  });
  const [channelData, setChannelData] = useState([
    { name: 'SMS', value: 0 },
    { name: 'WhatsApp', value: 0 },
    { name: 'Email', value: 0 },
  ]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await dashboardService.getStats();

      setStats(data.stats);
      setChannelData(data.channelData);
      // setMonthlyData(data.monthlyData); // If we decide to use dynamic monthly data later
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar datos del dashboard';
      setError(errorMessage);
      console.error('Error loading dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const statsCards = [
    {
      title: 'Total Clientes',
      value: stats.totalClients.toLocaleString(),
      change: '+12.5%', // TODO: Calcular cambio real cuando haya datos históricos
      trend: 'up' as const,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Mensajes Enviados',
      value: stats.totalMessages.toLocaleString(),
      change: '+8.2%', // TODO: Calcular cambio real
      trend: 'up' as const,
      icon: MessageSquare,
      color: 'bg-green-500',
    },
    {
      title: 'Conversiones',
      value: stats.totalConversions.toLocaleString(),
      change: '+15.3%', // TODO: Calcular cambio real
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Promociones Activas',
      value: stats.activePromotions.toString(),
      change: '+5.2%', // TODO: Calcular cambio real
      trend: 'up' as const,
      icon: DollarSign,
      color: 'bg-orange-500',
    },
  ];

  // Datos mensuales (placeholder - se puede mejorar con datos reales)
  const monthlyData = [
    { month: 'Ene', mensajes: 3400, conversiones: 280 },
    { month: 'Feb', mensajes: 4200, conversiones: 350 },
    { month: 'Mar', mensajes: 3800, conversiones: 310 },
    { month: 'Abr', mensajes: 5100, conversiones: 420 },
    { month: 'May', mensajes: 4900, conversiones: 390 },
    { month: 'Jun', mensajes: 5800, conversiones: 480 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl mb-2">Dashboard</h1>
          <p className="text-gray-600">Resumen general del sistema de promociones</p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen general del sistema de promociones</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUp : ArrowDown;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                    <h3 className="text-2xl mb-2">{stat.value}</h3>
                    <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      <TrendIcon className="w-4 h-4" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mensajes y Conversiones Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="mensajes" fill="#3b82f6" />
                <Bar dataKey="conversiones" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: `Total de ${stats.totalClients} clientes registrados`, time: 'Actualizado', type: 'info' },
              { action: `${stats.activePromotions} promociones activas`, time: 'Actualizado', type: 'success' },
              { action: `${stats.totalMessages} mensajes enviados`, time: 'Actualizado', type: 'success' },
              { action: `${stats.totalConversions} conversiones realizadas`, time: 'Actualizado', type: 'success' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                  <span>{activity.action}</span>
                </div>
                <span className="text-gray-500 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
