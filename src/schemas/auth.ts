import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Validation.invalidEmail'),
  password: z.string().min(1, 'Validation.required'),
  remember: z.boolean(),
});

export const registerSchema = loginSchema
  .extend({
    firstName: z.string().min(1, 'Validation.required'),
    lastName: z.string().min(1, 'Validation.required'),
    userName: z.string().min(1, 'Validation.required'),
    passwordRepeat: z.string().min(1, 'Validation.required'),
  })
  .refine((data) => data.password === data.passwordRepeat, {
    error: 'Validation.passwordsDontMatch',
    path: ['passwordRepeat'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
