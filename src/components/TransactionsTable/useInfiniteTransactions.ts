import useSWRInfinite from 'swr/infinite';
import { getTransactions } from '@/lib/actions/transactions';
import { TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';
import { TransactionFilters, transactionFiltersToQueryParams } from '@/types/viewModel/transactionFilters';

export const RECENT_TRANSACTIONS_KEY = 'recent-transactions';

type InfinitePageKey = readonly [typeof RECENT_TRANSACTIONS_KEY, number, string];

export const isRecentTransactionsFirstPageKey = (key: unknown): key is InfinitePageKey =>
  Array.isArray(key) && key[0] === RECENT_TRANSACTIONS_KEY && key[1] === 0;

export const useInfiniteTransactions = (baseFilters: TransactionFilters) => {
  const getKey = (pageIndex: number, previousPage: PagedResponse<TransactionResponse> | null): InfinitePageKey | null => {
    if (previousPage && previousPage.last) return null;
    const params = transactionFiltersToQueryParams({ ...baseFilters, currentPage: pageIndex + 1 });
    return [RECENT_TRANSACTIONS_KEY, pageIndex, params] as const;
  };

  return useSWRInfinite<PagedResponse<TransactionResponse>>(getKey, ([, , params]) =>
    getTransactions(`/api/transaction${params}`)
  );
};
