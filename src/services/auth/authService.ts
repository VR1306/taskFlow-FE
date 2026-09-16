import { apiClient } from '@/services/api';
import { AuthSignInRequest, AuthSignInResponse } from '@/types';

export const authService = {
  signIn: async (credentials: Readonly<AuthSignInRequest>): Promise<AuthSignInResponse> => {
    return apiClient.post<AuthSignInResponse>('/auth/signIn', {
      email: credentials.email.trim(),
      password: credentials.password,
    });
  },
};

export default authService;
