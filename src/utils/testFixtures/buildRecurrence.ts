import { RecurringTransactionResponse } from '@/types/dto';
import { Icon } from '@/types/enums/icon';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { TransactionType } from '@/types/enums/transactionType';

export const buildRecurrence = (overrides: Partial<RecurringTransactionResponse> = {}): RecurringTransactionResponse => ({
  id: 1,
  type: TransactionType.EXPENSE,
  amount: 9.99,
  description: 'Streaming subscription',
  accountId: 1,
  accountName: 'Checking',
  category: { id: 1, name: 'Subscriptions', iconName: Icon.NONE, color: '#fff', type: TransactionType.EXPENSE, readOnly: false },
  subcategory: { id: 1, name: 'Streaming', parentCategoryId: 1, parentCategoryName: 'Subscriptions', readonly: false },
  frequency: RecurrenceFrequency.INTERVAL_DAYS,
  intervalDays: 30,
  daysOfMonth: [],
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: null,
  status: RecurrenceStatus.ACTIVE,
  lastGeneratedDate: null,
  nextDueDate: null,
  excludeFromTotals: false,
  ...overrides,
});
