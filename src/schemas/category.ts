import { z } from 'zod';
import { CategoryRequest } from '@/types/dto';
import { Icon } from '@/types/enums/icon';
import { TransactionType } from '@/types/enums/transactionType';

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export const categoryFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Validation.required'),
  type: z
    .enum(TransactionType, { error: 'Validation.required' })
    .refine((value) => value !== TransactionType.TRANSFER, { error: 'Validation.required' }),
  iconName: z.enum(Icon),
  color: z.string().refine((value) => value === '' || HEX_COLOR_REGEX.test(value), { error: 'Validation.invalidColor' }),
}) satisfies z.ZodType<CategoryRequest>;

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
