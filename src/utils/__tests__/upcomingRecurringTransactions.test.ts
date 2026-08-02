import { AccountResponse, RecurringTransactionResponse } from '@/types/dto';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { TransactionType } from '@/types/enums/transactionType';
import { buildRecurrence as buildBaseRecurrence } from '@/utils/testFixtures/buildRecurrence';
import { groupUpcomingRecurringTransactions } from '@/utils/upcomingRecurringTransactions';

const REFERENCE_DATE = new Date('2024-06-10T12:00:00.000Z');

const buildAccount = (overrides: Partial<AccountResponse> = {}): AccountResponse => ({
  id: 1,
  name: 'Checking',
  currency: 'USD',
  accountBalance: 0,
  initialBalance: 0,
  ...overrides,
});

// Layers this file's own defaults (an active monthly recurrence already due later this month, the
// scenario most tests here start from) on top of the shared fixture's neutral ones.
const buildRecurrence = (overrides: Partial<RecurringTransactionResponse> = {}): RecurringTransactionResponse =>
  buildBaseRecurrence({
    amount: 10,
    frequency: RecurrenceFrequency.MONTHLY_DAYS,
    intervalDays: null,
    daysOfMonth: [15],
    status: RecurrenceStatus.ACTIVE,
    nextDueDate: '2024-06-15T00:00:00.000Z',
    ...overrides,
  });

describe('groupUpcomingRecurringTransactions', () => {
  it('includes an active recurrence due later this month', () => {
    const groups = groupUpcomingRecurringTransactions(
      [buildRecurrence({ nextDueDate: '2024-06-15T00:00:00.000Z' })],
      [buildAccount()],
      TransactionType.EXPENSE,
      REFERENCE_DATE
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].items).toHaveLength(1);
  });

  it('excludes recurrences of a different transaction type', () => {
    const groups = groupUpcomingRecurringTransactions(
      [buildRecurrence({ type: TransactionType.INCOME })],
      [buildAccount()],
      TransactionType.EXPENSE,
      REFERENCE_DATE
    );

    expect(groups).toHaveLength(0);
  });

  it.each([RecurrenceStatus.PAUSED, RecurrenceStatus.CANCELLED])('excludes a %s recurrence', (status) => {
    const groups = groupUpcomingRecurringTransactions(
      [buildRecurrence({ status })],
      [buildAccount()],
      TransactionType.EXPENSE,
      REFERENCE_DATE
    );

    expect(groups).toHaveLength(0);
  });

  it('excludes a recurrence with no next due date', () => {
    const groups = groupUpcomingRecurringTransactions(
      [buildRecurrence({ nextDueDate: null })],
      [buildAccount()],
      TransactionType.EXPENSE,
      REFERENCE_DATE
    );

    expect(groups).toHaveLength(0);
  });

  it('excludes a recurrence whose next due date is before today (pending backfill)', () => {
    const groups = groupUpcomingRecurringTransactions(
      [buildRecurrence({ nextDueDate: '2024-06-01T00:00:00.000Z' })],
      [buildAccount()],
      TransactionType.EXPENSE,
      REFERENCE_DATE
    );

    expect(groups).toHaveLength(0);
  });

  it('excludes a recurrence whose next due date falls in a later month', () => {
    const groups = groupUpcomingRecurringTransactions(
      [buildRecurrence({ nextDueDate: '2024-07-01T00:00:00.000Z' })],
      [buildAccount()],
      TransactionType.EXPENSE,
      REFERENCE_DATE
    );

    expect(groups).toHaveLength(0);
  });

  it('includes a recurrence due today and one due on the last day of the month', () => {
    const groups = groupUpcomingRecurringTransactions(
      [
        buildRecurrence({ id: 1, nextDueDate: '2024-06-10T00:00:00.000Z' }),
        buildRecurrence({ id: 2, nextDueDate: '2024-06-30T00:00:00.000Z' }),
      ],
      [buildAccount()],
      TransactionType.EXPENSE,
      REFERENCE_DATE
    );

    expect(groups[0].items.map((item) => item.recurrence.id)).toEqual([1, 2]);
  });

  it('groups recurrences into separate entries per account currency', () => {
    const groups = groupUpcomingRecurringTransactions(
      [
        buildRecurrence({ id: 1, accountId: 1, amount: 10 }),
        buildRecurrence({ id: 2, accountId: 2, amount: 20 }),
      ],
      [buildAccount({ id: 1, currency: 'USD' }), buildAccount({ id: 2, currency: 'EUR' })],
      TransactionType.EXPENSE,
      REFERENCE_DATE
    );

    expect(groups).toHaveLength(2);
    expect(groups.find((group) => group.currency === 'USD')?.total).toBe(-10);
    expect(groups.find((group) => group.currency === 'EUR')?.total).toBe(-20);
  });

  it('excludes a recurrence whose account no longer exists', () => {
    const groups = groupUpcomingRecurringTransactions(
      [buildRecurrence({ accountId: 999 })],
      [buildAccount({ id: 1 })],
      TransactionType.EXPENSE,
      REFERENCE_DATE
    );

    expect(groups).toHaveLength(0);
  });

  it('negates the amount for expenses and keeps it positive for incomes', () => {
    const expenseGroups = groupUpcomingRecurringTransactions(
      [buildRecurrence({ amount: 15, type: TransactionType.EXPENSE })],
      [buildAccount()],
      TransactionType.EXPENSE,
      REFERENCE_DATE
    );
    const incomeGroups = groupUpcomingRecurringTransactions(
      [buildRecurrence({ amount: 15, type: TransactionType.INCOME })],
      [buildAccount()],
      TransactionType.INCOME,
      REFERENCE_DATE
    );

    expect(expenseGroups[0].items[0].signedAmount).toBe(-15);
    expect(incomeGroups[0].items[0].signedAmount).toBe(15);
  });

  it('sorts items within a currency group by next due date ascending', () => {
    const groups = groupUpcomingRecurringTransactions(
      [
        buildRecurrence({ id: 1, nextDueDate: '2024-06-28T00:00:00.000Z' }),
        buildRecurrence({ id: 2, nextDueDate: '2024-06-11T00:00:00.000Z' }),
        buildRecurrence({ id: 3, nextDueDate: '2024-06-20T00:00:00.000Z' }),
      ],
      [buildAccount()],
      TransactionType.EXPENSE,
      REFERENCE_DATE
    );

    expect(groups[0].items.map((item) => item.recurrence.id)).toEqual([2, 3, 1]);
  });

  it('sums the total across every item in the same currency group', () => {
    const groups = groupUpcomingRecurringTransactions(
      [
        buildRecurrence({ id: 1, amount: 10 }),
        buildRecurrence({ id: 2, amount: 25 }),
      ],
      [buildAccount()],
      TransactionType.EXPENSE,
      REFERENCE_DATE
    );

    expect(groups[0].total).toBe(-35);
  });
});
