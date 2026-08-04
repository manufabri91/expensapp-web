import { renderHook } from '@testing-library/react';
import { usePaginationSync } from '@/components/TransactionsTable/usePaginationSync';
import { TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';

const buildPage = (overrides: Partial<PagedResponse<TransactionResponse>> = {}): PagedResponse<TransactionResponse> => ({
  content: [],
  pageable: { sort: { empty: true, sorted: false, unsorted: true }, offset: 0, pageNumber: 0, size: 10, paged: true, unpaged: false },
  totalPages: 1,
  totalElements: 0,
  last: true,
  first: true,
  numberOfElements: 0,
  size: 10,
  number: 0,
  sort: { unsorted: true, empty: true, sorted: false },
  empty: true,
  ...overrides,
});

describe('usePaginationSync', () => {
  it('does not patch filters when there is no data yet', () => {
    const patchFilters = jest.fn();

    renderHook(() => usePaginationSync(undefined, patchFilters));

    expect(patchFilters).not.toHaveBeenCalled();
  });

  it('patches currentPage/size/totalPages from the fetched page once data arrives', () => {
    const patchFilters = jest.fn();
    const data = buildPage({ pageable: { sort: { empty: true, sorted: false, unsorted: true }, offset: 20, pageNumber: 2, size: 20, paged: true, unpaged: false }, totalPages: 5 });

    renderHook(() => usePaginationSync(data, patchFilters));

    expect(patchFilters).toHaveBeenCalledWith({ currentPage: 3, size: 20, totalPages: 5 });
  });

  it('re-syncs when a new page of data is provided', () => {
    const patchFilters = jest.fn();
    const { rerender } = renderHook(({ data }) => usePaginationSync(data, patchFilters), {
      initialProps: { data: buildPage({ totalPages: 1 }) },
    });
    expect(patchFilters).toHaveBeenCalledTimes(1);

    rerender({ data: buildPage({ totalPages: 2 }) });

    expect(patchFilters).toHaveBeenCalledTimes(2);
    expect(patchFilters).toHaveBeenLastCalledWith({ currentPage: 1, size: 10, totalPages: 2 });
  });
});
