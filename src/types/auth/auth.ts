export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export interface AuthSignInRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthSignInResponse {
  success: boolean;
  message: string;
  token: string;
  accessToken?: string;
  refreshToken?: string;
  rememberMe?: boolean;
  defaultModule?: string;
  redirectUrl?: string;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  token: string;
  accessToken: string;
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken?: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
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
