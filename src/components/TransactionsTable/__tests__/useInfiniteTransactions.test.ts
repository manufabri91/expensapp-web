import useSWRInfinite from 'swr/infinite';
import { useInfiniteTransactions } from '@/components/TransactionsTable/useInfiniteTransactions';
import { getTransactions } from '@/lib/actions/transactions';
import { TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';
import { TransactionFilters } from '@/types/viewModel/transactionFilters';

jest.mock('swr/infinite');
jest.mock('@/lib/actions/transactions', () => ({ getTransactions: jest.fn() }));

const mockedUseSWRInfinite = useSWRInfinite as jest.Mock;

const FILTERS: TransactionFilters = {
  currentPage: 1,
  totalPages: 1,
  size: 10,
  sortBy: 'eventDate',
  ascending: false,
  fromDate: new Date('2024-06-01'),
  toDate: new Date('2024-06-30'),
};

describe('useInfiniteTransactions', () => {
  beforeEach(() => {
    mockedUseSWRInfinite.mockReturnValue({ data: undefined, isLoading: true, size: 1, setSize: jest.fn(), mutate: jest.fn() });
  });

  it('passes no fallbackData when no initial page is provided', () => {
    useInfiniteTransactions(FILTERS);

    const [, , options] = mockedUseSWRInfinite.mock.calls[0];
    expect(options).toEqual({ fallbackData: undefined });
  });

  it('seeds SWRInfinite with a single-page fallbackData array when an initial page is provided', () => {
    const initialData = { content: [] } as unknown as PagedResponse<TransactionResponse>;

    useInfiniteTransactions(FILTERS, initialData);

    const [, , options] = mockedUseSWRInfinite.mock.calls[0];
    expect(options).toEqual({ fallbackData: [initialData] });
  });

  it('uses getTransactions as the per-page fetcher, built from the page-specific query params', () => {
    useInfiniteTransactions(FILTERS);

    const [, fetcher] = mockedUseSWRInfinite.mock.calls[0];
    fetcher(['recent-transactions', 0, '?page=0'] as const);

    expect(getTransactions).toHaveBeenCalledWith('/api/transaction?page=0');
  });
});
