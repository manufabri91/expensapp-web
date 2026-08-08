import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';

export type UpcomingTransactionSourceType = 'RECURRING' | 'ONE_TIME';

export interface UpcomingTransactionItem {
  sourceType: UpcomingTransactionSourceType;
  sourceId: number;
  date: string;
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
