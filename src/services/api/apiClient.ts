import { env } from '@/config/env';
import { ApiErrorResponse } from '@/types';

export class ApiError extends Error {
  public readonly status: number;
  public readonly errors?: string[];
  public readonly data?: unknown;

  constructor(message: string, status: number, errors?: string[], data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.data = data;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

const getBaseUrl = (): string => {
  const configuredUrl = env.API_URL || '/api/v1';
  const cleanUrl = configuredUrl.endsWith('/') ? configuredUrl.slice(0, -1) : configuredUrl;

  if (typeof window === 'undefined' && !cleanUrl.startsWith('http')) {
    const appUrl = env.APP_URL || 'http://localhost:3000';
    const cleanAppUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
    return `${cleanAppUrl}${cleanUrl}`;
  }

  return cleanUrl;
};

export async function apiRequest<T>(
  endpoint: string,
  options: Readonly<RequestOptions> = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const config: RequestInit = {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  };

  const response = await fetch(url, config);

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorPayload = data as ApiErrorResponse | null;
    let errorMessage =
      errorPayload?.message ||
      errorPayload?.error ||
      `Request failed with status ${response.status}`;

    if (errorPayload?.errors && errorPayload.errors.length > 0) {
      errorMessage = errorPayload.errors.join('. ');
    }

    throw new ApiError(errorMessage, response.status, errorPayload?.errors, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: Readonly<RequestOptions>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: Readonly<RequestOptions>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),
  put: <T>(endpoint: string, body?: unknown, options?: Readonly<RequestOptions>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),
  delete: <T>(endpoint: string, options?: Readonly<RequestOptions>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
