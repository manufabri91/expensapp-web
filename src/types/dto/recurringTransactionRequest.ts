import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { TransactionType } from '@/types/enums/transactionType';

export interface RecurringTransactionRequest {
  id?: number;
  type: TransactionType;
  amount: number;
  description: string;
  accountId: number;
  categoryId: number;
  subcategoryId: number;
  frequency: RecurrenceFrequency;
  intervalDays?: number;
  daysOfMonth?: number[];
  startDate: string;
  endDate?: string | null;
  excludeFromTotals?: boolean;
}
