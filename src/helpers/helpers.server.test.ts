/** @jest-environment node */
import { getBaseApiUrl } from './helpers';

describe('getBaseApiUrl on the server', () => {
  it('falls back to env.API_URL and env.APP_URL when no explicit URLs are passed', () => {
    // No configuredUrl/appUrl provided: falls through to env.API_URL and env.APP_URL,
    // both of which are populated (truthy) via the loaded .env file.
    const url = getBaseApiUrl();
    expect(typeof url).toBe('string');
    expect(url.length).toBeGreaterThan(0);
  });

  it('falls back to the hardcoded literals when env values are empty', async () => {
    jest.resetModules();
    jest.doMock('@/config/env', () => ({
      env: { API_URL: '', APP_URL: '', BACKEND_API_URL: '' },
    }));

    try {
      const { getBaseApiUrl: isolatedGetBaseApiUrl } = await import('./helpers');
      const url = isolatedGetBaseApiUrl();
      expect(url).toBe('http://localhost:3000/api/v1');
    } finally {
      jest.dontMock('@/config/env');
      jest.resetModules();
    }
  });
});
