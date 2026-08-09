import { accountFormSchema } from '@/schemas/account';

describe('accountFormSchema', () => {
  const valid = { name: 'Checking', currency: 'USD', initialBalance: 100 };

  it('accepts a valid account', () => {
    expect(accountFormSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a negative initial balance (debt accounts are valid)', () => {
    expect(accountFormSchema.safeParse({ ...valid, initialBalance: -50 }).success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = accountFormSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a currency outside the allowed list', () => {
    const result = accountFormSchema.safeParse({ ...valid, currency: 'GBP' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-numeric initial balance', () => {
    const result = accountFormSchema.safeParse({ ...valid, initialBalance: 'abc' });
    expect(result.success).toBe(false);
  });
});
