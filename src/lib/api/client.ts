import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { getApiBaseUrl, getApiTimeoutMs } from './baseUrl';

const BASE_URL = getApiBaseUrl();
const API_TIMEOUT_MS = getApiTimeoutMs();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - token ekleme
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - token refresh (cookie tabanlı)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 ve henüz retry yapılmadıysa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true, timeout: API_TIMEOUT_MS }
        );

        const { accessToken } = response.data as { accessToken: string };

        // Store'u güncelle
        useAuthStore.getState().setTokens(accessToken);

        // Orijinal isteği yeni token ile tekrarla
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh başarısız, logout
        useAuthStore.getState().logout();

        // Login sayfasına yönlendir (client-side)
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper to extract error message
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Sunucu yanıt vermiyor. Lütfen daha sonra tekrar deneyin.';
    }
    const data = error.response?.data as { message?: string; errors?: Array<{ errorMessage: string }> };
    if (data?.message) return data.message;
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.map((e) => e.errorMessage).join(', ');
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Beklenmeyen bir hata oluştu';
}

export default apiClient;
