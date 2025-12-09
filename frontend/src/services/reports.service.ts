import axios from 'axios';
import { ApiResponse } from '../config/api';

const REPORTS_API_URL = 'http://localhost:3003/api/v1';

const reportsApi = axios.create({
    baseURL: REPORTS_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

reportsApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface ReportStats {
    conversionRate: number;
    activeClients: number;
    totalMessages: number;
    totalConversions: number;
    roi: number;
}

export interface ChannelPerformance {
    channel: string;
    envios: number;
    conversiones: number;
    tasaConversion: number;
}

export interface ConversionData {
    week: string;
    conversiones: number;
    envios: number;
}

export interface RevenueData {
    month: string;
    ingresos: number;
    gastos: number;
}

export interface ReportsData {
    stats: ReportStats;
    channelPerformance: ChannelPerformance[];
    conversionData: ConversionData[];
    revenueData: RevenueData[];
}

class ReportsService {
    async getStats(): Promise<ReportsData> {
        const response = await reportsApi.get<ApiResponse<ReportsData>>('/reports/dashboard');

        if (response.data.status === 'success' && response.data.data) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Error al obtener datos de reportes');
    }
}

export default new ReportsService();
