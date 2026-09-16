import dotenv from 'dotenv';

// Ensure environment variables are loaded in server runtimes and node environments
if (typeof window === 'undefined') {
  dotenv.config({ quiet: true });
}

export const env = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV,
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

export type EnvConfig = typeof env;
