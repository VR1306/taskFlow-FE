import { ApiErrorResponse } from '@/types';
import { authStorage, getBaseApiUrl } from '@/helpers';

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
  skipAuthRefresh?: boolean;
  skipAuthToken?: boolean;
}

const getBaseUrl = (): string => getBaseApiUrl();

// Global refresh promise to synchronize simultaneous 401s
let activeRefreshPromise: Promise<string | null> | null = null;

const requestNewAccessToken = async (baseUrl: string): Promise<string | null> => {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    authStorage.clearAuthSession();
    return null;
  }

  try {
    const refreshUrl = `${baseUrl}/auth/refresh-token`;
    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      authStorage.clearAuthSession();
      return null;
    }

    const data = await response.json();
    const newAccessToken = (data.accessToken || data.token) as string;
    const newRefreshToken = (data.refreshToken || refreshToken) as string;

    if (newAccessToken) {
      authStorage.setTokens(newAccessToken, newRefreshToken);
      return newAccessToken;
    }

    authStorage.clearAuthSession();
    return null;
  } catch {
    authStorage.clearAuthSession();
    return null;
  }
};

const executeTokenRefresh = async (baseUrl: string): Promise<string | null> => {
  activeRefreshPromise ??= requestNewAccessToken(baseUrl).finally(() => {
    activeRefreshPromise = null;
  });
  return activeRefreshPromise;
};

const isAuthBypassEndpoint = (endpoint: string): boolean => {
  return (
    endpoint.includes('/auth/signIn') ||
    endpoint.includes('/auth/refresh-token') ||
    endpoint.includes('/auth/refreshToken') ||
    endpoint.includes('/auth/forgot-password') ||
    endpoint.includes('/auth/reset-password')
  );
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

  // Automatically attach Bearer token if not explicitly disabled or set
  if (!options.skipAuthToken && !headers.Authorization && !headers.authorization) {
    const token = authStorage.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  };

  let response = await fetch(url, config);

  // If 401 Unauthorized and not an auth exclusion, attempt transparent token refresh & retry
  if (response.status === 401 && !options.skipAuthRefresh && !isAuthBypassEndpoint(cleanEndpoint)) {
    const newAccessToken = await executeTokenRefresh(baseUrl);
    if (newAccessToken) {
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newAccessToken}`,
      };
      response = await fetch(url, {
        ...config,
        headers: retryHeaders,
      });
    }
  }

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

/**
 * Uploads a FormData payload (e.g. a file attachment). The multipart boundary is set
 * automatically by the browser, so Content-Type is intentionally left unset here.
 */
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  options: Readonly<RequestOptions> = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (!options.skipAuthToken && !headers.Authorization) {
    const token = authStorage.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { method: 'POST', headers, body: formData });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorPayload = data as ApiErrorResponse | null;
    throw new ApiError(
      errorPayload?.message || `Request failed with status ${response.status}`,
      response.status,
      errorPayload?.errors,
      data
    );
  }

  return data as T;
}

/**
 * Downloads a binary response (e.g. a task attachment) as a Blob for preview or save.
 */
export async function apiDownloadBlob(
  endpoint: string,
  options: Readonly<RequestOptions> = {}
): Promise<Blob> {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (!options.skipAuthToken && !headers.Authorization) {
    const token = authStorage.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { method: 'GET', headers });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorPayload = (await response.json()) as ApiErrorResponse;
      message = errorPayload?.message || message;
    } catch {
      // Response body wasn't JSON — keep the generic message
    }
    throw new ApiError(message, response.status);
  }

  return response.blob();
}

export const apiClient = {
  get: <T>(endpoint: string, options?: Readonly<RequestOptions>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: Readonly<RequestOptions>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),
  put: <T>(endpoint: string, body?: unknown, options?: Readonly<RequestOptions>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),
  patch: <T>(endpoint: string, body?: unknown, options?: Readonly<RequestOptions>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),
  delete: <T>(endpoint: string, options?: Readonly<RequestOptions>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
  upload: <T>(endpoint: string, formData: FormData, options?: Readonly<RequestOptions>) =>
    apiUpload<T>(endpoint, formData, options),
  downloadBlob: (endpoint: string, options?: Readonly<RequestOptions>) =>
    apiDownloadBlob(endpoint, options),
};

export default apiClient;
