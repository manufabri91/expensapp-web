import { subcategoryFormSchema } from '@/schemas/subcategory';

describe('subcategoryFormSchema', () => {
  const valid = { name: 'Streaming', parentCategoryId: 2 };

  it('accepts a valid subcategory', () => {
    expect(subcategoryFormSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(subcategoryFormSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('rejects a missing parentCategoryId', () => {
    expect(subcategoryFormSchema.safeParse({ name: 'Streaming' }).success).toBe(false);
  });

  it('rejects a non-positive parentCategoryId', () => {
    expect(subcategoryFormSchema.safeParse({ ...valid, parentCategoryId: 0 }).success).toBe(false);
  });
});
