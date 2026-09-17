export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthSignInRequest {
  email: string;
  password: string;
}

export interface AuthSignInResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface ApiErrorResponse {
  success: boolean;
  message?: string;
  errors?: string[];
  error?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token?: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}
