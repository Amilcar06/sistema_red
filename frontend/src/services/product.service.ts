import apiClient, { ApiResponse, PaginatedResponse } from '../config/api';

export interface Product {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio: number;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreateProductData {
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductFilters {
  categoria?: string;
  activo?: boolean;
  pagina?: number;
  limite?: number;
}

class ProductService {
  async findAll(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters.pagina) params.append('pagina', filters.pagina.toString());
    if (filters.limite) params.append('limite', filters.limite.toString());

    const response = await apiClient.get<ApiResponse<any>>(
      `/products?${params.toString()}`
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

    throw new Error(response.data.message || 'Error al obtener productos');
  }

  async findById(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener producto');
  }

  async create(data: CreateProductData): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear producto');
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    const response = await apiClient.patch<ApiResponse<Product>>(
      `/products/${id}`,
      data
    );

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al actualizar producto');
  }

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse>(`/products/${id}`);

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Error al eliminar producto');
    }
  }
}

export default new ProductService();

