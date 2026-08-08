import { UpcomingTransactionItem } from '@/types/dto';
import { Icon } from '@/types/enums/icon';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';

export const buildUpcomingTransactionItem = (
  overrides: Partial<UpcomingTransactionItem> = {}
): UpcomingTransactionItem => ({
  sourceType: 'RECURRING',
  sourceId: 1,
  date: '2024-06-15T00:00:00.000Z',
  description: 'Streaming subscription',
  categoryIconName: Icon.NONE,
  categoryColor: '#fff',
  accountId: 1,
  signedAmount: -9.99,
  frequency: RecurrenceFrequency.INTERVAL_DAYS,
  intervalDays: 30,
  daysOfMonth: [],
  ...overrides,
});
