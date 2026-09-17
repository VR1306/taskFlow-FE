import { authService } from './authService';
import { apiClient } from '@/services/api';

jest.mock('@/services/api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('Auth Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls apiClient.post with trimmed email and credentials', async () => {
    const mockResponse = {
      success: true,
      message: 'Sign-in successful!',
      token: 'jwt-token-xyz',
      user: {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authService.signIn({
      email: '  john@example.com  ',
      password: 'SuperSecretPassword',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/signIn', {
      email: 'john@example.com',
      password: 'SuperSecretPassword',
    });
    expect(result).toEqual(mockResponse);
  });

  it('calls apiClient.post with trimmed email for forgotPassword', async () => {
    const mockResponse = {
      success: true,
      message: 'Password reset link successfully dispatched to your email address!',
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authService.forgotPassword({
      email: '  user@taskflow.io   ',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'user@taskflow.io',
    });
    expect(result).toEqual(mockResponse);
  });

  it('calls apiClient.post with token query and body for resetPassword', async () => {
    const mockResponse = {
      success: true,
      message: 'Password reset successful!',
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authService.resetPassword({
      token: 'test-token-123',
      password: 'NewStrongPassword@123',
      confirmPassword: 'NewStrongPassword@123',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password?token=test-token-123', {
      token: 'test-token-123',
      password: 'NewStrongPassword@123',
      confirmPassword: 'NewStrongPassword@123',
    });
    expect(result).toEqual(mockResponse);
  });
});
