import { apiClient } from '@/services/api';
import {
  AuthSignInRequest,
  AuthSignInResponse,
  RefreshTokenResponse,
  LogoutResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '@/types';

export const authService = {
  signIn: async (credentials: Readonly<AuthSignInRequest>): Promise<AuthSignInResponse> => {
    return apiClient.post<AuthSignInResponse>('/auth/signIn', {
      email: credentials.email.trim(),
      password: credentials.password,
      rememberMe: Boolean(credentials.rememberMe),
    });
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return apiClient.post<RefreshTokenResponse>(
      '/auth/refresh-token',
      { refreshToken },
      { skipAuthRefresh: true }
    );
  },

  logout: async (refreshToken?: string): Promise<LogoutResponse> => {
    return apiClient.post<LogoutResponse>('/auth/logout', refreshToken ? { refreshToken } : {}, {
      skipAuthRefresh: true,
    });
  },

  forgotPassword: async (
    payload: Readonly<ForgotPasswordRequest>
  ): Promise<ForgotPasswordResponse> => {
    return apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', {
      email: payload.email.trim(),
    });
  },

  resetPassword: async (
    payload: Readonly<ResetPasswordRequest>
  ): Promise<ResetPasswordResponse> => {
    const endpoint = payload.token
      ? `/auth/reset-password?token=${encodeURIComponent(payload.token)}`
      : '/auth/reset-password';
    return apiClient.post<ResetPasswordResponse>(endpoint, {
      token: payload.token,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
    });
  },

  changePassword: async (
    payload: Readonly<ChangePasswordRequest>
  ): Promise<ChangePasswordResponse> => {
    return apiClient.post<ChangePasswordResponse>('/auth/change-password', {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword,
    });
  },
};

export default authService;
