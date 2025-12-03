import api from './auth.service';

export interface ClientProfile {
    id: string;
    nombre: string;
    paterno: string;
    materno?: string;
    telefono: string;
    correo?: string;
    plan: string;
    estado: string;
    promociones: {
        id: string;
        estado: string;
        promocion: {
            id: string;
            nombre: string;
            descripcion: string;
            tipoDescuento: string;
            valorDescuento: number;
            fechaInicio: string;
            fechaFin: string;
        };
    }[];
    notificaciones: {
        id: string;
        mensaje: string;
        fechaCreacion: string;
        leido: boolean;
    }[];
}

export const clientService = {
    async getProfile(id: string): Promise<ClientProfile> {
        try {
            const response = await api.get(`/clients/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching client profile:', error);
            throw error;
        }
    },
    async savePushToken(id: string, token: string): Promise<void> {
        try {
            await api.post(`/clients/${id}/push-token`, { token });
        } catch (error) {
            console.error('Error saving push token:', error);
            // No lanzamos error para no interrumpir el flujo principal si esto falla
        }
    }
};
