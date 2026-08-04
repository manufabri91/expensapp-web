import useSWR from 'swr';
import { getFilteredTotals } from '@/lib/actions/transactions';
import { CurrencySummaryResponse } from '@/types/dto';
import { TransactionFilters, transactionFiltersToQueryParams } from '@/types/viewModel/transactionFilters';

export const useFilteredTotals = (filters: TransactionFilters, fallbackTotals?: CurrencySummaryResponse[]) => {
  const queryParams = transactionFiltersToQueryParams(filters);

  return useSWR(`/api/transaction/totals${queryParams}`, getFilteredTotals, { fallbackData: fallbackTotals });
};
