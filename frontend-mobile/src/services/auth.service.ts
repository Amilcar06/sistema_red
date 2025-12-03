import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// URL de la API
// Para dispositivo físico (Pixel 7), usar la IP de tu máquina en la red local (ver logs de Expo)
// Backend corre en puerto 3001 por defecto
const API_URL = 'http://192.168.0.13:3001/api/v1';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const authService = {
    async login(correo: string, contrasena: string) {
        try {
            const response = await api.post('/auth/login', { correo, contrasena });

            if (response.data.token) {
                await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.data.usuario));
            }

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async logout() {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
    },

    async getToken() {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    },

    async getUser() {
        const userStr = await SecureStore.getItemAsync(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }
};

export default api;
