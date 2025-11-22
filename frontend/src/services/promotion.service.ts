import apiClient, { ApiResponse, PaginatedResponse } from '../config/api';
import { Product } from './product.service';

export interface Promotion {
  id: string;
  nombre: string;
  descripcion?: string;
  tipoDescuento: 'PORCENTAJE' | 'MONTO_FIJO' | 'GRATIS';
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  estado: 'BORRADOR' | 'ACTIVA' | 'PAUSADA' | 'FINALIZADA' | 'CANCELADA';
  segmentoObjetivo?: string;
  plantillaMensaje?: string;
  totalEnviados: number;
  totalConvertidos: number;
  productos?: Array<{
    producto: Product;
  }>;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreatePromotionData {
  nombre: string;
  descripcion?: string;
  tipoDescuento: 'PORCENTAJE' | 'MONTO_FIJO' | 'GRATIS';
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  segmentoObjetivo?: string;
  plantillaMensaje?: string;
  productIds?: string[];
}

export interface UpdatePromotionData extends Partial<CreatePromotionData> {}

export interface PromotionFilters {
  estado?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PromotionStatistics {
  total: number;
  activo: number;
  pausada: number;
  finalizada: number;
  conversionRate?: number;
}

class PromotionService {
  async findAll(filters: PromotionFilters = {}): Promise<PaginatedResponse<Promotion>> {
    const params = new URLSearchParams();
    
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.search) params.append('busqueda', filters.search);
    if (filters.page) params.append('pagina', filters.page.toString());
    if (filters.limit) params.append('limite', filters.limit.toString());

    const response = await apiClient.get<ApiResponse<any>>(
      `/promotions?${params.toString()}`
    );

    if (response.data.status === 'success') {
      // El backend devuelve { datos, paginacion } directamente en el response
      const backendData = response.data.datos || response.data.data || [];
      const backendPagination = response.data.paginacion || response.data.pagination || {
        pagina: 1,
        limite: 10,
        total: 0,
        totalPaginas: 0,
      };
      
      return {
        data: backendData,
        pagination: {
          page: backendPagination.pagina || backendPagination.page || 1,
          limit: backendPagination.limite || backendPagination.limit || 10,
          total: backendPagination.total || 0,
          totalPages: backendPagination.totalPaginas || backendPagination.totalPages || 0,
        },
      };
    }

    throw new Error(response.data.message || 'Error al obtener promociones');
  }

  async findById(id: string): Promise<Promotion> {
    const response = await apiClient.get<ApiResponse<Promotion>>(`/promotions/${id}`);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener promoción');
  }

  async create(data: CreatePromotionData): Promise<Promotion> {
    const response = await apiClient.post<ApiResponse<Promotion>>('/promotions', data);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear promoción');
  }

  async update(id: string, data: UpdatePromotionData): Promise<Promotion> {
    const response = await apiClient.patch<ApiResponse<Promotion>>(
      `/promotions/${id}`,
      data
    );

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al actualizar promoción');
  }

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse>(`/promotions/${id}`);

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Error al eliminar promoción');
    }
  }

  async activate(id: string): Promise<Promotion> {
    const response = await apiClient.post<ApiResponse<Promotion>>(
      `/promotions/${id}/activate`
    );

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al activar promoción');
  }

  async pause(id: string): Promise<Promotion> {
    const response = await apiClient.post<ApiResponse<Promotion>>(
      `/promotions/${id}/pause`
    );

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al pausar promoción');
  }

  async getStatistics(id: string): Promise<PromotionStatistics> {
    const response = await apiClient.get<ApiResponse<PromotionStatistics>>(
      `/promotions/${id}/statistics`
    );

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener estadísticas');
  }
}

export default new PromotionService();

