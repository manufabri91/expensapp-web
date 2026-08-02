import { CategoryResponse, SubCategoryResponse } from '@/types/dto';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { TransactionType } from '@/types/enums/transactionType';

export interface RecurringTransactionResponse {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  accountId: number;
  accountName: string;
  category: CategoryResponse;
  subcategory: SubCategoryResponse;
  frequency: RecurrenceFrequency;
  intervalDays: number | null;
  daysOfMonth: number[];
  startDate: string;
  endDate: string | null;
  status: RecurrenceStatus;
  lastGeneratedDate: string | null;
  nextDueDate: string | null;
  excludeFromTotals: boolean;
}
