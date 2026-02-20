import axios, { AxiosError, AxiosResponse } from 'axios';
import { logError, getErrorMessage } from '@/app/lib/utils/errorHandler';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logError(error, 'API Request Interceptor');
    return Promise.reject(error);
  }
);

// Extend AxiosRequestConfig to support per-request retry tracking
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    __retryCount?: number;
  }
}

const MAX_RETRIES = 3;

// Response interceptor for error handling and retries
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config;
    if (!config) {
      return Promise.reject(error);
    }

    // Initialize per-request retry count
    config.__retryCount = config.__retryCount ?? 0;

    // Handle 401 Unauthorized — no retry, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      logError(error, 'API Client - Unauthorized', { url: config.url });
      return Promise.reject(error);
    }

    // Handle 403 Forbidden — no retry
    if (error.response?.status === 403) {
      logError(error, 'API Client - Forbidden', { url: config.url });
      return Promise.reject(error);
    }

    // Determine if this error is retryable
    const isRetryable =
      error.response?.status === 429 ||
      error.response?.status !== undefined && error.response.status >= 500 ||
      !error.response; // network error

    if (isRetryable && config.__retryCount < MAX_RETRIES) {
      config.__retryCount++;
      const delayMs = Math.pow(2, config.__retryCount) * 1000;

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return apiClient(config);
    }

    // Log after retries exhausted or non-retryable error
    const context = !error.response
      ? 'API Client - Network Error'
      : error.response.status === 429
        ? 'API Client - Too Many Requests'
        : error.response.status >= 500
          ? 'API Client - Server Error'
          : 'API Client - Request Failed';

    logError(error, config.__retryCount > 0 ? `${context} (after ${config.__retryCount} retries)` : context, {
      url: config.url,
      status: error.response?.status,
      retries: config.__retryCount,
    });

    return Promise.reject(error);
  }
);

export default apiClient;
export { AxiosError };
