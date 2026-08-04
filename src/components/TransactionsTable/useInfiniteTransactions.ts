import useSWRInfinite, { unstable_serialize } from 'swr/infinite';
import { getTransactions } from '@/lib/actions/transactions';
import { TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';
import { TransactionFilters, transactionFiltersToQueryParams } from '@/types/viewModel/transactionFilters';

export const RECENT_TRANSACTIONS_KEY = 'recent-transactions';

type InfinitePageKey = readonly [typeof RECENT_TRANSACTIONS_KEY, number, string];

const buildGetKey =
  (baseFilters: TransactionFilters) =>
  (pageIndex: number, previousPage: PagedResponse<TransactionResponse> | null): InfinitePageKey | null => {
    if (previousPage && previousPage.last) return null;
    const params = transactionFiltersToQueryParams({ ...baseFilters, currentPage: pageIndex + 1 });
    return [RECENT_TRANSACTIONS_KEY, pageIndex, params] as const;
  };

export const useInfiniteTransactions = (
  baseFilters: TransactionFilters,
  initialData?: PagedResponse<TransactionResponse>
) =>
  useSWRInfinite<PagedResponse<TransactionResponse>>(
    buildGetKey(baseFilters),
    ([, , params]) => getTransactions(`/api/transaction${params}`),
    { fallbackData: initialData ? [initialData] : undefined }
  );

// The real `$inf$`-prefixed cache key useSWRInfinite subscribes to for these filters.
// A filter-function mutate() can't reach it (SWR skips `/^\$(inf|sub)\$/` keys there),
// so callers outside this hook must target it directly via this key.
export const getRecentTransactionsCacheKey = (baseFilters: TransactionFilters) =>
  unstable_serialize(buildGetKey(baseFilters));
