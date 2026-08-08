import { categoryFormSchema } from '@/schemas/category';
import { Icon } from '@/types/enums/icon';
import { TransactionType } from '@/types/enums/transactionType';

describe('categoryFormSchema', () => {
  const valid = { name: 'Groceries', type: TransactionType.EXPENSE, iconName: Icon.CART, color: '#ff0000' };

  it('accepts a valid category', () => {
    expect(categoryFormSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts Icon.NONE and an empty color', () => {
    const result = categoryFormSchema.safeParse({
      name: 'Groceries',
      type: TransactionType.EXPENSE,
      iconName: Icon.NONE,
      color: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing iconName', () => {
    expect(categoryFormSchema.safeParse({ name: 'Groceries', type: TransactionType.EXPENSE, color: '' }).success).toBe(
      false
    );
  });

  it('rejects an empty name', () => {
    expect(categoryFormSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('rejects TRANSFER as a category type', () => {
    expect(categoryFormSchema.safeParse({ ...valid, type: TransactionType.TRANSFER }).success).toBe(false);
  });

  it('rejects a non-hex color', () => {
    expect(categoryFormSchema.safeParse({ ...valid, color: 'red' }).success).toBe(false);
  });
});
