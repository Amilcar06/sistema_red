import apiClient, { ApiResponse } from '../config/api';

export interface Rule {
    id: string;
    nombre: string;
    descripcion?: string;
    tipoRegla: 'ELEGIBILIDAD' | 'DESCUENTO' | 'NOTIFICACION' | 'PROGRAMACION';
    condiciones: any; // JSON
    acciones: any; // JSON
    prioridad: number;
    activa: boolean;
    fechaCreacion: string;
    fechaActualizacion: string;
}

export interface CreateRuleData {
    nombre: string;
    descripcion?: string;
    tipoRegla: 'ELEGIBILIDAD' | 'DESCUENTO' | 'NOTIFICACION' | 'PROGRAMACION';
    condiciones: any;
    acciones: any;
    prioridad?: number;
    activa?: boolean;
}

export interface UpdateRuleData {
    nombre?: string;
    descripcion?: string;
    tipoRegla?: 'ELEGIBILIDAD' | 'DESCUENTO' | 'NOTIFICACION' | 'PROGRAMACION';
    condiciones?: any;
    acciones?: any;
    prioridad?: number;
    activa?: boolean;
}

class RuleService {
    async getAll(filters: any = {}): Promise<Rule[]> {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.tipoRegla && filters.tipoRegla !== 'all') params.append('tipoRegla', filters.tipoRegla);
        if (filters.activa !== undefined && filters.activa !== 'all') params.append('activa', filters.activa);

        const response = await apiClient.get<ApiResponse<Rule[]>>(`/rules?${params.toString()}`);
        return response.data.data || [];
    }

    async getTypes(): Promise<string[]> {
        const response = await apiClient.get<ApiResponse<string[]>>('/rules/types');
        return response.data.data || [];
    }

    async getById(id: string): Promise<Rule> {
        const response = await apiClient.get<ApiResponse<Rule>>(`/rules/${id}`);
        if (response.data.data) return response.data.data;
        throw new Error('Regla no encontrada');
    }

    async create(data: CreateRuleData): Promise<Rule> {
        const response = await apiClient.post<ApiResponse<Rule>>('/rules', data);
        if (response.data.data) return response.data.data;
        throw new Error('Error al crear regla');
    }

    async update(id: string, data: UpdateRuleData): Promise<Rule> {
        const response = await apiClient.patch<ApiResponse<Rule>>(`/rules/${id}`, data);
        if (response.data.data) return response.data.data;
        throw new Error('Error al actualizar regla');
    }

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/rules/${id}`);
    }

    async assignToPromotion(reglaId: string, promocionId: string): Promise<void> {
        await apiClient.post('/rules/assign', { reglaId, promocionId });
    }
}

export default new RuleService();
