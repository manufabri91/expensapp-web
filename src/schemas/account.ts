import { z } from 'zod';
import { ALLOWED_CURRENCIES } from '@/constants';
import { AccountRequest } from '@/types/dto';

export const accountFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Validation.required'),
  currency: z.enum(ALLOWED_CURRENCIES as [string, ...string[]], { error: 'Validation.required' }),
  initialBalance: z.number({ error: 'Validation.invalidNumber' }),
}) satisfies z.ZodType<AccountRequest>;

export type AccountFormValues = z.infer<typeof accountFormSchema>;
