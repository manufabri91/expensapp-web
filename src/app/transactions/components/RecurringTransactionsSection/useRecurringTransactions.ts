import useSWR from 'swr';
import { getRecurringTransactions } from '@/lib/actions/recurringTransactions';
import { RecurringTransactionResponse } from '@/types/dto';

export const useRecurringTransactions = (initialData?: RecurringTransactionResponse[]) =>
  useSWR('/api/recurring-transaction', getRecurringTransactions, { fallbackData: initialData });
