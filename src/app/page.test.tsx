import RootPage from './page';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('RootPage Routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to /users when authentication token exists in cookies', async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: 'valid-token' }),
    });

    await RootPage();

    expect(redirect).toHaveBeenCalledWith('/users');
  });

  it('redirects to /auth/login when no authentication token exists in cookies', async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    });

    await RootPage();

    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });
});
