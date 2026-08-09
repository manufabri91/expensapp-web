import {
  oneTimeTransactionSchema,
  recurringTransactionSchema,
  recurringTransactionServerSchema,
  transactionServerSchema,
} from '@/schemas/transaction';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { TransactionType } from '@/types/enums/transactionType';

describe('oneTimeTransactionSchema', () => {
  const validExpense = {
    amount: 50,
    type: TransactionType.EXPENSE,
    account: 1,
    category: 2,
    subcategory: 3,
    description: 'Groceries',
    excludeFromTotals: false,
    eventDate: new Date('2024-01-15'),
  };

  it('accepts a valid expense and transforms eventDate to a UTC-midnight ISO timestamp', () => {
    const result = oneTimeTransactionSchema.safeParse(validExpense);
    expect(result.success).toBe(true);
    if (result.success) {
      // Bare "YYYY-MM-DD" fails Jackson deserialization into the backend's OffsetDateTime field -
      // it must be a full timestamp with an offset.
      expect(result.data.eventDate).toBe('2024-01-15T00:00:00.000Z');
      expect(result.data.categoryId).toBe(2);
      expect(result.data.subcategoryId).toBe(3);
    }
  });

  it('rejects a negative amount', () => {
    expect(oneTimeTransactionSchema.safeParse({ ...validExpense, amount: -50 }).success).toBe(false);
  });

  it('rejects a zero amount', () => {
    expect(oneTimeTransactionSchema.safeParse({ ...validExpense, amount: 0 }).success).toBe(false);
  });

  it('requires category, subcategory, and description for a non-transfer type', () => {
    const result = oneTimeTransactionSchema.safeParse({
      ...validExpense,
      category: undefined,
      subcategory: undefined,
      description: undefined,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path[0]);
      expect(paths).toEqual(expect.arrayContaining(['category', 'subcategory', 'description']));
    }
  });

  it('requires a destination account for a transfer', () => {
    const result = oneTimeTransactionSchema.safeParse({
      ...validExpense,
      type: TransactionType.TRANSFER,
      category: undefined,
      subcategory: undefined,
      description: undefined,
      destinationAccount: undefined,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a transfer whose destination account matches the origin account', () => {
    const result = oneTimeTransactionSchema.safeParse({
      ...validExpense,
      type: TransactionType.TRANSFER,
      category: undefined,
      subcategory: undefined,
      description: undefined,
      destinationAccount: 1,
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid transfer, omits category/subcategory, and fills a placeholder description', () => {
    const result = oneTimeTransactionSchema.safeParse({
      ...validExpense,
      type: TransactionType.TRANSFER,
      category: undefined,
      subcategory: undefined,
      description: undefined,
      destinationAccount: 2,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBeUndefined();
      expect(result.data.subcategoryId).toBeUndefined();
      expect(result.data.destinationAccountId).toBe(2);
      // The backend requires a non-blank description on every transaction (@NotBlank) even
      // though it immediately overwrites this value server-side for transfers.
      expect(result.data.description).toBe('TRANSFER.OUT.DESCRIPTION');
    }
  });
});

describe('recurringTransactionSchema', () => {
  const validRecurring = {
    amount: 9.99,
    type: TransactionType.EXPENSE,
    account: 1,
    category: 2,
    subcategory: 3,
    description: 'Streaming',
    excludeFromTotals: false,
    frequency: RecurrenceFrequency.INTERVAL_DAYS,
    intervalDays: 30,
    daysOfMonth: [],
    startDate: new Date('2024-01-01'),
    hasEndDate: false,
  };

  it('accepts a valid interval-based recurrence', () => {
    const result = recurringTransactionSchema.safeParse(validRecurring);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBe('2024-01-01T00:00:00.000Z');
      expect(result.data.endDate).toBeNull();
      expect(result.data.intervalDays).toBe(30);
      expect(result.data.daysOfMonth).toBeUndefined();
    }
  });

  it('requires intervalDays when frequency is INTERVAL_DAYS', () => {
    const result = recurringTransactionSchema.safeParse({ ...validRecurring, intervalDays: undefined });
    expect(result.success).toBe(false);
  });

  it('requires at least one day of month when frequency is MONTHLY_DAYS', () => {
    const result = recurringTransactionSchema.safeParse({
      ...validRecurring,
      frequency: RecurrenceFrequency.MONTHLY_DAYS,
      daysOfMonth: [],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid monthly-days recurrence and drops intervalDays from the output', () => {
    const result = recurringTransactionSchema.safeParse({
      ...validRecurring,
      frequency: RecurrenceFrequency.MONTHLY_DAYS,
      daysOfMonth: [1, 15],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.daysOfMonth).toEqual([1, 15]);
      expect(result.data.intervalDays).toBeUndefined();
    }
  });

  it('rejects an end date that is not after the start date', () => {
    const result = recurringTransactionSchema.safeParse({
      ...validRecurring,
      hasEndDate: true,
      endDate: new Date('2023-12-31'),
    });
    expect(result.success).toBe(false);
  });

  it('accepts an end date after the start date', () => {
    const result = recurringTransactionSchema.safeParse({
      ...validRecurring,
      hasEndDate: true,
      endDate: new Date('2024-06-01'),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.endDate).toBe('2024-06-01T00:00:00.000Z');
    }
  });
});

describe('server-side schemas', () => {
  it('transactionServerSchema accepts the already-transformed client output shape', () => {
    const result = transactionServerSchema.safeParse({
      amount: 50,
      eventDate: '2024-01-15',
      description: 'Groceries',
      accountId: 1,
      categoryId: 2,
      subcategoryId: 3,
      type: TransactionType.EXPENSE,
      excludeFromTotals: false,
    });
    expect(result.success).toBe(true);
  });

  it('transactionServerSchema rejects a non-positive amount', () => {
    expect(transactionServerSchema.safeParse({ amount: 0, accountId: 1, type: TransactionType.EXPENSE }).success).toBe(
      false
    );
  });

  it('recurringTransactionServerSchema accepts the already-transformed client output shape', () => {
    const result = recurringTransactionServerSchema.safeParse({
      type: TransactionType.EXPENSE,
      amount: 9.99,
      description: 'Streaming',
      accountId: 1,
      categoryId: 2,
      subcategoryId: 3,
      frequency: RecurrenceFrequency.INTERVAL_DAYS,
      intervalDays: 30,
      startDate: '2024-01-01',
      endDate: null,
    });
    expect(result.success).toBe(true);
  });
});
