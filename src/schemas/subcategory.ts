import { z } from 'zod';
import { SubCategoryRequest } from '@/types/dto/subcategoryRequest';

export const subcategoryFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Validation.required'),
  parentCategoryId: z.number({ error: 'Validation.required' }).positive('Validation.required'),
}) satisfies z.ZodType<Omit<SubCategoryRequest, 'readOnly'>>;

export type SubcategoryFormValues = z.infer<typeof subcategoryFormSchema>;
