import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { TransactionType } from '@/types/enums/transactionType';

export interface TransactionFormValues {
  id?: number;
  amount: number;
  type: TransactionType;
  account?: number;
  destinationAccount?: number;
  category?: number;
  subcategory?: number;
  description: string;
  excludeFromTotals: boolean;
  eventDate?: Date;
  frequency: RecurrenceFrequency;
  intervalDays?: number;
  daysOfMonth: number[];
  startDate?: Date;
  endDate?: Date;
  hasEndDate: boolean;
}
