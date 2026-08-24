// src/api/client.ts
import axios, { AxiosError } from 'axios';
import { ApiError } from './apiError';
import type { apiErrorResponse } from '../types';

// URL base del backend de NestJS
const API_BASE_URL = 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: adjunta el token en cada petición si existe
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response: mapea los errores a nuestra clase ApiError
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<apiErrorResponse>) => {
    // 1. Error de red (backend apagado o sin conexión)
    if (!error.response) {
      throw new ApiError('No se pudo conectar con el servidor.', undefined, true);
    }

    const { status, data } = error.response;
    let message = 'Ocurrió un error inesperado.';

    if (data?.message) {
      message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }

    // 2. Si el token expiró (401), limpiamos sesión
    if (status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }

    // 3. Lanzamos el error con status
    throw new ApiError(message, status, false);
  }
);