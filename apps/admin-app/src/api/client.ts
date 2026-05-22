import axios from 'axios';
import type { ApiResponse } from '../types/api';
import { ApiError } from '../types/api';
import { clearSession, getToken } from '../lib/session';

export const BASE_URL = 'http://localhost:3000/api';
export const EMPLOYEE_SERVICE_URL = 'http://localhost:3001';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token before every request
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Always resolve — success and error both produce ApiResponse<T>
axiosInstance.interceptors.response.use(
  (response) => {
    response.data = {
      statusCode: response.status,
      message: 'OK',
      data: response.data,
    } satisfies ApiResponse<unknown>;
    return response;
  },
  (error) => {
    let errorResponse: ApiResponse<Record<string, unknown>>;

    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) clearSession();

      const body = error.response.data as Record<string, unknown>;
      errorResponse = {
        statusCode: Number(body?.statusCode ?? error.response.status),
        message: String(body?.message ?? error.message),
        data: {},
        error: body?.error ? String(body.error) : String(error.response.status),
        errors: body?.errors as ApiResponse['errors'],
      };
    } else {
      errorResponse = {
        statusCode: 0,
        message: error instanceof Error ? error.message : 'Network error',
        data: {},
        error: 'NetworkError',
      };
    }

    return Promise.resolve({ data: errorResponse });
  },
);

export const api = {
  get: <T>(path: string) =>
    axiosInstance.get<ApiResponse<T>>(path).then((r) => r.data),
  post: <T>(path: string, body: unknown) =>
    axiosInstance.post<ApiResponse<T>>(path, body).then((r) => r.data),
  patch: <T>(path: string, body: unknown) =>
    axiosInstance.patch<ApiResponse<T>>(path, body).then((r) => r.data),
};

/**
 * Use in TanStack Query queryFn / mutationFn to convert an error ApiResponse
 * into a thrown ApiError so that isError / onError still trigger correctly.
 */
export function unwrap<T>(res: ApiResponse<T>): T {
  if (res.error !== undefined) {
    throw new ApiError({
      message: res.message,
      statusCode: res.statusCode,
      error: res.error,
      errors: res.errors,
    });
  }
  return res.data;
}
