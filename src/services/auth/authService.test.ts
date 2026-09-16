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
});
