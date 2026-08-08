import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';

export type UpcomingTransactionSourceType = 'RECURRING' | 'ONE_TIME';

export interface UpcomingTransactionItem {
  sourceType: UpcomingTransactionSourceType;
  sourceId: number;
  /**
   * Null only for an ended RECURRING item - an active/paused recurrence whose endDate has already
   * passed, so it has no next occurrence left. `/summary/programmed-transactions` lists those (they
   * still need to be manageable) and sorts them last; `/summary/upcoming-transactions` excludes
   * them. ONE_TIME items always carry a date.
   */
  date: string | null;
  description: string;
  categoryIconName: string;
  categoryColor: string;
  accountId: number;
  signedAmount: number;
  frequency: RecurrenceFrequency | null;
  intervalDays: number | null;
  daysOfMonth: number[] | null;
}

export interface UpcomingTransactionGroup {
  currency: string;
  total: number;
  items: UpcomingTransactionItem[];
}

export interface UpcomingTransactionsResponse {
  expenses: UpcomingTransactionGroup[];
  incomes: UpcomingTransactionGroup[];
}

export interface ProgrammedTransactionsResponse {
  expenses: UpcomingTransactionItem[];
  incomes: UpcomingTransactionItem[];
}
