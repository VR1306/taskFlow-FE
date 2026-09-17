import { apiClient } from '@/services/api';
import {
  AuthSignInRequest,
  AuthSignInResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@/types';

export const authService = {
  signIn: async (credentials: Readonly<AuthSignInRequest>): Promise<AuthSignInResponse> => {
    return apiClient.post<AuthSignInResponse>('/auth/signIn', {
      email: credentials.email.trim(),
      password: credentials.password,
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
};

export default authService;
