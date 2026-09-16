import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { error: 'Work email is required' })
    .pipe(z.email({ error: 'Please enter a valid work email address' })),
  password: z
    .string()
    .min(1, { error: 'Password is required' })
    .min(6, { error: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
