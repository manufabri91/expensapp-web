import useSWR from 'swr';
import { getTransactions } from '@/lib/actions/transactions';
import { TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';
import { TransactionFilters, transactionFiltersToQueryParams } from '@/types/viewModel/transactionFilters';

export const useTransactions = (filters: TransactionFilters, initialData?: PagedResponse<TransactionResponse>) => {
  const queryParams = transactionFiltersToQueryParams(filters);

  return useSWR(`/api/transaction${queryParams}`, getTransactions, {
    refreshInterval: 5 * 60 * 1000,
    fallbackData: initialData,
  });
};
