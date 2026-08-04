import { useEffect } from 'react';
import { TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';
import { TransactionFilters } from '@/types/viewModel/transactionFilters';

// Keeps the shared filters context's pagination fields (currentPage/size/totalPages) in sync with
// whatever page the backend actually returned, since the requested page can differ once totals
// change (e.g. a deletion shrinks the last page).
export const usePaginationSync = (
  data: PagedResponse<TransactionResponse> | undefined,
  patchFilters: (filters: Partial<TransactionFilters>) => void
) => {
  useEffect(() => {
    if (data) {
      patchFilters({
        currentPage: data.pageable.pageNumber + 1,
        size: data.pageable.size,
        totalPages: data.totalPages,
      });
    }
  }, [data, patchFilters]);
};
