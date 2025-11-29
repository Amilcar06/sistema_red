import apiClient, { ApiResponse } from '../config/api';

export interface Setting {
    clave: string;
    valor: any;
    categoria: string;
}

class SettingsService {
    async getAll() {
        const response = await apiClient.get<ApiResponse<any>>('/settings');
        if (response.data.status === 'success') {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Error al obtener configuraciones');
    }

    async getByCategory(category: string) {
        const response = await apiClient.get<ApiResponse<any>>(`/settings?categoria=${category}`);
        if (response.data.status === 'success') {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Error al obtener configuraciones');
    }

    async update(settings: Setting[]) {
        const response = await apiClient.put<ApiResponse<any>>('/settings', { settings });
        if (response.data.status === 'success') {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Error al actualizar configuraciones');
    }
}

export default new SettingsService();
