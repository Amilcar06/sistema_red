import apiClient, { ApiResponse, PaginatedResponse } from '../config/api';

export interface Client {
  id: string;
  nombre: string;
  telefono: string;
  correo?: string;
  plan: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  fechaRegistro: string;
  fechaUltimaActividad?: string;
  metadata?: any;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreateClientData {
  nombre: string;
  telefono: string;
  correo?: string;
  plan: string;
  estado?: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
}

export interface UpdateClientData extends Partial<CreateClientData> { }

export interface ClientFilters {
  search?: string;
  estado?: string;
  plan?: string;
  page?: number;
  limit?: number;
}

export interface ClientStatistics {
  total: number;
  activo: number;
  inactivo: number;
  byPlan: Array<{
    plan: string;
    count: number;
  }>;
}

class ClientService {
  async findAll(filters: ClientFilters = {}): Promise<PaginatedResponse<Client>> {
    const params = new URLSearchParams();

    if (filters.search) params.append('busqueda', filters.search);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.plan) params.append('plan', filters.plan);
    if (filters.page) params.append('pagina', filters.page.toString());
    if (filters.limit) params.append('limite', filters.limit.toString());

    const response = await apiClient.get<ApiResponse<any>>(
      `/clients?${params.toString()}`
    );

    if (response.data.status === 'success') {
      // El backend devuelve { datos, paginacion } directamente
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

    throw new Error(response.data.message || 'Error al obtener clientes');
  }

  async findById(id: string): Promise<Client> {
    const response = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener cliente');
  }

  async create(data: CreateClientData): Promise<Client> {
    const response = await apiClient.post<ApiResponse<Client>>('/clients', data);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear cliente');
  }

  async update(id: string, data: UpdateClientData): Promise<Client> {
    const response = await apiClient.patch<ApiResponse<Client>>(
      `/clients/${id}`,
      data
    );

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al actualizar cliente');
  }

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse>(`/clients/${id}`);

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Error al eliminar cliente');
    }
  }

  async getStatistics(): Promise<ClientStatistics> {
    const response = await apiClient.get<ApiResponse<ClientStatistics>>(
      '/clients/statistics'
    );

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener estadísticas');
  }
}

export default new ClientService();

