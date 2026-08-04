import useSWR from 'swr';
import { useTransactions } from '@/components/TransactionsTable/useTransactions';
import { getTransactions } from '@/lib/actions/transactions';
import { TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';
import { TransactionFilters, transactionFiltersToQueryParams } from '@/types/viewModel/transactionFilters';

jest.mock('swr');
jest.mock('@/lib/actions/transactions', () => ({ getTransactions: jest.fn() }));

const mockedUseSWR = useSWR as jest.Mock;

const FILTERS: TransactionFilters = {
  currentPage: 1,
  totalPages: 1,
  size: 10,
  sortBy: 'eventDate',
  ascending: false,
  fromDate: new Date('2024-06-01'),
  toDate: new Date('2024-06-30'),
};

describe('useTransactions', () => {
  beforeEach(() => {
    mockedUseSWR.mockReturnValue({ data: undefined, isLoading: true, mutate: jest.fn() });
  });

  it('keys SWR off the filters-derived query string and uses getTransactions as the fetcher', () => {
    useTransactions(FILTERS);

    const [key, fetcher] = mockedUseSWR.mock.calls[0];
    expect(key).toBe(`/api/transaction${transactionFiltersToQueryParams(FILTERS)}`);
    expect(fetcher).toBe(getTransactions);
  });

  it('refreshes every 5 minutes and forwards initialData as SWR fallbackData', () => {
    const initialData = { content: [] } as unknown as PagedResponse<TransactionResponse>;

    useTransactions(FILTERS, initialData);

    const [, , options] = mockedUseSWR.mock.calls[0];
    expect(options).toMatchObject({ refreshInterval: 5 * 60 * 1000, fallbackData: initialData });
  });
});
