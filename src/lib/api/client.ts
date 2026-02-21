import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { logger, sanitizeForLogging } from '@/lib/logger';
import { resolveErrorMessageFromCode } from '@/lib/errors/errorCatalog';
import { getApiBaseUrl, getApiTimeoutMs } from './baseUrl';
import type { ApiError } from '@/types';

const BASE_URL = getApiBaseUrl();
const API_TIMEOUT_MS = getApiTimeoutMs();
const CORRELATION_HEADER = 'X-Correlation-Id';
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const SHOULD_LOG_BODY = process.env.NODE_ENV !== 'production';

type RequestMetadata = {
  startedAt: number;
  correlationId: string;
};

type ExtendedRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  metadata?: RequestMetadata;
};

function createCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function buildRequestUrl(config: InternalAxiosRequestConfig): string {
  const base = config.baseURL ?? '';
  const path = config.url ?? '';
  return `${base}${path}`;
}

function isRefreshEndpoint(config: InternalAxiosRequestConfig | undefined): boolean {
  if (!config?.url) return false;
  return config.url.includes('/api/auth/refresh') || config.url.endsWith('/auth/refresh');
}

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add auth token and log request metadata.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestConfig = config as ExtendedRequestConfig;
    const correlationId = createCorrelationId();
    requestConfig.metadata = {
      startedAt: Date.now(),
      correlationId,
    };

    requestConfig.headers.set(CORRELATION_HEADER, correlationId);
    const method = requestConfig.method?.toUpperCase() ?? 'GET';
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      const csrf = getCookieValue(CSRF_COOKIE_NAME);
      if (csrf) {
        requestConfig.headers.set(CSRF_HEADER_NAME, csrf);
      }
    }

    const token = useAuthStore.getState().accessToken;
    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    logger.debug('api.request', {
      correlationId,
      method: requestConfig.method?.toUpperCase(),
      url: buildRequestUrl(requestConfig),
      params: sanitizeForLogging(requestConfig.params),
      data: SHOULD_LOG_BODY ? sanitizeForLogging(requestConfig.data) : '<disabled-in-production>',
    });

    return requestConfig;
  },
  (error) => {
    logger.error('api.request.intercept_error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return Promise.reject(error);
  }
);

// Response interceptor - log response and refresh token on 401.
apiClient.interceptors.response.use(
  (response) => {
    const requestConfig = response.config as ExtendedRequestConfig;
    const durationMs = requestConfig.metadata ? Date.now() - requestConfig.metadata.startedAt : undefined;

    logger.info('api.response', {
      correlationId: requestConfig.metadata?.correlationId,
      method: requestConfig.method?.toUpperCase(),
      url: buildRequestUrl(requestConfig),
      status: response.status,
      durationMs,
    });

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedRequestConfig | undefined;
    const durationMs = originalRequest?.metadata ? Date.now() - originalRequest.metadata.startedAt : undefined;

    logger.warn('api.response.error', {
      correlationId: originalRequest?.metadata?.correlationId,
      method: originalRequest?.method?.toUpperCase(),
      url: originalRequest ? buildRequestUrl(originalRequest) : undefined,
      status: error.response?.status,
      code: error.code,
      durationMs,
      message: error.message,
      responseData: sanitizeForLogging(error.response?.data),
    });

    // Retry once with refreshed token for unauthorized responses.
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshEndpoint(originalRequest)) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
            timeout: API_TIMEOUT_MS,
            headers: (() => {
              const csrf = getCookieValue(CSRF_COOKIE_NAME);
              if (!csrf) return undefined;
              return { [CSRF_HEADER_NAME]: csrf };
            })(),
          }
        );

        const { accessToken } = response.data as { accessToken: string };

        useAuthStore.getState().setTokens(accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        logger.info('api.auth.token_refreshed', {
          correlationId: originalRequest.metadata?.correlationId,
        });

        return apiClient(originalRequest);
      } catch (refreshError) {
        logger.error('api.auth.refresh_failed', {
          error: refreshError instanceof Error ? refreshError.message : String(refreshError),
        });
        useAuthStore.getState().logout();

        if (typeof window !== 'undefined' && !isRefreshEndpoint(originalRequest)) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper to extract error message
type NormalizedApiError = {
  message: string;
  code?: string;
  status?: number;
  correlationId?: string;
  fieldErrors: Array<{ field: string; message: string }>;
};

function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return {
        message: 'Sunucu yanit vermiyor. Lutfen daha sonra tekrar deneyin.',
        code: 'timeout',
        status: error.response?.status,
        fieldErrors: [],
      };
    }

    const payload = error.response?.data as ApiError | undefined;
    const fieldErrors =
      payload?.errors?.flatMap((item) => {
        const field = item.field ?? item.propertyName ?? '';
        const message = item.message ?? item.errorMessage ?? '';
        if (!message) return [];
        return [{ field, message }];
      }) ?? [];

    const message =
      resolveErrorMessageFromCode(payload?.code) ||
      payload?.message ||
      (fieldErrors.length > 0 ? fieldErrors.map((item) => item.message).join(', ') : undefined) ||
      (error.response?.status === 401 ? 'Oturum doğrulaması başarısız.' : undefined) ||
      (error.response?.status === 403 ? 'Bu işlem için yetkiniz yok.' : undefined) ||
      (error.response?.status === 404 ? 'İstenen kaynak bulunamadı.' : undefined) ||
      (error.response?.status === 429 ? 'Çok fazla istek gönderdiniz. Lütfen tekrar deneyin.' : undefined) ||
      error.message ||
      'Beklenmeyen bir hata olustu';

    return {
      message,
      code: payload?.code,
      status: error.response?.status,
      correlationId: payload?.correlationId,
      fieldErrors,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, fieldErrors: [] };
  }

  return { message: 'Beklenmeyen bir hata olustu', fieldErrors: [] };
}

export function getErrorMessage(error: unknown): string {
  return normalizeApiError(error).message;
}

export function getApiErrorCode(error: unknown): string | undefined {
  return normalizeApiError(error).code;
}

export function getErrorCorrelationId(error: unknown): string | undefined {
  return normalizeApiError(error).correlationId;
}

export function getFieldErrors(error: unknown): Array<{ field: string; message: string }> {
  return normalizeApiError(error).fieldErrors;
}

export default apiClient;
