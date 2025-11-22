import apiClient, { ApiResponse, PaginatedResponse } from '../config/api';

export interface Notification {
  id: string;
  clienteId?: string;
  promocionId?: string;
  canal: 'SMS' | 'WHATSAPP' | 'CORREO';
  estado: 'PENDIENTE' | 'EN_COLA' | 'ENVIADA' | 'ENTREGADA' | 'FALLIDA' | 'CANCELADA';
  titulo?: string;
  mensaje: string;
  fechaEnviado?: string;
  fechaEntregado?: string;
  fechaLeido?: string;
  fechaFallido?: string;
  mensajeError?: string;
  metadata?: any;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface SendNotificationData {
  clientId?: string;
  promotionId?: string;
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'CORREO';
  title?: string;
  message: string;
  recipient?: string;
}

export interface NotificationFilters {
  channel?: string;
  status?: string;
  clientId?: string;
  page?: number;
  limit?: number;
}

class NotificationService {
  async send(data: SendNotificationData): Promise<Notification> {
    // Convertir EMAIL a CORREO y ajustar nombres de campos para el backend
    const notificationData = {
      clientId: data.clientId,
      promotionId: data.promotionId,
      channel: data.channel === 'EMAIL' ? 'CORREO' : data.channel,
      title: data.title,
      message: data.message,
    };

    const response = await apiClient.post<ApiResponse<Notification>>(
      '/notifications/send',
      notificationData
    );

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al enviar notificación');
  }

  async sendBulk(
    promotionId: string,
    channel: 'SMS' | 'WHATSAPP' | 'CORREO',
    messageTemplate: string
  ): Promise<Notification[]> {
    const response = await apiClient.post<ApiResponse<Notification[]>>(
      '/notifications/bulk',
      { 
        promocionId: promotionId,
        canal: channel,
        plantillaMensaje: messageTemplate 
      }
    );

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al enviar notificaciones masivas');
  }

  async getHistory(filters: NotificationFilters = {}): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams();
    
    if (filters.channel) params.append('canal', filters.channel === 'EMAIL' ? 'CORREO' : filters.channel);
    if (filters.status) params.append('estado', filters.status);
    if (filters.clientId) params.append('clienteId', filters.clientId);
    if (filters.page) params.append('pagina', filters.page.toString());
    if (filters.limit) params.append('limite', filters.limit.toString());

    const response = await apiClient.get<ApiResponse<any>>(
      `/notifications/history?${params.toString()}`
    );

    if (response.data.status === 'success') {
      const backendData = response.data.datos || response.data.data || [];
      const backendPagination = response.data.paginacion || response.data.pagination || {
        pagina: 1,
        limite: 20,
        total: 0,
        totalPaginas: 0,
      };
      
      return {
        data: backendData,
        pagination: {
          page: backendPagination.pagina || backendPagination.page || 1,
          limit: backendPagination.limite || backendPagination.limit || 20,
          total: backendPagination.total || 0,
          totalPages: backendPagination.totalPaginas || backendPagination.totalPages || 0,
        },
      };
    }

    throw new Error(response.data.message || 'Error al obtener historial');
  }
}

export default new NotificationService();

