import useSWR from 'swr';
import { useProgrammedTransactions } from '@/app/transactions/components/ProgrammedTransactionsSection/useProgrammedTransactions';
import { getProgrammedTransactions } from '@/lib/actions/summaries';
import { ProgrammedTransactionsResponse } from '@/types/dto';
import { buildUpcomingTransactionItem } from '@/utils/testFixtures/buildUpcomingTransactionItem';

jest.mock('swr');
jest.mock('@/lib/actions/summaries', () => ({ getProgrammedTransactions: jest.fn() }));

const mockedUseSWR = useSWR as jest.Mock;

describe('useProgrammedTransactions', () => {
  beforeEach(() => {
    mockedUseSWR.mockReturnValue({ data: undefined, isLoading: true, mutate: jest.fn() });
  });

  it('keys SWR off the programmed-transactions cache key and uses getProgrammedTransactions as the fetcher', () => {
    useProgrammedTransactions();

    const [key, fetcher] = mockedUseSWR.mock.calls[0];
    expect(key).toBe('/api/summary/programmed-transactions');
    expect(fetcher).toBe(getProgrammedTransactions);
  });

  it('forwards initialData as SWR fallbackData', () => {
    const initialData: ProgrammedTransactionsResponse = {
      expenses: [buildUpcomingTransactionItem()],
      incomes: [],
    };

    useProgrammedTransactions(initialData);

    const [, , options] = mockedUseSWR.mock.calls[0];
    expect(options).toMatchObject({ fallbackData: initialData });
  });
});
