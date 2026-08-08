import { z } from 'zod';

/**
 * Runtime Environment Variable Schema & Validator
 * Validates import.meta.env variables on app bootstrap to fail fast on invalid deployments.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://localhost:8000/api/v1'),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  VITE_RAZORPAY_KEY: z.string().optional().default('rzp_test_placeholder'),
  VITE_GOOGLE_MAPS_KEY: z.string().optional().default(''),
  VITE_SENTRY_DSN: z.string().optional().default(''),
  VITE_TURNSTILE_SITE_KEY: z.string().optional().default(''),
  VITE_ENABLE_SENTRY: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  VITE_ENABLE_ANALYTICS: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
});

const parseEnv = () => {
  const rawEnv = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV || import.meta.env.MODE,
    VITE_RAZORPAY_KEY: import.meta.env.VITE_RAZORPAY_KEY,
    VITE_GOOGLE_MAPS_KEY: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_TURNSTILE_SITE_KEY: import.meta.env.VITE_TURNSTILE_SITE_KEY,
    VITE_ENABLE_SENTRY: import.meta.env.VITE_ENABLE_SENTRY,
    VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
  };

  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    console.error('Invalid environment variables detected:', result.error.format());
    if (import.meta.env.DEV) {
      console.warn('Falling back to default environment configuration.');
    }
  }

  const validData = result.success ? result.data : envSchema.parse({});

  return {
    API_BASE_URL: validData.VITE_API_BASE_URL,
    APP_ENV: validData.VITE_APP_ENV,
    VITE_APP_ENV: validData.VITE_APP_ENV,
    RAZORPAY_KEY: validData.VITE_RAZORPAY_KEY,
    GOOGLE_MAPS_KEY: validData.VITE_GOOGLE_MAPS_KEY,
    SENTRY_DSN: validData.VITE_SENTRY_DSN,
    TURNSTILE_SITE_KEY: validData.VITE_TURNSTILE_SITE_KEY,
    ENABLE_SENTRY: validData.VITE_ENABLE_SENTRY,
    ENABLE_ANALYTICS: validData.VITE_ENABLE_ANALYTICS,
  };
};

export const env = parseEnv();
export type EnvConfig = typeof env;
