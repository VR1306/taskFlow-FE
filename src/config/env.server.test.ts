/** @jest-environment node */
import dotenv from 'dotenv';

jest.mock('dotenv', () => ({ config: jest.fn() }));

describe('server environment configuration', () => {
  const originalEnvironment = process.env;

  afterEach(() => {
    process.env = originalEnvironment;
  });

  it.each([
    {
      values: {},
      app: 'http://localhost:3000',
      api: '/api/v1',
      backend: 'https://task-flow-be-eight.vercel.app/api/v1',
    },
    {
      values: {
        NEXT_PUBLIC_APP_URL: 'https://app.example',
        NEXT_PUBLIC_API_URL: '/gateway',
        NEXT_PUBLIC_BACKEND_API_URL: 'https://public.example',
      },
      app: 'https://app.example',
      api: '/gateway',
      backend: 'https://public.example',
    },
    {
      values: {
        BACKEND_API_URL: 'https://private.example',
        NEXT_PUBLIC_BACKEND_API_URL: 'https://public.example',
      },
      app: 'http://localhost:3000',
      api: '/api/v1',
      backend: 'https://private.example',
    },
  ])('resolves explicit values and defaults: $backend', ({ values, app, api, backend }) => {
    process.env = { NODE_ENV: 'test', ...values };
    jest.isolateModules(() => {
      const { env } = jest.requireActual<typeof import('./env')>('./env');
      expect(env.APP_URL).toBe(app);
      expect(env.API_URL).toBe(api);
      expect(env.BACKEND_API_URL).toBe(backend);
    });
    expect(dotenv.config).toHaveBeenCalledWith({ quiet: true });
  });
});
