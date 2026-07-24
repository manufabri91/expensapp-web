import useSWR from 'swr';
import { getFilteredTotals } from '@/lib/actions/transactions';
import { TransactionFilters, transactionFiltersToQueryParams } from '@/types/viewModel/transactionFilters';

export const useFilteredTotals = (filters: TransactionFilters) => {
  const queryParams = transactionFiltersToQueryParams(filters);

  return useSWR(`/api/transaction/totals${queryParams}`, getFilteredTotals);
};
