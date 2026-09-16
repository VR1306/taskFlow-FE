import { apiClient } from '@/services/api';
import {
  AuthSignInRequest,
  AuthSignInResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
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
};

export default authService;
