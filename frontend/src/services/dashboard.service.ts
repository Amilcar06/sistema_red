import apiClient, { ApiResponse } from '../config/api';

export interface DashboardStats {
    totalClients: number;
    activePromotions: number;
    totalMessages: number;
    totalConversions: number;
}

export interface ChannelData {
    name: string;
    value: number;
}

export interface MonthlyData {
    month: string;
    mensajes: number;
    conversiones: number;
}

export interface DashboardData {
    stats: DashboardStats;
    channelData: ChannelData[];
    monthlyData: MonthlyData[];
}

class DashboardService {
    async getStats(): Promise<DashboardData> {
        const response = await apiClient.get<ApiResponse<DashboardData>>('/dashboard/stats');

        if (response.data.status === 'success' && response.data.data) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Error al obtener datos del dashboard');
    }
}

export default new DashboardService();
